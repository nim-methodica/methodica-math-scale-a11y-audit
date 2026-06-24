---
name: accessibility-qa
description: >-
  Accessibility QA review of an interactive HTML/CSS/JS e-learning module (לומדה) against
  WCAG 2.1 AA + the Israeli standard IS 5568 (ת"י 5568). Use when the user asks to check / audit /
  בדוק נגישות / "בקרת נגישות" / a11y-review an HTML learning deliverable (index.html + script.js +
  styles.css + assets, RTL Hebrew, Ministry of Education). Runs a deterministic static scan
  (scan.py) PLUS a live in-browser audit (preview + axe-core, keyboard walk, computed contrast),
  then produces a per-issue Markdown + HTML report with file:line citation, severity, the violated
  WCAG criterion, and a concrete fix recommendation. It does NOT edit the code — report only.
  Not for .pptx training scripts (that is script-qa) and not for question files (v.md).
---

# Accessibility-QA — בקרת נגישות ללומדות HTML

סקיל המייצר **דוח נגישות מפורט לפי ממצא** על לומדה אינטראקטיבית מבוססת HTML/CSS/JS, מול
**WCAG 2.1 רמה AA** ו**ת"י 5568** (התקן הישראלי לנגישות תכנים באינטרנט). **הסקיל לא מתקן** — הוא
מזהה, מצטט וממליץ, וההחלטה לתקן היא של המפתח/ת.

## עקרונות-על

1. **דיווח בלבד.** לעולם אל תערוך את קוד הלומדה (index.html / script.js / styles.css). רק דוח.
2. **סטטי + דינמי — שני המסלולים חובה.** הרבה מהתוכן מוזרק בזמן ריצה ע"י JS, ונגישות אמיתית
   (פוקוס, ניגודיות מחושבת, ניווט מקלדת) נמדדת רק על ה-DOM החי. סריקה סטטית לבדה **תפספס**.
3. **כל ממצא = ציטוט + מיקום (file:line) + קריטריון WCAG + המלצה.** בלי מיקום מדויק אין ממצא.
4. **כיסוי מלא — לא מדגם.** עבור על **כל מסך** (דרך פונקציית-הניווט האמיתית `goTo(n)` — לא רק
   המסך הראשון, לא רק החלפת-class), **כל תמונה** (נוכחות + איכות-alt + תקינות-טעינה), ו**כל רכיב
   אינטראקטיבי**. דווח על **כל מופע** (אם 12 כפתורים בלי שם — כל 12). אסור "ועוד"/"etc.". אסור
   לכתוב "תקין" על מסך/מצב שלא רונדר ונבדק בפועל. אסור להסיק ממצא מ-CSS בלבד — אמת על ה-DOM החי.
5. **הנח שיש בעיות.** המשימה היא לצוד אותן. קוד שמשתמש ב-ARIA לא בהכרח נגיש — בדוק לעומק.
6. **דטרמיניסטי מול שיפוטי.** הבדיקות המכניות רצות ב-`scan.py` + axe-core (כיסוי מובטח);
   השיפוטיות (איכות alt, סדר טאב הגיוני, בהירות הודעות) בקריאת-שיפוט.

## קובצי reference (קרא לפי הצורך)

- `references/wcag-checks.md` ⭐ — קטלוג הבדיקות: לכל בדיקה קריטריון WCAG, מיפוי לת"י 5568, חומרה,
  איך מזהים (סטטי/דינמי), וניסוח-המלצה. **קרא תמיד לפני כתיבת הדוח.**
- `references/israeli-standard.md` ⭐ — מה ת"י 5568 דורש מעבר ל-WCAG: RTL/עברית, הצהרת נגישות,
  התאמות מנדטוריות, והערות לתוכן חינוכי של משרד החינוך.
- `references/dynamic-audit.md` ⭐ — איך מריצים את הביקורת החיה: preview server, הזרקת axe-core,
  מעבר-מקלדת (keyboard walk), בדיקת פוקוס/מלכודת-פוקוס במודלים, reflow ב-200%/320px.
- `references/report-template.md` — שלד הדוח, דרגות חומרה, render ל-HTML.

## תהליך העבודה

### 1. זיהוי קלט
התוצר הוא **תיקיית לומדה** ובה `index.html`, `script.js`, `styles.css`, ו-`assets/`
(לרוב תחת `learning-demo/methodica-…-NN/`). אם יש כמה תת-מודולים (01-01, 01-02, …) — בדוק אחד בכל
הרצה אלא אם התבקש אחרת; שאל איזה אם לא ברור. אמת שקיים `index.html` לפני שתמשיך.

### 2. סריקה סטטית דטרמיניסטית (חובה)
הרץ את הסורק על קובצי הלומדה — הוא מבטיח כיסוי מלא של הבדיקות המכניות (כל מופע, עם מספרי-שורה):
```bash
PYTHONUTF8=1 python "<skill>/scripts/scan.py" "<module-dir>"
```
- הסורק מקבל **תיקייה** (קורא את index.html/styles.css/script.js שבה) ומדפיס ממצאים לפי `file:line`.
- מכסה: lang/dir/title, alt חסר, שם-נגיש לכפתורים/קישורים, onclick ללא תמיכת-מקלדת, tabindex חיובי,
  outline:none, ניגודיות צבעים (heuristic מ-CSS), id כפול, aria-* ל-id לא קיים, סדר כותרות,
  viewport חוסם-זום, autoplay, GIF מונפש, video/audio ללא כתוביות. ראה `wcag-checks.md`.
- הפלט הוא **בסיס** — לא תחליף לביקורת החיה. בדיקות ניגודיות סטטיות הן הערכה (לא רואות צבעים מוזרקים).

### 3. ביקורת חיה בדפדפן (חובה)
הפעל את הלומדה ובדוק את ה-DOM החי. ראה `references/dynamic-audit.md` לפרטים המלאים. בתמצית:
1. `preview_start` על תיקיית המודול (יש `serve.py`/`launch.json` בפרויקט — אפשר להיעזר).
2. הזרק את **axe-core** דרך `preview_eval` והרץ `axe.run()` על כל מסך — אסוף את כל ה-violations.
3. **מעבר-מקלדת:** Tab/Shift+Tab דרך כל אלמנט אינטראקטיבי — ודא פוקוס נראה, סדר הגיוני, שכל
   `onclick` נגיש גם ב-Enter/Space, ושמודלים לוכדים פוקוס ונסגרים ב-Esc.
4. **מעבר מסכים:** הלומדה מזריקה תוכן per-screen (data-screen 0..N). עבור בין המסכים והרץ axe על כל אחד —
   תוכן שמופיע רק בזמן ריצה לא נתפס בסטטי.
5. **ניגודיות מחושבת:** דגום טקסטים מול הרקע בפועל (`getComputedStyle`) — זה הקובע, לא ה-CSS הגולמי.
6. **reflow/zoom:** `preview_resize` ל-320px רוחב ובדוק 200% זום — אין גלילה אופקית/חיתוך תוכן.

### 4. הצלבה ואיחוד
מזג את ממצאי הסטטי + axe + המעבר הידני. הסר כפילויות (אותו ממצא משני מקורות = שורה אחת).
כל ממצא ממופה לקריטריון WCAG ולחומרה לפי `wcag-checks.md`.

### 5. כתיבת הדוח
לפי `references/report-template.md`: דוח `report.md` מאורגן לפי קטגוריה/קריטריון, טבלה עם
`חומרה+קריטריון | מיקום (file:line) | ציטוט | המלצת תיקון | מה הפתרון פותר`, סיכום חומרות למעלה,
וטבלת כיסוי של כל הבדיקות בסוף (✅ תקין / ממצא / ➖ לא רלוונטי+סיבה).

### 6. render ל-HTML
```bash
node "<skill>/scripts/md-to-html.js" "<report.md>"
```
מייצר `report.html` מעוצב (RTL, צבעי-חומרה, עוגנים). מסור למשתמש את שני הקבצים.

## מה הסקיל הזה הוא לא
- **לא עורך קוד.** רק מדווח.
- **לא בודק .pptx** — לזה יש `script-qa`.
- **לא תחליף לבדיקת נגישות אנושית מוסמכת** עם קוראי-מסך אמיתיים. axe-core תופס ~30-40% מהבעיות;
  השאר דורש שיפוט אנושי. הדוח אומר זאת במפורש.
