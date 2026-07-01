# ביקורת חיה בדפדפן — הזרקת axe-core, מעבר-מקלדת, ניגודיות מחושבת

הרבה מתוכן הלומדה מוזרק בזמן ריצה (מסכים `data-screen 0..N` שמתחלפים ב-JS). בדיקה סטטית לבדה
מפספסת. שלב זה **חובה** ומשתמש בכלי `preview_*` (לא Bash, לא Chrome-MCP).

## 1. הפעלת השרת
```
preview_start  → על תיקיית המודול (זו עם index.html)
```
בפרויקט יש `serve.py` ו-`.claude/launch.json` — אפשר להיעזר בהם להבנת ה-entry/port. ודא ש-index.html
נטען בלי שגיאות: `preview_console_logs`, `preview_logs`.

## 2. הזרקת axe-core והרצה על כל מסך
axe-core הוא מנוע בדיקת-הנגישות הסטנדרטי. הזרק אותו מ-CDN והרץ:
```js
// preview_eval — טען את axe פעם אחת
await (async () => {
  if (!window.axe) {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
    document.head.appendChild(s);
    await new Promise(r => { s.onload = r; });
  }
  const res = await axe.run(document, { resultTypes: ['violations'] });
  return res.violations.map(v => ({
    id: v.id, impact: v.impact, help: v.help, wcag: v.tags.filter(t=>t.startsWith('wcag')),
    nodes: v.nodes.map(n => ({ target: n.target, html: n.html.slice(0,160) }))
  }));
})();
```
- **אסוף violations על כל מסך בנפרד.** עבור בין מסכים (ראה §4) והרץ axe מחדש על כל אחד — תוכן
  מוזרק קיים ב-DOM רק כשהמסך פעיל.
- אם אין רשת ל-CDN: הורד את axe.min.js מראש ל-assets זמני, או הסתמך על בדיקות ידניות + scan.py.
- כל violation → ממצא: מפה את `v.wcag` לקריטריון בקטלוג, את `impact` לחומרה (critical/serious→🔴,
  moderate→🟠, minor→🔵), וצטט את `nodes[].html` + `target` כמיקום.

## 3. מעבר-מקלדת (keyboard walk) — לא נתפס ע"י axe
axe לא בודק שמישהו *יכול* להפעיל רכיב במקלדת בפועל. בדוק ידנית:
- **Tab / Shift+Tab** דרך כל המסך — רשום את סדר-העצירות. ודא:
  - הסדר הגיוני (RTL: ימין→שמאל, למעלה→למטה) — #14.
  - **כל עצירה מציגה חיווי-פוקוס נראה** — #13. (בדוק `:focus`/`:focus-visible` ב-DOM החי.)
  - אין רכיב פעיל שמדלגים עליו, ואין רכיב לא-אינטראקטיבי שתופס פוקוס.
- **Enter ו-Space** על כל רכיב עם `role` אינטראקטיבי (radio/button/option) — ודא שמפעיל את אותה
  פעולה כמו קליק — #11. (זה הבדיקה ל-122 onclick.)
