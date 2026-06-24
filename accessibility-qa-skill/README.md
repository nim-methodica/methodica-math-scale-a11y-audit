# accessibility-qa

סקיל בקרת-נגישות ללומדות אינטראקטיביות מבוססות **HTML/CSS/JS** (RTL עברית, משרד החינוך),
מול **WCAG 2.1 רמה AA** ו**ת"י 5568**. **מדווח בלבד — לא עורך קוד.**

## הפעלה
```
/accessibility-qa            ואז הצביעו על תיקיית המודול
```
או בקשו בשפה חופשית: "בדוק נגישות של הלומדה ב-…".

## מה הוא עושה
1. **סריקה סטטית** (`scripts/scan.py`) על index.html + styles.css + script.js — מיקום `file:line`
   לכל ממצא מכני (lang, alt, onclick-ללא-מקלדת, outline:none, id כפול, aria שבור, ניגודיות-CSS ועוד).
2. **ביקורת חיה** (preview + axe-core + מעבר-מקלדת + ניגודיות מחושבת) על כל מסך מוזרק — ראה
   `references/dynamic-audit.md`.
3. **דוח** `report.md` + `report.html` מעוצב (`scripts/md-to-html.js`), לפי קטגוריה, עם חומרה,
   קריטריון WCAG, והמלצת-תיקון לכל ממצא.

## מבנה
```
SKILL.md                      התהליך והעקרונות
references/
  wcag-checks.md      ⭐ קטלוג 32 הבדיקות (WCAG + ת"י 5568, חומרה, זיהוי, ניסוח)
  israeli-standard.md ⭐ מה ת"י 5568 מוסיף על WCAG
  dynamic-audit.md    ⭐ הרצת הביקורת החיה (axe, מקלדת, ניגודיות, reflow)
  report-template.md     שלד הדוח + render
scripts/
  scan.py                סורק סטטי דטרמיניסטי (מקבל תיקייה או index.html)
  md-to-html.js          ממיר report.md ל-report.html (Node, ללא תלויות)
```

## מגבלות
סריקה אוטומטית (scan.py + axe-core) תופסת ~30-40% מבעיות הנגישות. פוקוס, סדר-טאב, איכות-alt
ובהירות-הודעות דורשים שיפוט-אדם, ואישור סופי דורש בדיקה עם קורא-מסך אמיתי (NVDA/VoiceOver).
הדוח מציין מגבלה זו במפורש.
