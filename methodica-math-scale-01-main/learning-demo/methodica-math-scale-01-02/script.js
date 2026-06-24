'use strict';

const TOTAL_SCREENS = 9;
let currentScreen = 0;
window.lomdaState = { selectedCharacter: null, selectedDesign: null };
const _savedChar = localStorage.getItem('lomdaCharacter');
if (_savedChar) window.lomdaState.selectedCharacter = _savedChar;

/* Final assessment tracking (screens 43-52) */
let finalAssessmentScore = { correct: 0 };

let frcRevealed = [false, false, false];
let frcDone = false;

let s4VideoEnded = false;
let s4Playing = false;
let s4Timer = null;

let s7Timer = null;
let s8Timer = null;

/* ── Viewport scaling ── */
function scaleApp() {
  const scaleX = window.innerWidth / 1280;
  const scaleY = window.innerHeight / 710;
  const scale = Math.min(scaleX, scaleY);
  const left = (window.innerWidth - 1280 * scale) / 2;
  const top = (window.innerHeight - 710 * scale) / 2;
  const el = document.getElementById('app');
  el.style.transform = `scale(${scale})`;
  el.style.left = left + 'px';
  el.style.top = top + 'px';
}

window.addEventListener('resize', scaleApp);
scaleApp();

/* ── Navigation ── */
function goTo(n) {
  if (n < 0 || n >= TOTAL_SCREENS) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-screen="${n}"]`).classList.add('active');
  currentScreen = n;
  resetScreenState(n);
}

function resetScreenState(n) {
  if (n === 0) { s25Enter(); }
  if (n === 1) { s26Enter(); }
  if (n === 2) { s27Enter(); }
  if (n === 3) { s28Enter(); }
  if (n === 4) { s29Enter(); }
  if (n === 5) { s30Enter(); }
  if (n === 6) { s31Enter(); }
  if (n === 7) { s32Enter(); }
  if (n === 8) { s33Enter(); }
}


/* ── Ratio helper ── */
function checkRatio(input, a, b) {
  var s = input.replace(/\s/g, '').replace(/,/g, '');
  var parts = s.split(':');
  if (parts.length !== 2) return false;
  return (parts[0] === String(a) && parts[1] === String(b)) ||
         (parts[0] === String(b) && parts[1] === String(a));
}


/* ── Screen 26 ── */
var s26Solved    = false;
var s26Correct   = false;
var s26Attempts  = 0;
var s26Vals = { 1: null, 2: null, 3: null };
var S26_CORRECT = { 1: '5', 2: '1000', 3: '5000' };

function s26Enter() {
  s26Solved   = false;
  s26Correct  = false;
  s26Attempts = 0;
  s26Vals = { 1: null, 2: null, 3: null };
  [1, 2, 3].forEach(function(n) {
    var valEl = document.getElementById('s26-val' + n);
    var panel = document.getElementById('s26-panel' + n);
    var wrap  = document.getElementById('s26-wrap' + n);
    var trig  = wrap ? wrap.querySelector('.s5-dd-trigger') : null;
    if (valEl)  valEl.textContent = '-';
    if (panel)  panel.hidden = true;
    if (wrap)   wrap.classList.remove('is-open', 'is-correct', 'is-incorrect');
    if (trig)   trig.disabled = false;
  });
  var cont = document.getElementById('s26-continue');
  if (cont) cont.disabled = true;
  var fb = document.getElementById('s26-feedback');
  if (fb) { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
}

function s26ToggleDd(n) {
  if (s26Solved) return;
  var wrap  = document.getElementById('s26-wrap' + n);
  var panel = document.getElementById('s26-panel' + n);
  if (!wrap || !panel) return;
  var isOpen = wrap.classList.contains('is-open');
  [1, 2, 3].forEach(function(i) {
    var w = document.getElementById('s26-wrap' + i);
    var p = document.getElementById('s26-panel' + i);
    if (w) w.classList.remove('is-open');
    if (p) p.hidden = true;
  });
  if (!isOpen) { wrap.classList.add('is-open'); panel.hidden = false; }
}

function s26ToggleHint() {
  var popup = document.getElementById('s26-hint-popup');
  if (popup) popup.hidden = false;
}

function s26CloseHint() {
  var popup = document.getElementById('s26-hint-popup');
  if (popup) popup.hidden = true;
}

function s26Pick(n, val, label) {
  s26Vals[n] = val;
  var valEl = document.getElementById('s26-val' + n);
  if (valEl) valEl.textContent = label;
  var wrap  = document.getElementById('s26-wrap' + n);
  var panel = document.getElementById('s26-panel' + n);
  if (wrap)  wrap.classList.remove('is-open');
  if (panel) panel.hidden = true;
  var cont = document.getElementById('s26-continue');
  if (cont) cont.disabled = !(s26Vals[1] && s26Vals[2] && s26Vals[3]);
}

function s26Submit() {
  if (s26Solved) { goTo(2); return; }
  if (!s26Vals[1] || !s26Vals[2] || !s26Vals[3]) return;

  var correct = (s26Vals[1] === S26_CORRECT[1] && s26Vals[2] === S26_CORRECT[2] && s26Vals[3] === S26_CORRECT[3]);
  var labels  = { 1: '5', 2: '1,000', 3: '5,000' };

  var fb      = document.getElementById('s26-feedback');
  var fbBold  = document.getElementById('s26-fb-bold');
  var fbReg   = document.getElementById('s26-fb-regular');
  var fbIcon  = document.getElementById('s26-fb-icon');
  var cont    = document.getElementById('s26-continue');
  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = '1 ס"מ במפה שווה 1,000 ס"מ במציאות.<br>' +
                    'כדי למצוא את אורך השביל במציאות עלינו לכפול את המרחק במפה, שהוא 5 ס"מ ב-1,000.';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s26Solved  = true;
    s26Correct = true;
    var checkIco26 = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    [1, 2, 3].forEach(function(n) {
      var wrap   = document.getElementById('s26-wrap' + n);
      var trig   = wrap ? wrap.querySelector('.s5-dd-trigger') : null;
      var iconEl = document.getElementById('s26-dd-icon-' + n);
      if (trig)   trig.disabled = true;
      if (wrap)   wrap.classList.add('is-correct');
      if (iconEl) iconEl.innerHTML = checkIco26;
    });
    fbBold.textContent = 'נהדר!';
    fbReg.innerHTML    = explanation;
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
  } else {
    s26Attempts++;
    if (s26Attempts === 1) {
      fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
      fbReg.innerHTML    = '';
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden = false;
    } else {
      s26Solved = true;
      var checkIco = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var xIco     = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#B20010"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      [1, 2, 3].forEach(function(n) {
        var valEl  = document.getElementById('s26-val' + n);
        var wrap   = document.getElementById('s26-wrap' + n);
        var trig   = wrap ? wrap.querySelector('.s5-dd-trigger') : null;
        var iconEl = document.getElementById('s26-dd-icon-' + n);
        if (trig)  trig.disabled = true;
        if (valEl) valEl.textContent = labels[n];
        var isOk = (s26Vals[n] === S26_CORRECT[n]);
        if (wrap) {
          if (isOk) { wrap.classList.remove('is-incorrect'); wrap.classList.add('is-correct'); }
          else      { wrap.classList.remove('is-correct');   wrap.classList.add('is-incorrect'); }
        }
        if (iconEl) iconEl.innerHTML = isOk ? checkIco : xIco;
      });
      fbBold.textContent = 'זו טעות, לא נורא – בואו נלמד ממנה:';
      fbReg.innerHTML    = 'התרגיל הנכון מוצג כעת.<br>' + explanation;
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden     = false;
      cont.disabled = false;
    }
  }
}


/* ── Screen 25 ── */
function s25Enter() {
  var charImg = document.getElementById('s25-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }
}


/* ── Screen 27 ── */
var s27Solved    = false;
var s27Correct   = false;
var s27Attempts  = 0;
var s27Vals = { 1: null, 2: null };
var S27_CORRECT = { 1: '35000', 2: '350' };

function s27Enter() {
  s27Solved    = false;
  s27Correct   = false;
  s27Attempts  = 0;
  s27Vals = { 1: null, 2: null };

  [1, 2].forEach(function(n) {
    var valEl = document.getElementById('s27-val' + n);
    var wrap  = document.getElementById('s27-wrap' + n);
    var panel = document.getElementById('s27-panel' + n);
    if (valEl)  valEl.textContent = '-';
    if (wrap)   { wrap.classList.remove('is-correct', 'is-incorrect', 'is-open'); }
    if (panel)  panel.hidden = true;
  });

  var fb   = document.getElementById('s27-feedback');
  var cont = document.getElementById('s27-continue');
  var hint = document.getElementById('s27-hint-popup');
  if (fb)   { fb.hidden = true; fb.classList.remove('s5-fb--incorrect'); }
  if (cont) { cont.disabled = true; cont.onclick = function() { s27Submit(); }; }
  if (hint) hint.hidden = true;
}

function s27ToggleDd(n) {
  if (s27Solved) return;
  var panel  = document.getElementById('s27-panel' + n);
  var wrap   = document.getElementById('s27-wrap' + n);
  var isOpen = !panel.hidden;
  [1, 2].forEach(function(i) {
    var p = document.getElementById('s27-panel' + i);
    var w = document.getElementById('s27-wrap' + i);
    if (p) p.hidden = true;
    if (w) w.classList.remove('is-open');
  });
  if (!isOpen) {
    panel.hidden = false;
    wrap.classList.add('is-open');
  }
}

function s27Pick(n, val, label) {
  s27Vals[n] = val;
  var valEl = document.getElementById('s27-val' + n);
  var panel = document.getElementById('s27-panel' + n);
  var wrap  = document.getElementById('s27-wrap' + n);
  if (valEl) valEl.textContent = label;
  if (panel) panel.hidden = true;
  if (wrap)  wrap.classList.remove('is-open');
  var cont = document.getElementById('s27-continue');
  if (cont)  cont.disabled = !(s27Vals[1] !== null && s27Vals[2] !== null);
}

function s27Submit() {
  if (s27Solved) { goTo(3); return; }
  if (s27Vals[1] === null || s27Vals[2] === null) return;

  var fb     = document.getElementById('s27-feedback');
  var fbBold = document.getElementById('s27-fb-bold');
  var fbReg  = document.getElementById('s27-fb-regular');
  var fbIcon = document.getElementById('s27-fb-icon');
  var cont   = document.getElementById('s27-continue');

  var checkSvg      = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg          = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation   = 'הפעולה מורכבת משני שלבים:<br>1. נכפיל 7 ס"מ ב-5,000 ונקבל 35,000 ס"מ.<br>2. כדי להמיר ס"מ למטרים – נחלק ב-100.<br>35,000 ÷ 100 = 350 מטרים.';
  var correctLabels = { 1: '35,000', 2: '350' };
  var isCorrect     = s27Vals[1] === S27_CORRECT[1] && s27Vals[2] === S27_CORRECT[2];

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (isCorrect) {
    s27Solved  = true;
    s27Correct = true;
    var checkIco27 = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    [1, 2].forEach(function(n) {
      var wrap   = document.getElementById('s27-wrap' + n);
      var iconEl = document.getElementById('s27-dd-icon-' + n);
      if (wrap)   wrap.classList.add('is-correct');
      if (iconEl) iconEl.innerHTML = checkIco27;
    });
    fbBold.textContent = 'יופי!';
    fbReg.innerHTML    = explanation;
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(3); };
  } else {
    s27Attempts++;
    if (s27Attempts === 1) {
      fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
      fbReg.innerHTML    = '';
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden = false;
    } else {
      s27Solved = true;
      var checkIco27b = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var xIco27b     = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#B20010"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      [1, 2].forEach(function(n) {
        var valEl  = document.getElementById('s27-val' + n);
        var wrap   = document.getElementById('s27-wrap' + n);
        var iconEl = document.getElementById('s27-dd-icon-' + n);
        if (valEl) valEl.textContent = correctLabels[n];
        var isOk = (s27Vals[n] === S27_CORRECT[n]);
        if (wrap) {
          if (isOk) { wrap.classList.remove('is-incorrect'); wrap.classList.add('is-correct'); }
          else      { wrap.classList.remove('is-correct');   wrap.classList.add('is-incorrect'); }
        }
        if (iconEl) iconEl.innerHTML = isOk ? checkIco27b : xIco27b;
      });
      fbBold.textContent = 'זה לא נכון, אבל מכל טעות אפשר ללמוד:';
      fbReg.innerHTML    = 'התשובה הנכונה מוצגת כעת.<br>' + explanation;
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden     = false;
      cont.disabled = false;
      cont.onclick  = function() { goTo(3); };
    }
  }
}

function s27ToggleHint() {
  var popup = document.getElementById('s27-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s27CloseHint() {
  var popup = document.getElementById('s27-hint-popup');
  if (popup) popup.hidden = true;
}


/* ── Screen 28 ── */
var s28Solved    = false;
var s28Correct   = false;
var s28Attempts  = 0;
var s28Selected  = []; // indices of checked options
var S28_CORRECT  = [0, 1, 3]; // א, ב, ד

function s28Enter() {
  s28Solved    = false;
  s28Correct   = false;
  s28Attempts  = 0;
  s28Selected  = [];

  document.querySelectorAll('[data-screen="3"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });

  var fb   = document.getElementById('s28-feedback');
  var cont = document.getElementById('s28-continue');
  var hint = document.getElementById('s28-hint-popup');
  if (fb)   { fb.hidden = true; fb.classList.remove('s5-fb--incorrect'); }
  if (cont) cont.disabled = true;
  if (hint) hint.hidden = true;
}

function s28Select(idx) {
  if (s28Solved) return;
  var pos  = s28Selected.indexOf(idx);
  var opts = document.querySelectorAll('[data-screen="3"] .s5-opt');
  if (pos >= 0) {
    s28Selected.splice(pos, 1);
    opts[idx].classList.remove('is-selected');
  } else {
    s28Selected.push(idx);
    opts[idx].classList.add('is-selected');
  }
  var cont = document.getElementById('s28-continue');
  if (cont) cont.disabled = (s28Selected.length === 0);
}

function s28ToggleHint() {
  var popup = document.getElementById('s28-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s28CloseHint() {
  var popup = document.getElementById('s28-hint-popup');
  if (popup) popup.hidden = true;
}

function s28Submit() {
  if (s28Solved) { goTo(4); return; }
  if (s28Selected.length === 0) return;

  var fb     = document.getElementById('s28-feedback');
  var fbBold = document.getElementById('s28-fb-bold');
  var fbReg  = document.getElementById('s28-fb-regular');
  var fbIcon = document.getElementById('s28-fb-icon');
  var cont   = document.getElementById('s28-continue');
  var opts   = document.querySelectorAll('[data-screen="3"] .s5-opt');

  var hasGimel  = s28Selected.indexOf(2) >= 0;
  var hasAll    = S28_CORRECT.every(function(i) { return s28Selected.indexOf(i) >= 0; });
  var isCorrect = hasAll && !hasGimel;

  var checkSvg    = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg        = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = '<strong>סעיפים א ו-ב</strong> נכונים, כיוון שהכפלנו את קנה המידה ב-4 וב-10 בהתאמה.<br>' +
                    '<strong>סעיף ג</strong> אינו נכון, כיוון שס"מ במפה שווה 50 ס"מ ולא 50 מטרים.<br>' +
                    '<strong>סעיף ד</strong> נכון, כיוון ש-50 ס"מ בתרשים מייצגים 2,500 ס"מ במציאות, שהם 25 מטרים.';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (isCorrect) {
    s28Solved  = true;
    s28Correct = true;
    opts.forEach(function(opt, i) {
      opt.classList.remove('is-selected');
      opt.disabled = true;
      opt.classList.add(S28_CORRECT.indexOf(i) >= 0 ? 'is-correct' : 'is-incorrect');
    });
    fbBold.textContent = 'מעולה!';
    fbReg.innerHTML    = explanation;
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(4); };
  } else {
    s28Attempts++;
    if (s28Attempts === 1) {
      // first wrong — clear selection, keep interactive
      opts.forEach(function(opt) {
        opt.classList.remove('is-selected');
      });
      s28Selected = [];
      cont.disabled = true;
      fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
      fbReg.innerHTML    = '';
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden = false;
    } else {
      // second wrong — show all correct/incorrect, lock
      s28Solved = true;
      opts.forEach(function(opt, i) {
        opt.classList.remove('is-selected');
        opt.disabled = true;
        opt.classList.add(S28_CORRECT.indexOf(i) >= 0 ? 'is-correct' : 'is-incorrect');
      });
      fbBold.textContent = 'זה לא נכון, אבל מכל טעות אפשר ללמוד:';
      fbReg.innerHTML    = explanation;
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden     = false;
      cont.disabled = false;
      cont.onclick  = function() { goTo(4); };
    }
  }
}

/* ── Screen 29 ── */
var s29Attempts = 0;
var s29Solved   = false;
var s29Correct  = false;

function s29Enter() {
  s29Attempts = 0;
  s29Solved   = false;
  s29Correct  = false;
  var input = document.getElementById('s29-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var cont = document.getElementById('s29-continue');
  if (cont) cont.disabled = true;
  var hint = document.getElementById('s29-hint-popup');
  if (hint) hint.hidden = true;
  var fb = document.getElementById('s29-feedback');
  if (fb) { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
}

function s29CheckInput() {
  if (s29Solved) return;
  var input = document.getElementById('s29-answer-input');
  var cont  = document.getElementById('s29-continue');
  if (cont) cont.disabled = !(input && input.value.trim().length > 0);
}

function s29ToggleHint() {
  var popup = document.getElementById('s29-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s29CloseHint() {
  var popup = document.getElementById('s29-hint-popup');
  if (popup) popup.hidden = true;
}

function s29Submit() {
  if (s29Solved) { goTo(5); return; }

  var input   = document.getElementById('s29-answer-input');
  var answer  = input ? input.value.trim() : '';
  var numVal  = parseFloat(answer.replace(',', '.'));
  var correct = (numVal === 8);

  s29Attempts++;

  var fb      = document.getElementById('s29-feedback');
  var fbBold  = document.getElementById('s29-fb-bold');
  var fbReg   = document.getElementById('s29-fb-regular');
  var fbIcon  = document.getElementById('s29-fb-icon');
  var cont    = document.getElementById('s29-continue');

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = 'כדי לגלות מהו גודל קיר הסלון במציאות, נשתמש בקנה המידה ונכפיל:<br>' +
                    '800 ס"מ = 4 · 200<br>' +
                    'כדי להמיר למטרים, נחלק את 800 ב-100 (כי בכל מטר יש 100 ס"מ), ונקבל שהסלון הוא באורך 8 מטרים.';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s29Solved  = true;
    s29Correct = true;
    input.disabled  = true;
    fbBold.textContent = 'מעולה!';
    fbReg.innerHTML    = explanation;
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
  } else if (s29Attempts === 1) {
    fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
    fbReg.innerHTML    = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden       = false;
    input.value     = '';
    cont.disabled   = true;
  } else {
    s29Solved = true;
    input.disabled  = true;
    fbBold.textContent = 'זה לא מדוייק, אבל כל הכבוד על הניסיון!';
    fbReg.innerHTML    = explanation;
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden     = false;
    cont.disabled = false;
  }
}


/* ── Screen 30 ── */
var s30Solved   = false;
var s30Correct  = false;
var s30Attempts = 0;
var s30Vals     = { 1: null, 2: null, 3: null, 4: null };
var S30_CORRECT = { 1: '600', 2: 'חילוק', 3: '200', 4: '3' };

function s30Enter() {
  s30Solved   = false;
  s30Correct  = false;
  s30Attempts = 0;
  s30Vals     = { 1: null, 2: null, 3: null, 4: null };

  [1, 2, 3, 4].forEach(function(n) {
    var valEl = document.getElementById('s30-val' + n);
    var wrap  = document.getElementById('s30-wrap' + n);
    var panel = document.getElementById('s30-panel' + n);
    if (valEl)  valEl.textContent = '-';
    if (wrap)  wrap.classList.remove('is-correct', 'is-incorrect', 'is-open');
    if (panel) panel.hidden = true;
  });

  var fb   = document.getElementById('s30-feedback');
  var cont = document.getElementById('s30-continue');
  var hint = document.getElementById('s30-hint-popup');
  if (fb)   { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
  if (cont) cont.disabled = true;
  if (hint) hint.hidden = true;
}

function s30ToggleDd(n) {
  if (s30Solved) return;
  var isOpen = !document.getElementById('s30-panel' + n).hidden;
  [1, 2, 3, 4].forEach(function(i) {
    var p = document.getElementById('s30-panel' + i);
    var w = document.getElementById('s30-wrap' + i);
    if (p) p.hidden = true;
    if (w) w.classList.remove('is-open');
  });
  if (!isOpen) {
    document.getElementById('s30-panel' + n).hidden = false;
    document.getElementById('s30-wrap' + n).classList.add('is-open');
  }
}

function s30Pick(n, val, label) {
  s30Vals[n] = val;
  var valEl = document.getElementById('s30-val' + n);
  var panel = document.getElementById('s30-panel' + n);
  var wrap  = document.getElementById('s30-wrap' + n);
  if (valEl) valEl.textContent = label;
  if (panel) panel.hidden = true;
  if (wrap)  wrap.classList.remove('is-open');
  var cont = document.getElementById('s30-continue');
  if (cont) cont.disabled = !(s30Vals[1] && s30Vals[2] && s30Vals[3] && s30Vals[4]);
}

function s30ToggleHint() {
  var popup = document.getElementById('s30-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s30CloseHint() {
  var popup = document.getElementById('s30-hint-popup');
  if (popup) popup.hidden = true;
}

function s30Submit() {
  if (s30Solved) { routeAfterBasicPractice(); return; }
  if (!s30Vals[1] || !s30Vals[2] || !s30Vals[3] || !s30Vals[4]) return;

  var isCorrect = (s30Vals[1] === S30_CORRECT[1] && s30Vals[2] === S30_CORRECT[2] &&
                   s30Vals[3] === S30_CORRECT[3] && s30Vals[4] === S30_CORRECT[4]);

  var correctLabels = { 1: '600', 2: 'חילוק', 3: '200', 4: '3' };

  var fb     = document.getElementById('s30-feedback');
  var fbBold = document.getElementById('s30-fb-bold');
  var fbReg  = document.getElementById('s30-fb-regular');
  var fbIcon = document.getElementById('s30-fb-icon');
  var cont   = document.getElementById('s30-continue');

  var checkSvg    = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg        = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = 'נמיר 6 מטרים לס״מ ונקבל 600 ס״מ.<br>' +
                    'מכיוון שהתכנית מוקטנת ביחס למציאות, נשתמש בפעולת חילוק.<br>' +
                    'בקנה מידה 1:200, כל 1 ס"מ בתכנית מייצג 200 ס"מ במציאות, ולכן נצמצם ב־200.<br>' +
                    'נחלק 600 ס״מ במציאות ל-200 ונקבל שאורך הקיר בתכנית הוא 3 ס"מ.';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (isCorrect) {
    s30Solved  = true;
    s30Correct = true;
    var checkIco30 = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    [1, 2, 3, 4].forEach(function(n) {
      var wrap   = document.getElementById('s30-wrap' + n);
      var trig   = wrap ? wrap.querySelector('.s5-dd-trigger') : null;
      var iconEl = document.getElementById('s30-dd-icon-' + n);
      if (trig)   trig.disabled = true;
      if (wrap)   wrap.classList.add('is-correct');
      if (iconEl) iconEl.innerHTML = checkIco30;
    });
    fbBold.textContent = 'מעולה!';
    fbReg.innerHTML    = explanation;
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { routeAfterBasicPractice(); };
  } else {
    s30Attempts++;
    if (s30Attempts === 1) {
      fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
      fbReg.innerHTML    = '';
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden = false;
    } else {
      s30Solved = true;
      var checkIco30b = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var xIco30b     = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#B20010"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      [1, 2, 3, 4].forEach(function(n) {
        var valEl  = document.getElementById('s30-val' + n);
        var wrap   = document.getElementById('s30-wrap' + n);
        var trig   = wrap ? wrap.querySelector('.s5-dd-trigger') : null;
        var iconEl = document.getElementById('s30-dd-icon-' + n);
        if (trig)  trig.disabled = true;
        if (valEl) valEl.textContent = correctLabels[n];
        var isOk = (s30Vals[n] === S30_CORRECT[n]);
        if (wrap) {
          if (isOk) { wrap.classList.remove('is-incorrect'); wrap.classList.add('is-correct'); }
          else      { wrap.classList.remove('is-correct');   wrap.classList.add('is-incorrect'); }
        }
        if (iconEl) iconEl.innerHTML = isOk ? checkIco30b : xIco30b;
      });
      fbBold.textContent = 'זה לא מדוייק, אבל בואו נלמד מזה:';
      fbReg.innerHTML    = explanation;
      fbIcon.innerHTML   = xSvg;
      fb.classList.add('s5-fb--incorrect');
      fb.hidden     = false;
      cont.disabled = false;
      cont.onclick  = function() { routeAfterBasicPractice(); };
    }
  }
}

/* ── Screen 31 ── */
function s31Enter() {
  var charImg = document.getElementById('s31-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }
}


function getBasicPracticeScore() {
  var count = 0;
  if (s26Correct)                count++; // שאלה 1
  if (s27Correct)                count++; // שאלה 2
  if (s28Correct)                count++; // שאלה 3
  if (s29Correct && s30Correct)  count++; // שאלה 4 (א+ב יחד)
  return count;
}

// ≥3 נכון → מסך 6 (תרגילים קשים יותר) | <3 → ללא מעבר כרגע
function routeAfterBasicPractice() {
  if (getBasicPracticeScore() >= 3) { goTo(6); }
}

/* ── Dev tool bridge (index_dev.html postMessage) ── */
window.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'DEV_GOTO') { goTo(e.data.screen); }
});

document.addEventListener('DOMContentLoaded', function () {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_READY', total: TOTAL_SCREENS }, '*');
  }
});


/* ── Screen 32: תרגול מתקדם — שאלה 1 ── */
var s32Solved   = false;
var s32Correct  = false;
var s32Attempts = 0;

function s32Enter() {
  s32Solved   = false;
  s32Correct  = false;
  s32Attempts = 0;
  var input = document.getElementById('s32-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var fb = document.getElementById('s32-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  document.getElementById('s32-fb-bold').textContent    = '';
  document.getElementById('s32-fb-regular').textContent = '';
  document.getElementById('s32-fb-icon').innerHTML      = '';
  var cont = document.getElementById('s32-continue');
  if (cont) { cont.disabled = true; cont.onclick = function() { s32Submit(); }; }
  var hintBtn = document.getElementById('s32-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s32-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s32CheckInput() {
  var val = document.getElementById('s32-answer-input').value.trim();
  document.getElementById('s32-continue').disabled = (val === '');
}

function s32ToggleHint() {
  var popup = document.getElementById('s32-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s32CloseHint() {
  var popup = document.getElementById('s32-hint-popup');
  if (popup) popup.hidden = true;
}

function s32Submit() {
  if (s32Solved) { goTo(8); return; }

  var rawVal = document.getElementById('s32-answer-input').value.trim();
  var answer = parseFloat(rawVal.replace(',', '.'));
  var fb     = document.getElementById('s32-feedback');
  var fbBold = document.getElementById('s32-fb-bold');
  var fbReg  = document.getElementById('s32-fb-regular');
  var fbIcon = document.getElementById('s32-fb-icon');
  var cont   = document.getElementById('s32-continue');
  var hintBtn = document.getElementById('s32-hint-btn');

  var checkSvg = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#58CC02"/><path d="M8 14.5l4.5 4.5 8-9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#FF4B4B"/><path d="M9 9l10 10M19 9L9 19" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';

  var explanation = 'כדי לחשב נכון, נמיר קודם את אורך המכונית במציאות לסנטימטרים: 4.5 · 100 = 450 ס"מ. מכיוון שהדגם המודפס מוקטן פי 18 (קנה מידה 1:18), נחלק את האורך במציאות לפי קנה המידה: 450 ÷ 18 = 25 ס"מ.';

  if (answer === 25) {
    s32Solved  = true;
    s32Correct = true;
    document.getElementById('s32-answer-input').disabled = true;
    fbBold.textContent  = 'כל הכבוד!';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(8); };
  } else {
    s32Attempts++;
    if (s32Attempts < 2) {
      // First wrong — brief message + reveal hint button
      fbBold.textContent  = 'זה לא מדויק, ננסה שוב?';
      fbReg.textContent   = '';
      fbIcon.innerHTML    = xSvg;
      fb.classList.remove('s5-fb--correct');
      fb.classList.add('s5-fb--incorrect');
      fb.hidden           = false;
      if (hintBtn) hintBtn.hidden = false;
      document.getElementById('s32-answer-input').value = '';
      cont.disabled = true;
    } else {
      // Second wrong — explanation + lock
      s32Solved = true;
      document.getElementById('s32-answer-input').disabled = true;
      fbBold.textContent  = 'זו טעות, אבל יש לנו הזדמנות ללמוד:';
      fbReg.innerHTML     = explanation;
      fbIcon.innerHTML    = xSvg;
      fb.classList.remove('s5-fb--correct');
      fb.classList.add('s5-fb--incorrect');
      fb.hidden     = false;
      cont.disabled = false;
      cont.onclick  = function() { goTo(8); };
    }
  }
}

/* ── Screen 33: תרגול מתקדם — שאלה 2 ── */
var s33Selected = null;
var s33Attempts = 0;
var s33Solved   = false;
var s33Correct  = false;
var S33_CORRECT = 2;

function s33Enter() {
  s33Selected = null;
  s33Attempts = 0;
  s33Solved   = false;
  s33Correct  = false;
  document.querySelectorAll('[data-screen="8"] .s5-opt').forEach(function(o) {
    o.disabled = false;
    o.classList.remove('is-selected', 'is-correct', 'is-incorrect');
  });
  var fb = document.getElementById('s33-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  document.getElementById('s33-fb-bold').textContent    = '';
  document.getElementById('s33-fb-regular').textContent = '';
  document.getElementById('s33-fb-icon').innerHTML      = '';
  var cont = document.getElementById('s33-continue');
  if (cont) { cont.disabled = true; cont.onclick = function() { s33Submit(); }; }
  var hintBtn = document.getElementById('s33-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s33-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s33Select(idx) {
  if (s33Solved) return;
  s33Selected = idx;
  document.querySelectorAll('[data-screen="8"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  document.getElementById('s33-continue').disabled = false;
}

function s33ToggleHint() {
  var popup = document.getElementById('s33-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s33CloseHint() {
  var popup = document.getElementById('s33-hint-popup');
  if (popup) popup.hidden = true;
}

function getAdvancedPracticeScore() {
  return (s32Correct ? 1 : 0) + (s33Correct ? 1 : 0);
}

// 2/2 נכון → תרגול כיתה (03) | פחות → ללא מעבר כרגע
function routeAfterAdvancedPractice() {
  if (getAdvancedPracticeScore() >= 2) {
    window.location.href = '../methodica-math-scale-01-03/index.html';
  }
}

function s33Submit() {
  if (s33Solved) { routeAfterAdvancedPractice(); return; }
  if (s33Selected === null) return;

  var correct = (s33Selected === S33_CORRECT);
  s33Attempts++;

  var fb      = document.getElementById('s33-feedback');
  var fbBold  = document.getElementById('s33-fb-bold');
  var fbReg   = document.getElementById('s33-fb-regular');
  var fbIcon  = document.getElementById('s33-fb-icon');
  var cont    = document.getElementById('s33-continue');
  var hintBtn = document.getElementById('s33-hint-btn');
  var opts    = document.querySelectorAll('[data-screen="8"] .s5-opt');

  var checkSvg    = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg        = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = '25 מטרים הם 2,500 ס"מ, מה שאומר שקנה המידה הוא 2,500 : 5. נחלק ב-5 כדי לקבל את קנה המידה המצומצם – 500 : 1.';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s33Solved  = true;
    s33Correct = true;
    opts[s33Selected].classList.remove('is-selected');
    opts[s33Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent  = 'כל הכבוד!';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { routeAfterAdvancedPractice(); };
  } else if (s33Attempts === 1) {
    opts[s33Selected].classList.remove('is-selected');
    fbBold.textContent  = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent   = '';
    fbIcon.innerHTML    = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden           = false;
    if (hintBtn) hintBtn.hidden = false;
    s33Selected = null;
    cont.disabled = true;
  } else {
    s33Solved = true;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.classList.remove('is-selected');
      if (i === S33_CORRECT) o.classList.add('is-correct');
      else if (i === s33Selected) o.classList.add('is-incorrect');
    });
    fbBold.textContent  = 'זו טעות, לא נורא – בואו נלמד ממנה:';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { routeAfterAdvancedPractice(); };
  }
}


/* ── Keyboard accessibility ── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(card);
      }
    });
  });

  /* Close dropdowns when clicking outside */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.s5-dropdown')) {
      document.querySelectorAll('[data-screen="5"] .s5-dropdown').forEach(function (d) {
        d.classList.remove('is-open');
        var panel = document.getElementById('s5-dd-panel-' + d.dataset.row);
        if (panel) panel.hidden = true;
      });
      [1, 2, 3].forEach(function(n) {
        var w = document.getElementById('s26-wrap' + n);
        var p = document.getElementById('s26-panel' + n);
        if (w) w.classList.remove('is-open');
        if (p) p.hidden = true;
      });
      [1, 2].forEach(function(n) {
        var w = document.getElementById('s27-wrap' + n);
        var p = document.getElementById('s27-panel' + n);
        if (w) w.classList.remove('is-open');
        if (p) p.hidden = true;
      });
      [1, 2, 3, 4].forEach(function(n) {
        var w = document.getElementById('s30-wrap' + n);
        var p = document.getElementById('s30-panel' + n);
        if (w) w.classList.remove('is-open');
        if (p) p.hidden = true;
      });
    }
  });
});



// ============================================================
//  REPORT MODAL
// ============================================================
function openReportModal() {
  document.getElementById('report-modal').removeAttribute('hidden');
  setTimeout(function() {
    var el = document.getElementById('report-type');
    if (el) el.focus();
  }, 40);
}

function tryCloseReportModal() {
  var typeVal = document.getElementById('report-type').value;
  var textVal = document.getElementById('report-text').value.trim();

  if (typeVal || textVal) {
    document.getElementById('report-modal').setAttribute('hidden', '');
    document.getElementById('report-confirm-modal').removeAttribute('hidden');
  } else {
    forceCloseReportModal();
  }
}

function forceCloseReportModal() {
  document.getElementById('report-modal').setAttribute('hidden', '');
  document.getElementById('report-confirm-modal').setAttribute('hidden', '');
  resetReportForm();
}

function backToReportForm() {
  document.getElementById('report-confirm-modal').setAttribute('hidden', '');
  document.getElementById('report-modal').removeAttribute('hidden');
  setTimeout(function() {
    var el = document.getElementById('report-type');
    if (el) el.focus();
  }, 40);
}

function submitReport() {
  var report = {
    type:      document.getElementById('report-type').value || '(לא נבחר)',
    text:      document.getElementById('report-text').value.trim() || '(ללא תיאור)',
    screen:    currentScreen,
    timestamp: new Date().toISOString()
  };
  console.log('[Report Issue]', report);
  forceCloseReportModal();
}

function resetReportForm() {
  document.getElementById('report-type').value = '';
  document.getElementById('report-text').value = '';
  document.getElementById('report-char-count').textContent = '0 / 250';
}

// Character counter for report textarea
var reportTextarea = document.getElementById('report-text');
var reportCounter  = document.getElementById('report-char-count');
if (reportTextarea && reportCounter) {
  reportTextarea.addEventListener('input', function() {
    reportCounter.textContent = reportTextarea.value.length + ' / 250';
  });
}

// Escape key closes report modals
document.addEventListener('keydown', function(event) {
  if (event.key !== 'Escape') return;
  var confirmModal = document.getElementById('report-confirm-modal');
  var reportModal  = document.getElementById('report-modal');
  if (!confirmModal.hasAttribute('hidden')) { forceCloseReportModal(); return; }
  if (!reportModal.hasAttribute('hidden'))  { tryCloseReportModal();   return; }
});