- **מודלים** (`role="dialog"`): בפתיחה הפוקוס נכנס פנימה; Tab לא בורח החוצה (#12); Esc סוגר ומחזיר
  פוקוס לכפתור-הפותח.
- סימולציית מקש דרך preview: `preview_click`/`preview_fill` ל-DOM, או `preview_eval` עם
  `el.focus()` + `dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}))` כדי לאמת שיש מאזין.

## 4. מעבר בין מסכי הלומדה — חובת כיסוי מלא ⚠️
**אסור לבדוק רק את המסך הפעיל הראשון, ואסור להסתפק בהחלפת `class="active"`.** החלפת-class
מציגה רק תוכן **סטטי**; תוכן רב (אפשרויות, משוב, חלונות-רמז, **GIF-ים, תרגילי-גרירה**) מוזרק ע"י JS
**רק בניווט אמיתי**. בדיקה שלא מנווטת באמת תפספס מסכים שלמים ותדווח "תקין" על מה שלא נבדק.

**הדרך הנכונה — קראו לפונקציית-הניווט של הלומדה עצמה** (לרוב `goTo(n)`; בדקו גם `showScreen`/
`gotoScreen`). היא מרנדרת כל מסך כפי שהאפליקציה מתכוונת, כולל תוכן מוזרק:
```js
// preview_eval — אֶתחול helper שמכסה כל מסך דרך הניווט האמיתי
const N = document.querySelectorAll('.screen[data-screen]').length;
const navFn = ['goTo','showScreen','gotoScreen','navigateTo'].find(f => typeof window[f]==='function');
// לולאה: for (let i=0;i<N;i++){ window[navFn](i); await wait(20); /* axe + images + contrast + interactive על המסך הפעיל */ }
```
- **בכל מסך** הריצו: axe (§2), ניגודיות מחושבת (§5), אינוונטר תמונות+alt (§8), ואינוונטר רכיבים
  אינטראקטיביים (§9). אגרגו לפי בדיקה עם מספרי-המסכים.
- **חלקו ל-batches של ~6 מסכים per `preview_eval`** — axe על 15+ מסכים בקריאה אחת חורג מ-30שנ'.
  אם נתקעתם: `window.location.reload()`, הזריקו axe מחדש, והריצו טווח קטן יותר.
- **מצבים שמאחורי אינטראקציה** (משוב נכון/שגוי, חלון-רמז, מצב-נבחר) אינם עולים מ-`goTo` לבד —
  הפעילו אותם (`preview_click`/בחירת-תשובה) ובדקו גם אותם, או ציינו במפורש בדוח שלא נבדקו.
- **אל תסיקו ממצא מ-CSS בלבד.** נוכחות token (למשל צבע-בועה) ב-CSS **אינה** אומרת שהוא מתרנדר
  במודול — אמתו על ה-DOM החי בכל מסך. אקסטרפולציה מ-CSS היא מקור-טעות מוכח.

## 5. ניגודיות מחושבת (הקובע — לא ה-CSS הגולמי)
**אזהרת-זהב:** אם הרקע האפקטיבי הוא `linear-gradient`/`background-image` — `backgroundColor` מחזיר
שקוף, וההליכה-מעלה "תקפוץ" לרקע לבן ותדווח יחס שגוי (טקסט-לבן-על-לבן = 1:1 על כפתור צבעוני).
ה-snippet שלהלן **מסמן** מקרים כאלה כ-`bgIsGradient` במקום לדווח כשל — אמת אותם ידנית
(`preview_inspect`/screenshot). אל תכלול אותם כממצאים בלי אימות.
```js
// preview_eval — דגום טקסטים וחשב יחס מול הרקע בפועל (מדלג על רקעי-gradient)
(() => {
  function lum(c){const[r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});
    return .2126*r+.7152*g+.0722*b;}
  function ratio(f,b){const L1=lum(f),L2=lum(b);return (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);}
  function rgb(s){const m=s&&s.match(/[\d.]+/g);return m?m.slice(0,3).map(Number):null;}
  const out=[], manual=[];
  for(const el of document.querySelectorAll('h1,h2,h3,h4,p,span,button,a,label,li')){
    // טקסט-ישיר בלבד (לא כולל טקסט של צאצאים)
    const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');
    if(txt.length<2||!el.offsetParent) continue;
    const cs=getComputedStyle(el); const fg=rgb(cs.color); if(!fg) continue;
    // מצא רקע אטום ראשון מההורים — וזהה gradient/image בדרך
    let bg=null,grad=false,n=el;
    while(n){const st=getComputedStyle(n);
      if(st.backgroundImage&&st.backgroundImage!=='none'){grad=true;break;}
      const b=rgb(st.backgroundColor); const a=st.backgroundColor.match(/[\d.]+\)$/);
      if(b&&(!a||parseFloat(a[0])>0)){bg=b;break;} n=n.parentElement;}
    const fs=parseFloat(cs.fontSize), bold=+cs.fontWeight>=700;
    const need=(fs>=24||(fs>=18.66&&bold))?3:4.5;
    if(grad){ manual.push({text:txt.slice(0,40),fg:cs.color,note:'רקע gradient/image — בדוק ידנית'}); continue; }
    if(!bg) continue;
    const r=ratio(fg,bg);
    if(r<need) out.push({text:txt.slice(0,40),ratio:+r.toFixed(2),need,fontSize:fs,fg:cs.color,bg:`rgb(${bg.join(',')})`});
  }
  return {fails:out, manualCheck:manual};
})();
```
- `fails` = כשלים ודאיים (#23). `manualCheck` = רקעי-gradient — אמת ידנית לפני שתכליל.
- אם הטקסט נמשך על כמה אלמנטים, השתמש ב-`fg`+הגודל לזיהוי הכלל ב-CSS.
כל פריט שחוזר עם `ratio < need` = ממצא #23 (טקסט) — צטט את היחס, הזוג (fg/bg) והגודל.
לרכיבים גרפיים (גבולות/אייקונים) — בדיקה ויזואלית + getComputedStyle לגבול (#24).

## 6. Reflow וזום
- `preview_resize` לרוחב **320px** — בדוק אין גלילה אופקית / חיתוך / חפיפה (#26). הקנבס הקבוע
  1280×710 הוא סיכון מובהק — תעד התנהגותו.
- זום 200%: `preview_eval` → `document.body.style.zoom='2'` (או הגדל viewport) ובדוק קריאות.

## 7. ראיות לדוח
- `preview_screenshot` למסך עם בעיה ויזואלית (ניגודיות/פוקוס/reflow).
- העתק את פלט axe ואת רשימת הניגודיות אל הדוח כמיקומים מצוטטים.
- **אזהרה בדוח:** axe מכסה חלק; פוקוס/סדר-טאב/איכות-alt נבדקו ידנית; בדיקה סופית דורשת קורא-מסך אמיתי.

## 8. אינוונטר תמונות + alt (נוכחות, איכות, תקינות) — על כל מסך דרך `goTo`
```js
// לכל מסך: אסוף כל img — src, alt, האם נטענה, האם דקורטיבית
[...document.querySelector('.screen.active').querySelectorAll('img')].map(im => ({
  src: im.getAttribute('src'), alt: im.getAttribute('alt'), hasAlt: im.hasAttribute('alt'),
  broken: im.complete && im.naturalWidth === 0,   // תמונה שלא נטענה (#6)
  ariaHidden: im.getAttribute('aria-hidden')
}));
```
שלוש שכבות-בדיקה ל-alt (אל תסתפק בנוכחות):
1. **נוכחות (#6, 🔴):** `<img>` ללא `alt`.
2. **דקורטיבי נכון:** תמונת-קישוט (thumbnail/רקע) צריכה `alt=""` — *זה תקין, לא ממצא.* אל תדווח עליו.
3. **איכות (#6/#1.4.5, 🟠 שיפוטי):** תמונת-תוכן שה-alt שלה **טופוגרפי בלבד** ("מפה"/"תרשים") בעוד
   השאלה דורשת נתון שבתמונה (מידה/יחס/ערך) — תלמיד קורא-מסך לא יוכל לפתור. ודא שהנתון קיים גם
   בטקסט הנראה, אחרת ה-alt חייב לכלול אותו.
4. **תקינות:** `broken=true` = הקובץ לא נטען (נתיב/שם שגוי) — דווח (#6).
5. **התאמה:** alt שסותר את התוכן (שם-קובץ "Airplane" עם alt "חללית") — דגל לשיפוט.
6. **מדיה מוזרקת:** GIF שמוזרק ע"י JS (`img.src` מוגדר ב-script) **לא יופיע בקובץ הסטטי** — תופסים
   אותו רק כאן, על המסך החי. GIF מונפש = #8.

## 9. אינוונטר רכיבים אינטראקטיביים — על כל מסך דרך `goTo`
```js
// לכל מסך: מצא כל רכיב פעיל ובדוק שם-נגיש + יכולת-מיקוד + מקלדת
[...document.querySelector('.screen.active').querySelectorAll('button,a,input,select,textarea,[role],[onclick],[draggable="true"]')]
  .forEach(el => { /* בדוק: accessible-name? focusable (native או tabindex≥0)? draggable? */ });
```
חישוב **שם-נגיש** חייב לכלול: `aria-label` → `aria-labelledby` → **`<label>` עוטף** (implicit) →
**`alt` של `<img>` צאצא** → textContent. (אל תדלג על שתי האחרונות — אחרת תדווח NO-NAME כוזב על
radio-עם-תמונה או input-בתוך-label.) דגלים: `NO-NAME` (#17/#28), `NOT-FOCUSABLE` (אלמנט פעיל בלי
`tabindex`), `DRAGGABLE` (#33 — ודא חלופת-מקלדת). אמת חי: `el.focus()` → אם `document.activeElement`
אינו האלמנט = לא ניתן למיקוד = כשל ודאי.

## עיקרון-על: כיסוי מלא, לא מדגם
עבור **כל** מסך, **כל** תמונה (נוכחות+איכות+תקינות), **כל** רכיב אינטראקטיבי. הצלב את ממצאי axe,
הניגודיות והאינוונטרים מול scan.py. אם משהו לא נבדק (מצב-אינטראקציה, מסך שלא הגעת אליו) — אמור זאת
**במפורש** בדוח. לעולם אל תכתוב "תקין" על מה שלא רנדרת ובדקת בפועל.
