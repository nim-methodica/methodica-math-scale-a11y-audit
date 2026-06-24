# בקרת נגישות — לומדת "קנה מידה" (methodica-math-scale-01)

בדיקת נגישות מקיפה ל-4 מודולי לומדה אינטראקטיביים (HTML/CSS/JS, עברית RTL, משרד החינוך — תכנית 720),
מול **WCAG 2.1 רמה AA** ו**ת"י 5568**. הבדיקה בוצעה על **כל מסך** בכל מודול בריצה חיה
(scan.py + axe-core + ניגודיות מחושבת + אימות-מקלדת), ולא במדגם.

## הדוחות

| מודול | תיאור | דוח (Markdown) | דוח מעוצב (HTML) |
|---|---|---|---|
| **סיכום** | כל המודולים + פתרונות גלובליים | [SUMMARY.md](accessibility-report-SUMMARY.md) | [HTML](https://htmlpreview.github.io/?https://github.com/nim-methodica/methodica-math-scale-a11y-audit/blob/main/accessibility-report-SUMMARY.html) |
| 01-01 | לימוד + תרגול (24 מסכים) | [01-01.md](accessibility-report-01-01.md) | [HTML](https://htmlpreview.github.io/?https://github.com/nim-methodica/methodica-math-scale-a11y-audit/blob/main/accessibility-report-01-01.html) |
| 01-02 | תרגול בסיסי (9 מסכים) | [01-02.md](accessibility-report-01-02.md) | [HTML](https://htmlpreview.github.io/?https://github.com/nim-methodica/methodica-math-scale-a11y-audit/blob/main/accessibility-report-01-02.html) |
| 01-03 | משימת כיתה (3 מסכים) | [01-03.md](accessibility-report-01-03.md) | [HTML](https://htmlpreview.github.io/?https://github.com/nim-methodica/methodica-math-scale-a11y-audit/blob/main/accessibility-report-01-03.html) |
| 01-04 | תרגול מתקדם (18 מסכים) | [01-04.md](accessibility-report-01-04.md) | [HTML](https://htmlpreview.github.io/?https://github.com/nim-methodica/methodica-math-scale-a11y-audit/blob/main/accessibility-report-01-04.html) |

> קובצי ה-`.md` מתרנדרים ישירות ב-GitHub. קישורי ה-HTML (דרך htmlpreview) מציגים את העיצוב המלא
> כולל הרחבות-הקוד הנפתחות.

## תמצית הממצאים
- **🔴 חוסמים:** תרגיל-גרירה ללא חלופת-מקלדת (01-04), GIF משוב מונפש (01-04), ניגודיות טקסט (01-01),
  שדות-קלט ללא תווית (כל המודולים).
- **🟠 אזהרות:** חיווי-פוקוס חלש, reflow (קנבס קבוע), היעדר/כפילות H1.
- **🔵 ליטוש:** היעדר `<main>`, היעדר `prefers-reduced-motion`.

כל ממצא כולל מיקום `file:line`, קריטריון WCAG, והמלצת-תיקון. סוגיות מורכבות (גרירה, GIF, ניגודיות)
כוללות **פתרון-קוד מלא** בדוחות.

## תוכן ה-repo
- `accessibility-report-*.{md,html}` — 5 הדוחות.
- `methodica-math-scale-01-main/` — קוד 4 מודולי הלומדה (index.html / script.js / styles.css / assets).
- `accessibility-qa-skill/` — סקיל ה-Claude Code שהפיק את הבדיקה (scan.py, הנחיות ביקורת חיה,
  קטלוג 33 בדיקות, renderer ל-HTML). להרצה מחדש: ראו `accessibility-qa-skill/SKILL.md`.

## הסתייגות
הבדיקה האוטומטית (axe-core + scan.py) מכסה ~30-40% מהבעיות. מצבים שמאחורי אינטראקציה (הכרזת-משוב,
מלכודת-פוקוס, ניתוב-פוקוס) ואישור סופי דורשים **בדיקה ידנית עם קורא-מסך אנושי (NVDA/VoiceOver)**.
דוח זה אינו תחליף להסמכת-נגישות רשמית.
