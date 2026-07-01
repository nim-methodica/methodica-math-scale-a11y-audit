#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
scan.py — סורק נגישות סטטי דטרמיניסטי (read-only) על תיקיית לומדה HTML/CSS/JS.
מבטיח כיסוי מלא של הבדיקות המכניות, עם מיקום file:line לכל ממצא. לא מתקן — רק מדווח.

שימוש:   PYTHONUTF8=1 python scan.py <module-dir | index.html>
פלט:     ממצאים מקובצים לפי בדיקה (stdout), כל אחד עם file:line — להטמיע/להצליב בדוח הסופי.

הערות:
- זהו בסיס בלבד. ניגודיות אמיתית, פוקוס וניווט-מקלדת נמדדים בביקורת החיה (dynamic-audit.md).
- בדיקות הניגודיות כאן הן הערכה מ-CSS גולמי (זוגות color/background-color באותו בלוק) — לא רואות
  צבעים מוזרקים או ירושה. הקובע הוא getComputedStyle על ה-DOM החי.
"""
import os, re, sys, io
from html.parser import HTMLParser

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# ───────────────────────── קלט ─────────────────────────
if len(sys.argv) < 2:
    print("usage: PYTHONUTF8=1 python scan.py <module-dir | index.html>"); sys.exit(1)

arg = sys.argv[1]
if os.path.isdir(arg):
    base = arg
    html_path = os.path.join(base, "index.html")
else:
    html_path = arg
    base = os.path.dirname(arg) or "."

def read(p):
    try:
        return open(p, encoding="utf-8").read()
    except Exception:
        return ""

html_src = read(html_path)
if not html_src:
    print(f"⚠️  לא נמצא/ריק: {html_path}"); sys.exit(1)

# אסוף CSS ו-JS (קבצים חיצוניים + inline)
css_files = [os.path.join(base, f) for f in os.listdir(base) if f.endswith(".css")] if os.path.isdir(base) else []
js_files  = [os.path.join(base, f) for f in os.listdir(base) if f.endswith(".js") and not f.endswith(".test")] if os.path.isdir(base) else []
css_src = "\n".join(read(p) for p in css_files)
js_src  = "\n".join(read(p) for p in js_files)
# inline
css_src += "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", html_src, re.S))
js_src  += "\n".join(re.findall(r"<script(?![^>]*src=)[^>]*>(.*?)</script>", html_src, re.S))

HTML_FILE = os.path.basename(html_path)
findings = []  # (check_id, name, severity, location, detail)
def add(cid, name, sev, loc, detail):
    findings.append((cid, name, sev, loc, detail))

# ───────────────────────── HTML parsing (line-aware) ─────────────────────────
INTERACTIVE_ROLES = {"button", "link", "radio", "checkbox", "tab", "menuitem",
                     "option", "switch", "slider", "spinbutton", "combobox"}
VALID_ROLES = INTERACTIVE_ROLES | {
    "dialog", "alertdialog", "radiogroup", "group", "tablist", "tabpanel", "list",
    "listitem", "menu", "menubar", "navigation", "main", "banner", "contentinfo",
    "region", "alert", "status", "presentation", "none", "img", "heading", "form",
    "search", "complementary", "article", "document", "application", "toolbar",
    "tree", "treeitem", "grid", "row", "cell", "columnheader", "rowheader", "progressbar"}
NATIVE_INTERACTIVE = {"a", "button", "input", "select", "textarea", "details", "summary"}

class Tag:
    __slots__ = ("name", "attrs", "line", "text", "in_label")
    def __init__(self, name, attrs, line):
        self.name = name; self.attrs = dict(attrs); self.line = line; self.text = ""; self.in_label = False

class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self._stack = []
    def _maybe_img_alt(self, tag, attrs):
        # שם נגיש של רכיב-אב מחושב גם מ-alt של תמונות-בנות (accessible name computation)
        if tag == "img":
            alt = dict(attrs).get("alt", "").strip()
            if alt:
                for a in self._stack:
                    a.text += " " + alt
    def _mark_label_ancestor(self, t):
        # input/select/textarea עטוף ב-<label> מקבל תווית מרומזת (implicit label)
        if t.name in ("input", "select", "textarea") and any(a.name == "label" for a in self._stack):
            t.in_label = True
    def handle_starttag(self, tag, attrs):
        t = Tag(tag, attrs, self.getpos()[0])
        self.tags.append(t)
        self._maybe_img_alt(tag, attrs)
        self._mark_label_ancestor(t)
        if tag not in ("img", "input", "br", "hr", "meta", "link", "source", "track"):
            self._stack.append(t)
    def handle_startendtag(self, tag, attrs):
        t = Tag(tag, attrs, self.getpos()[0])
        self.tags.append(t)
        self._maybe_img_alt(tag, attrs)
        self._mark_label_ancestor(t)
    def handle_data(self, data):
        d = data.strip()
        if d:
            for t in self._stack:
                t.text += " " + d
    def handle_endtag(self, tag):
        for i in range(len(self._stack) - 1, -1, -1):
            if self._stack[i].name == tag:
                del self._stack[i]; break

p = Collector()
p.feed(html_src)
tags = p.tags
def loc(line): return f"{HTML_FILE}:{line}"

# מפת id-ים
all_ids = {}
for t in tags:
    if "id" in t.attrs:
        all_ids.setdefault(t.attrs["id"], []).append(t.line)

# ───────────────────────── בדיקות HTML ─────────────────────────

# #1 lang/dir + #2 title
html_tag = next((t for t in tags if t.name == "html"), None)
if html_tag:
    if html_tag.attrs.get("lang", "").strip() == "":
        add(1, "שפת מסמך (lang)", "🔴", loc(html_tag.line), "ל-<html> אין מאפיין lang. WCAG 3.1.1 (A)")
    if "dir" not in html_tag.attrs:
        add(1, "כיווניות (dir)", "🟠", loc(html_tag.line), "ל-<html> אין dir=\"rtl\" — נדרש לעברית. ת\"י 5568")
title_tag = next((t for t in tags if t.name == "title"), None)
if not title_tag or not title_tag.text.strip():
    add(2, "כותרת הדף (title)", "🟠", f"{HTML_FILE}:<head>", "חסר <title> מתאר. WCAG 2.4.2 (A)")

# #27 viewport zoom block
for t in tags:
    if t.name == "meta" and t.attrs.get("name") == "viewport":
        c = t.attrs.get("content", "")
        if "user-scalable=no" in c.replace(" ", "") or re.search(r"maximum-scale=\s*1(\.0)?\b", c):
            add(27, "חסימת זום (viewport)", "🟠", loc(t.line),
                f"viewport חוסם הגדלה: '{c}'. הסירו user-scalable=no/maximum-scale. WCAG 1.4.4 (AA)")

# #6 img alt
for t in tags:
    if t.name == "img":
        if "alt" not in t.attrs:
            src = t.attrs.get("src", "?")
            add(6, "טקסט חלופי (alt) חסר", "🔴", loc(t.line),
                f"<img src=\"{src}\"> ללא alt. WCAG 1.1.1 (A)")
        elif t.attrs.get("alt", "").strip():
            alt = t.attrs["alt"].strip()
            # alt חשוד = שם-קובץ
            if re.search(r"\.(png|jpe?g|gif|svg|webp)$", alt, re.I) or alt.lower() == t.attrs.get("src","").lower():
                add(6, "alt חשוד (שם-קובץ)", "🟠", loc(t.line),
                    f"alt=\"{alt}\" נראה כשם-קובץ ולא תיאור. WCAG 1.1.1 (A) — לשיפוט")

# #9 video/audio without track/transcript; #10 autoplay
for t in tags:
    if t.name in ("video", "audio"):
        if t.attrs.get("autoplay") is not None or "autoplay" in t.attrs:
            add(10, "autoplay במדיה", "🟠", loc(t.line), f"<{t.name}> עם autoplay. WCAG 1.4.2 (A)")
    if t.name == "video":
        # יש track אחרי? בדיקה גסה: חפש <track> כלשהו
        pass
has_video = any(t.name == "video" for t in tags)
has_track = any(t.name == "track" and t.attrs.get("kind") in ("captions", "subtitles") for t in tags)
if has_video and not has_track:
    add(9, "וידאו ללא כתוביות", "🔴", HTML_FILE, "נמצא <video> ללא <track kind=captions>. WCAG 1.2.2 (A)")

# #8 GIF references (animated content — flag for manual review)
gif_lines = [t.line for t in tags if t.name == "img" and t.attrs.get("src","").lower().endswith(".gif")]
if gif_lines:
    add(8, "GIF מונפש (תוכן נע)", "🔴",
        f"{HTML_FILE}:" + ",".join(map(str, gif_lines)),
        "תמונות GIF — אם מונפשות >5שנ' ואין עצירה זה כשל. ודאו בקרת-עצירה. WCAG 2.2.2 (A)")

# #33 drag-and-drop without keyboard alternative — native HTML5 drag is pointer-only
drag_lines = [t.line for t in tags if t.attrs.get("draggable") == "true"]
drop_handlers = []
for t in tags:
    if any(a in t.attrs for a in ("ondrop", "ondragover", "ondragstart", "ondragend")):
        drop_handlers.append(t.line)
js_has_drag = bool(re.search(r"\b(dragstart|dragover|dragend|ondrop|dataTransfer)\b", js_src))
if drag_lines or drop_handlers or js_has_drag:
    locs = sorted(set(drag_lines + drop_handlers))
    add(33, "גרירה ללא חלופת-מקלדת", "🔴",
        f"{HTML_FILE}:" + (",".join(map(str, locs)) if locs else "(handlers ב-JS)"),
        f"נמצאו {len(drag_lines)} אלמנטים draggable=true ו-{len(drop_handlers)} מאזיני-drop. "
        f"גרירת-HTML5 native היא עכבר/מגע בלבד. ודאו חלופת-מקלדת מלאה (פוקוס+הרמה/הצבה ב-Enter/חיצים) "
        f"ושם/תפקיד/מצב ב-ARIA לכרטיסים ולאזורי-השחרור. WCAG 2.1.1 (A) + 4.1.2 (A)")

# #11 onclick on non-native + keyboard support
onclick_nonnative = []
for t in tags:
    has_onclick = "onclick" in t.attrs
    role = t.attrs.get("role", "")
    if has_onclick and t.name not in NATIVE_INTERACTIVE:
        has_tabindex = "tabindex" in t.attrs
        onclick_nonnative.append((t.line, t.name, role, has_tabindex))
# כמה מאזיני מקלדת יש ב-JS בכלל?
kbd_listeners = len(re.findall(r"(keydown|keyup|keypress)", js_src))
if onclick_nonnative:
    no_tab = [x for x in onclick_nonnative if not x[3]]
    lines = ",".join(str(x[0]) for x in onclick_nonnative)
    add(11, "onclick על אלמנט לא-native", "🔴",
        f"{HTML_FILE}:{lines}",
        f"{len(onclick_nonnative)} אלמנטים לא-native עם onclick (מהם {len(no_tab)} ללא tabindex). "
        f"ב-JS נמצאו {kbd_listeners} מאזיני-מקלדת. ודאו ש-Enter/Space מפעילים כל אחד. WCAG 2.1.1 (A)")

# #15 tabindex positive
for t in tags:
    ti = t.attrs.get("tabindex")
    if ti and ti.lstrip("+").isdigit() and int(ti) > 0:
        add(15, "tabindex חיובי", "🟠", loc(t.line),
            f"tabindex=\"{ti}\" משבש סדר-טאב טבעי. השתמשו ב-0/-1. WCAG 2.4.3 (A)")

# #17 accessible name for interactive
for t in tags:
    role = t.attrs.get("role", "")
    is_interactive = t.name in ("button", "a") or role in INTERACTIVE_ROLES
    if not is_interactive:
        continue
    if t.name == "a" and "href" not in t.attrs and role == "":
        continue
    has_name = (t.text.strip() or t.attrs.get("aria-label", "").strip()
                or t.attrs.get("aria-labelledby", "").strip() or t.attrs.get("title", "").strip()
                or ("img" in [c for c in []]))  # alt של img-בן ייבדק דינמית
    if not has_name:
        add(17, "שם נגיש חסר לרכיב פעיל", "🔴", loc(t.line),
            f"<{t.name} role=\"{role}\"> ללא טקסט/aria-label. WCAG 4.1.2 (A)")

# #18 invalid role
for t in tags:
    role = t.attrs.get("role", "").strip()
    if role and role not in VALID_ROLES:
        add(18, "role לא תקין", "🟠", loc(t.line), f"role=\"{role}\" אינו ערך-ARIA מוכר. WCAG 4.1.2 (A)")
    # role מיותר על native
    if role == "button" and t.name == "button":
        add(18, "role מיותר", "🔵", loc(t.line), "role=\"button\" מיותר על <button>.")

# #20 aria-* referencing ids
for t in tags:
    for attr in ("aria-labelledby", "aria-describedby", "aria-controls"):
        v = t.attrs.get(attr)
        if v:
            for ref in v.split():
                if ref not in all_ids:
                    add(20, "aria מצביע ל-id לא קיים", "🟠", loc(t.line),
                        f"{attr}=\"{ref}\" — אין אלמנט עם id זה. WCAG 1.3.1 (A)")

# #21 aria-hidden on focusable
for t in tags:
    if t.attrs.get("aria-hidden") == "true":
        ti = t.attrs.get("tabindex", "")
        focusable = t.name in NATIVE_INTERACTIVE or (ti and not ti.startswith("-")) or t.attrs.get("role") in INTERACTIVE_ROLES
        if focusable:
            add(21, "aria-hidden על רכיב פעיל", "🟠", loc(t.line),
                f"aria-hidden=\"true\" על <{t.name}> שניתן למקד. WCAG 4.1.2 (A)")

# #5 duplicate ids
for _id, lines in all_ids.items():
    if len(lines) > 1:
        add(5, "id כפול", "🟠", f"{HTML_FILE}:" + ",".join(map(str, lines)),
            f"id=\"{_id}\" מופיע {len(lines)} פעמים. WCAG 4.1.1 (A)")

# #28 inputs without label
labels_for = {t.attrs.get("for") for t in tags if t.name == "label" and "for" in t.attrs}
for t in tags:
    if t.name in ("input", "textarea", "select"):
        if t.attrs.get("type") in ("hidden", "submit", "button", "reset", "image"):
            continue
        has_label = (t.in_label or t.attrs.get("id") in labels_for or t.attrs.get("aria-label", "").strip()
                     or t.attrs.get("aria-labelledby", "").strip())
        if not has_label:
            add(28, "שדה קלט ללא תווית", "🔴", loc(t.line),
                f"<{t.name}> ללא <label>/aria-label (placeholder אינו תווית). WCAG 1.3.1/3.3.2 (A)")

# #3 heading order
heading_lines = [(int(t.name[1]), t.line) for t in tags if re.fullmatch(r"h[1-6]", t.name)]
h1_count = sum(1 for lv, _ in heading_lines if lv == 1)
if h1_count == 0:
    add(3, "אין H1", "🟠", HTML_FILE, "אין <h1> בדף. WCAG 1.3.1 (A)")
prev = 0
for lv, ln in heading_lines:
    if prev and lv > prev + 1:
        add(3, "דילוג רמת כותרת", "🟠", loc(ln), f"מעבר מ-h{prev} ל-h{lv} (דילוג רמה). WCAG 1.3.1 (A)")
    prev = lv

# #4 landmarks
if not any(t.name == "main" or t.attrs.get("role") == "main" for t in tags):
    add(4, "אין landmark ראשי (main)", "🔵", HTML_FILE, "אין <main>/role=main. WCAG 1.3.1 (A) — best practice")

# ───────────────────────── בדיקות CSS ─────────────────────────

# #13 outline:none without alternative
focus_rules = len(re.findall(r":focus", css_src))
_o_sev = "🟠" if focus_rules else "🔴"
_o_note = (f"קיימים {focus_rules} כללי :focus — ודאו ידנית שהם מכסים רכיב זה בניגודיות ≥3:1"
           if focus_rules else "אין אף כלל :focus — חיווי-הפוקוס הוסר לחלוטין")
for m in re.finditer(r"outline\s*:\s*(none|0)\b", css_src):
    line = css_src[:m.start()].count("\n") + 1
    add(13, "הסרת חיווי פוקוס (outline)", _o_sev, f"CSS:{line}",
        f"outline:none — {_o_note}. WCAG 2.4.7 (AA)")

# #30 prefers-reduced-motion
has_anim = bool(re.search(r"@keyframes|animation\s*:|transition\s*:", css_src)) or bool(gif_lines)
has_prm = "prefers-reduced-motion" in css_src
if has_anim and not has_prm:
    add(30, "אין prefers-reduced-motion", "🔵", "CSS",
        "יש אנימציות/מעברים/GIF אך אין @media (prefers-reduced-motion: reduce). WCAG 2.3.3 (AAA)/best-practice")

# #23 contrast heuristic — color + background-color in same rule block
def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3: h = "".join(c*2 for c in h)
    if len(h) != 6: return None
    try: return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    except ValueError: return None

def _lin(c):
    c /= 255.0
    return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4

def luminance(rgb):
    r, g, b = (_lin(x) for x in rgb)
    return 0.2126*r + 0.7152*g + 0.0722*b

def contrast(c1, c2):
    L1, L2 = luminance(c1), luminance(c2)
    hi, lo = max(L1, L2), min(L1, L2)
    return (hi + 0.05) / (lo + 0.05)

# parse simple rule blocks
for block in re.finditer(r"\{([^{}]*)\}", css_src):
    body = block.group(1)
    fg = re.search(r"(?<!-)\bcolor\s*:\s*(#[0-9a-fA-F]{3,6})", body)
    bg = re.search(r"background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})", body)
    if fg and bg:
        c1, c2 = hex_to_rgb(fg.group(1)), hex_to_rgb(bg.group(1))
        if c1 and c2:
            r = contrast(c1, c2)
            if r < 4.5:
                line = css_src[:block.start()].count("\n") + 1
                add(23, "ניגודיות נמוכה (הערכת CSS)", "🟠", f"CSS:{line}",
                    f"{fg.group(1)} על {bg.group(1)} = {r:.2f}:1 (נדרש 4.5:1 לטקסט רגיל). "
                    f"לאמת על ה-DOM החי. WCAG 1.4.3 (AA)")

# ───────────────────────── פלט ─────────────────────────
findings.sort(key=lambda f: (f[0],))
sev_count = {"🔴": 0, "🟠": 0, "🔵": 0}
for f in findings: sev_count[f[2]] += 1

print("═" * 70)
print(f"  סריקת נגישות סטטית — {html_path}")
print(f"  CSS: {len(css_files)} קבצים · JS: {len(js_files)} קבצים · תמונות-GIF: {len(gif_lines)}")
print(f"  סיכום: 🔴 {sev_count['🔴']} חוסמים · 🟠 {sev_count['🟠']} אזהרות · 🔵 {sev_count['🔵']} ליטוש")
print(f"  (סטטי בלבד — חובה להשלים בביקורת חיה: axe-core + מקלדת + ניגודיות מחושבת)")
print("═" * 70)
if not findings:
    print("✅ לא נמצאו ממצאים סטטיים. עדיין חובה לבצע את הביקורת החיה.")
for cid, name, sev, location, detail in findings:
    print(f"\n{sev} #{cid} {name}")
    print(f"   📍 {location}")
    print(f"   {detail}")
print(f"\n— {len(findings)} ממצאים סטטיים. השלם עם dynamic-audit.md לפני כתיבת הדוח. —")
