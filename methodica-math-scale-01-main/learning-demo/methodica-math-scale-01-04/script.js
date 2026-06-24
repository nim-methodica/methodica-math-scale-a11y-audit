'use strict';

const TOTAL_SCREENS = 18;
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

/* ── Screen 3 (s39) Drag-and-drop ── */
const DDQ = {
  correctMap: {
    'target-lior-orech':  'drag-60',
    'target-lior-gova':   'drag-30',
    'target-yuval-orech': 'drag-24',
    'target-yuval-gova':  'drag-12'
  },
  revealMap: {
    'target-lior-orech':  'drag-60',
    'target-lior-gova':   'drag-30',
    'target-yuval-orech': 'drag-24',
    'target-yuval-gova':  'drag-12'
  }
};
let ddqPlacement = {
  'drag-6': 'source', 'drag-12': 'source', 'drag-15': 'source',
  'drag-24': 'source', 'drag-30': 'source', 'drag-48': 'source', 'drag-60': 'source'
};
let ddqDone        = false;
let ddqChecked     = false;
let ddqAttempts    = 0;
let ddqDragActive  = null;
let ddqDropHandled = false;

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
  if (n === 0)  { s36Enter(); }
  if (n === 1)  { s37Enter(); }
  if (n === 2)  { s38Enter(); }
  if (n === 3)  { s39Enter(); }
  if (n === 4)  { s40Enter(); }
  if (n === 5)  { s41Enter(); }
  if (n === 6)  { s42Enter(); }
  if (n === 9)  { s45Enter(); }
  if (n === 11) { s47Enter(); }
  if (n === 13) { s49Enter(); }
  if (n === 15) { s51Enter(); }
  if (n === 17) { s53Enter(); }
}


/* ── Ratio helper ── */
function checkRatio(input, a, b) {
  var s = input.replace(/\s/g, '').replace(/,/g, '');
  var parts = s.split(':');
  if (parts.length !== 2) return false;
  return (parts[0] === String(a) && parts[1] === String(b)) ||
         (parts[0] === String(b) && parts[1] === String(a));
}


/* ── Screen 38: תרגול מתקדם — שאלה 2א ── */
var s38Selected = null;
var s38Attempts = 0;
var s38Solved   = false;
var s38Correct  = false;
var S38_CORRECT = 0;

function s38Enter() {
  s38Selected = null;
  s38Attempts = 0;
  s38Solved   = false;
  s38Correct  = false;
  document.querySelectorAll('[data-screen="2"] .s5-opt').forEach(function(o) {
    o.disabled = false;
    o.classList.remove('is-selected', 'is-correct', 'is-incorrect');
  });
  var fb = document.getElementById('s38-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  document.getElementById('s38-fb-bold').textContent    = '';
  document.getElementById('s38-fb-regular').textContent = '';
  document.getElementById('s38-fb-icon').innerHTML      = '';
  var cont = document.getElementById('s38-continue');
  if (cont) { cont.disabled = true; cont.onclick = function() { s38Submit(); }; }
  var hintBtn = document.getElementById('s38-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s38-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s38Select(idx) {
  if (s38Solved) return;
  s38Selected = idx;
  document.querySelectorAll('[data-screen="2"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  document.getElementById('s38-continue').disabled = false;
}

function s38ToggleHint() {
  var popup = document.getElementById('s38-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s38CloseHint() {
  var popup = document.getElementById('s38-hint-popup');
  if (popup) popup.hidden = true;
}

function s38Submit() {
  if (s38Solved) { goTo(3); return; }
  if (s38Selected === null) return;

  var correct = (s38Selected === S38_CORRECT);
  s38Attempts++;

  var fb      = document.getElementById('s38-feedback');
  var fbBold  = document.getElementById('s38-fb-bold');
  var fbReg   = document.getElementById('s38-fb-regular');
  var fbIcon  = document.getElementById('s38-fb-icon');
  var cont    = document.getElementById('s38-continue');
  var hintBtn = document.getElementById('s38-hint-btn');
  var opts    = document.querySelectorAll('[data-screen="2"] .s5-opt');

  var checkSvg    = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg        = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = 'הזום הכולל שיובל הגדיל הוא 6 (2 · 3). כשהגדלנו את התמונה פי 6, הקטנו את היחס פי 6 (50 = 6 ÷ 300), ולכן קנה המידה החדש הוא 50 : 1';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s38Solved  = true;
    s38Correct = true;
    opts[s38Selected].classList.remove('is-selected');
    opts[s38Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent  = 'נכון מאוד!';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(3); };
  } else if (s38Attempts === 1) {
    opts[s38Selected].classList.remove('is-selected');
    fbBold.textContent  = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent   = '';
    fbIcon.innerHTML    = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden           = false;
    if (hintBtn) hintBtn.hidden = false;
    s38Selected = null;
    cont.disabled = true;
  } else {
    s38Solved = true;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.classList.remove('is-selected');
      if (i === S38_CORRECT) o.classList.add('is-correct');
      else if (i === s38Selected) o.classList.add('is-incorrect');
    });
    fbBold.textContent  = 'זו טעות – בואו נבין למה:';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(3); };
  }
}


/* ── Screen 37: תרגול מתקדם — שאלה 1 ── */
var s37Selected = null;
var s37Attempts = 0;
var s37Solved   = false;
var s37Correct  = false;
var S37_CORRECT = 2;

function s37Enter() {
  s37Selected = null;
  s37Attempts = 0;
  s37Solved   = false;
  s37Correct  = false;
  document.querySelectorAll('[data-screen="1"] .s5-opt').forEach(function(o) {
    o.disabled = false;
    o.classList.remove('is-selected', 'is-correct', 'is-incorrect');
  });
  var fb = document.getElementById('s37-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  document.getElementById('s37-fb-bold').textContent    = '';
  document.getElementById('s37-fb-regular').textContent = '';
  document.getElementById('s37-fb-icon').innerHTML      = '';
  var cont = document.getElementById('s37-continue');
  if (cont) { cont.disabled = true; cont.onclick = function() { s37Submit(); }; }
  var hintBtn = document.getElementById('s37-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s37-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s37Select(idx) {
  if (s37Solved) return;
  s37Selected = idx;
  document.querySelectorAll('[data-screen="1"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  document.getElementById('s37-continue').disabled = false;
}

function s37ToggleHint() {
  var popup = document.getElementById('s37-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s37CloseHint() {
  var popup = document.getElementById('s37-hint-popup');
  if (popup) popup.hidden = true;
}

function s37Submit() {
  if (s37Solved) { goTo(2); return; }
  if (s37Selected === null) return;

  var correct = (s37Selected === S37_CORRECT);
  s37Attempts++;

  var fb      = document.getElementById('s37-feedback');
  var fbBold  = document.getElementById('s37-fb-bold');
  var fbReg   = document.getElementById('s37-fb-regular');
  var fbIcon  = document.getElementById('s37-fb-icon');
  var cont    = document.getElementById('s37-continue');
  var hintBtn = document.getElementById('s37-hint-btn');
  var opts    = document.querySelectorAll('[data-screen="1"] .s5-opt');

  var checkSvg    = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg        = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var explanation = 'גובה המגדל במציאות הוא 828.8 מטרים, שהם 82,880 ס"מ. נחלק את הגובה ב-3,000, ונקבל שרטוט באורך של קצת יותר מ-27.6 ס"מ, שנכנס בשלמותו בתוך 29.7 הסנטימטרים של הדף.';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s37Solved  = true;
    s37Correct = true;
    opts[s37Selected].classList.remove('is-selected');
    opts[s37Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent  = 'יופי של תשובה!';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(2); };
  } else if (s37Attempts === 1) {
    opts[s37Selected].classList.remove('is-selected');
    fbBold.textContent  = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent   = '';
    fbIcon.innerHTML    = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden           = false;
    if (hintBtn) hintBtn.hidden = false;
    s37Selected = null;
    cont.disabled = true;
  } else {
    s37Solved = true;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.classList.remove('is-selected');
      if (i === S37_CORRECT) o.classList.add('is-correct');
      else if (i === s37Selected) o.classList.add('is-incorrect');
    });
    fbBold.textContent  = 'זו טעות, לא נורא – בואו נלמד ממנה:';
    fbReg.innerHTML     = explanation;
    fbIcon.innerHTML    = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden     = false;
    cont.disabled = false;
    cont.onclick  = function() { goTo(2); };
  }
}


/* ── Screen 36 ── */
function s36Enter() {
  var charImg = document.getElementById('s36-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }
}


function s39Enter() {
  if (ddqDone) return;
  Object.keys(ddqPlacement).forEach(function(k) { ddqPlacement[k] = 'source'; });
  ddqDragActive  = null;
  ddqDropHandled = false;
  ddqChecked     = false;
  ddqAttempts    = 0;
  ddqRender();
  var fb = document.getElementById('s39-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  var fbBold = document.getElementById('s39-fb-bold');
  var fbReg  = document.getElementById('s39-fb-regular');
  var fbIcon = document.getElementById('s39-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';
  var btn = document.getElementById('ddq-check');
  if (btn) { btn.disabled = true; btn.textContent = 'צדקתי?'; btn.onclick = function() { ddqCheck(); }; }
  var hintBtn = document.getElementById('s39-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s39-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  Object.keys(DDQ.correctMap).forEach(function(tId) {
    var t = document.getElementById(tId);
    if (!t) return;
    t.classList.remove('s39-correct');
    t.querySelectorAll('.ddq-badge').forEach(function(b) { b.remove(); });
  });
}

function ddqRender() {
  Object.keys(ddqPlacement).forEach(function(dragId) {
    var card = document.getElementById(dragId);
    if (!card) return;
    var inSource = (ddqPlacement[dragId] === 'source');
    card.classList.toggle('ghost', !inSource);
    if (ddqChecked) {
      card.classList.add('locked');
      card.draggable = false;
    } else {
      card.classList.remove('locked');
      card.draggable = true;
    }
  });

  Object.keys(DDQ.correctMap).forEach(function(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var placedId = null;
    Object.keys(ddqPlacement).forEach(function(id) {
      if (ddqPlacement[id] === targetId) placedId = id;
    });
    var existing = target.querySelector('.ddq-placed-card');
    if (existing) existing.remove();
    target.classList.remove('occupied');
    if (placedId) {
      target.classList.add('occupied');
      var card = document.createElement('div');
      card.className = 'ddq-placed-card ddq-num-chip';
      card.textContent = placedId.replace('drag-', '');
      if (!ddqChecked) {
        card.draggable = true;
        (function(id) {
          card.addEventListener('dragstart', function(ev) { ddqPlacedDragStart(ev, id); });
          card.addEventListener('dragend',   function(ev) { ddqDragEnd(ev); });
        })(placedId);
      } else {
        card.classList.add('locked');
      }
      target.appendChild(card);
    }
  });

  ddqUpdateCheckBtn();
}

function ddqDragStart(event, dragId) {
  if (ddqChecked) { event.preventDefault(); return; }
  ddqDragActive  = dragId;
  ddqDropHandled = false;
  event.dataTransfer.setData('text/plain', dragId);
  event.dataTransfer.effectAllowed = 'move';
  setTimeout(function() {
    var card = document.getElementById(dragId);
    if (card) card.classList.add('dragging');
  }, 0);
}

function ddqPlacedDragStart(event, dragId) {
  if (ddqChecked) { event.preventDefault(); return; }
  ddqDragActive  = dragId;
  ddqDropHandled = false;
  event.dataTransfer.setData('text/plain', dragId);
  event.dataTransfer.effectAllowed = 'move';
  setTimeout(function() {
    ddqPlacement[dragId] = 'source';
    ddqRender();
    var card = document.getElementById(dragId);
    if (card) card.classList.add('dragging');
  }, 0);
}

function ddqDragEnd(event) {
  if (!ddqDropHandled && ddqDragActive) {
    ddqPlacement[ddqDragActive] = 'source';
    ddqRender();
  }
  if (ddqDragActive) {
    var card = document.getElementById(ddqDragActive);
    if (card) card.classList.remove('dragging');
  }
  ddqDragActive  = null;
  ddqDropHandled = false;
}

function ddqDragOver(event, targetId) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  var t = document.getElementById(targetId);
  if (t) t.classList.add('drag-over');
}

function ddqDragLeave(event, targetId) {
  var t = document.getElementById(targetId);
  if (t) t.classList.remove('drag-over');
}

function ddqDrop(event, targetId) {
  event.preventDefault();
  if (ddqChecked) return;
  var dragId = event.dataTransfer.getData('text/plain') || ddqDragActive;
  if (!dragId) return;
  ddqDropHandled = true;
  var target = document.getElementById(targetId);
  if (target) target.classList.remove('drag-over');
  Object.keys(ddqPlacement).forEach(function(id) {
    if (ddqPlacement[id] === targetId) ddqPlacement[id] = 'source';
  });
  ddqPlacement[dragId] = targetId;
  ddqRender();
}

function ddqUpdateCheckBtn() {
  if (ddqChecked) return;
  var allFilled = Object.keys(DDQ.correctMap).every(function(tId) {
    return Object.keys(ddqPlacement).some(function(id) {
      return ddqPlacement[id] === tId;
    });
  });
  var btn = document.getElementById('ddq-check');
  if (btn) btn.disabled = !allFilled;
}

function ddqCheck() {
  if (ddqChecked) { goTo(4); return; }
  ddqAttempts++;

  var allCorrect = Object.keys(DDQ.correctMap).every(function(tId) {
    var placed = null;
    Object.keys(ddqPlacement).forEach(function(id) {
      if (ddqPlacement[id] === tId) placed = id;
    });
    return placed === DDQ.correctMap[tId];
  });

  var fb      = document.getElementById('s39-feedback');
  var fbBold  = document.getElementById('s39-fb-bold');
  var fbReg   = document.getElementById('s39-fb-regular');
  var fbIcon  = document.getElementById('s39-fb-icon');
  var btn     = document.getElementById('ddq-check');
  var hintBtn = document.getElementById('s39-hint-btn');

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (allCorrect) {
    ddqChecked = true;
    ddqDone    = true;
    ddqRender();
    Object.keys(DDQ.correctMap).forEach(function(tId) {
      var t = document.getElementById(tId);
      if (t) t.classList.add('s39-correct');
    });
    fbBold.textContent = 'נכון מאוד!';
    fbReg.textContent  = 'נמיר את המידות במציאות לסנטימטרים ונקבל אורך 1,200 ס"מ וגובה 600 ס"מ. אצל יובל (קנה מידה 1:50) נחלק את המידות ב-50 ונקבל: אורך 24 ס"מ, גובה 12 ס"מ. אצל ליאור (קנה מידה 1:20) נחלק את המידות ב-20 ונקבל: אורך 60 ס"מ, גובה 30 ס"מ.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(4); };

  } else if (ddqAttempts === 1) {
    /* First wrong — reset chips to source so learner starts fresh */
    Object.keys(ddqPlacement).forEach(function(k) { ddqPlacement[k] = 'source'; });
    ddqRender();
    fbBold.textContent = 'לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;

  } else {
    /* Second wrong — capture what user had before revealing */
    var targetResults = {};
    Object.keys(DDQ.correctMap).forEach(function(tId) {
      var placed = null;
      Object.keys(ddqPlacement).forEach(function(id) {
        if (ddqPlacement[id] === tId) placed = id;
      });
      targetResults[tId] = (placed === DDQ.correctMap[tId]);
    });

    ddqChecked = true;
    ddqDone    = true;
    ddqRevealCorrect();
    ddqRender();

    /* Green targets + ✓/✗ badges */
    Object.keys(DDQ.correctMap).forEach(function(tId) {
      var t = document.getElementById(tId);
      if (!t) return;
      t.classList.add('s39-correct');
      var badge = document.createElement('div');
      badge.className = targetResults[tId] ? 'ddq-badge ddq-badge--correct' : 'ddq-badge ddq-badge--wrong';
      var badgeSvgOk  = '<svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var badgeSvgErr = '<svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      badge.innerHTML = targetResults[tId] ? badgeSvgOk : badgeSvgErr;
      t.appendChild(badge);
    });

    fbBold.textContent = 'לא מדויק, בואו נבין למה:';
    fbReg.textContent  = 'נמיר את המידות במציאות לסנטימטרים ונקבל אורך 1,200 ס"מ וגובה 600 ס"מ. אצל יובל (קנה מידה 1:50) נחלק את המידות ב-50 ונקבל: אורך 24 ס"מ, גובה 12 ס"מ. אצל ליאור (קנה מידה 1:20) נחלק את המידות ב-20 ונקבל: אורך 60 ס"מ, גובה 30 ס"מ.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(4); };
  }
}

function ddqRevealCorrect() {
  var assigned = new Set(Object.values(DDQ.revealMap));
  Object.keys(ddqPlacement).forEach(function(id) {
    if (!assigned.has(id)) ddqPlacement[id] = 'source';
  });
  Object.keys(DDQ.revealMap).forEach(function(tId) {
    ddqPlacement[DDQ.revealMap[tId]] = tId;
  });
}

function ddqToggleHint() {
  var popup = document.getElementById('s39-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function ddqCloseHint() {
  var popup = document.getElementById('s39-hint-popup');
  if (popup) popup.hidden = true;
}

/* ════════════════════════════════════════════
   Screen 40 — Q3א: text-input distance question
   ════════════════════════════════════════════ */

var s40Attempts = 0;
var s40Done     = false;

function s40Enter() {
  if (s40Done) return;
  s40Attempts = 0;
  var input = document.getElementById('s40-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var fb = document.getElementById('s40-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  var fbBold = document.getElementById('s40-fb-bold');
  var fbReg  = document.getElementById('s40-fb-regular');
  var fbIcon = document.getElementById('s40-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';
  var btn = document.getElementById('s40-check');
  if (btn) { btn.disabled = true; btn.textContent = 'צדקתי?'; btn.onclick = function() { s40Check(); }; }
  var hintBtn = document.getElementById('s40-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s40-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s40OnInput() {
  if (s40Done) return;
  var input = document.getElementById('s40-answer-input');
  var btn   = document.getElementById('s40-check');
  if (btn) btn.disabled = !(input && input.value.trim() !== '');
}

function s40Check() {
  if (s40Done) { goTo(5); return; }
  var input   = document.getElementById('s40-answer-input');
  var val     = parseFloat(input ? input.value : '');
  var correct = (val === 6);
  s40Attempts++;

  var fb      = document.getElementById('s40-feedback');
  var fbBold  = document.getElementById('s40-fb-bold');
  var fbReg   = document.getElementById('s40-fb-regular');
  var fbIcon  = document.getElementById('s40-fb-icon');
  var btn     = document.getElementById('s40-check');
  var hintBtn = document.getElementById('s40-hint-btn');

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s40Done = true;
    if (input) input.disabled = true;
    fbBold.textContent = 'נכון מאוד!';
    fbReg.innerHTML    = 'קנה המידה הוא 1:200, לכן 12 ס״מ בתמונה מייצגים 24 מטרים במציאות. העמדה צריכה להיות ברבע הדרך, ולכן נחשב 1/4 מ־24 מטרים ונקבל 6 מטרים.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(5); };

  } else if (s40Attempts === 1) {
    fbBold.textContent = 'לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;
    if (input) { input.value = ''; input.disabled = false; }
    btn.disabled = true;

  } else {
    s40Done = true;
    if (input) input.disabled = true;
    fbBold.textContent = 'לא מדויק, בואו נבין למה:';
    fbReg.innerHTML    = 'קנה המידה הוא 1:200, לכן 12 ס״מ בתמונה מייצגים 24 מטרים במציאות. העמדה צריכה להיות ברבע הדרך, ולכן נחשב 1/4 מ־24 מטרים ונקבל 6 מטרים.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(5); };
  }
}

function s40ToggleHint() {
  var popup = document.getElementById('s40-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s40CloseHint() {
  var popup = document.getElementById('s40-hint-popup');
  if (popup) popup.hidden = true;
}

/* ════════════════════════════════════════════
   Screen 41 — Q3ב: MCQ area + draggable ruler
   ════════════════════════════════════════════ */

var s41Selected  = null;
var s41Attempts  = 0;
var s41Solved    = false;
var S41_CORRECT  = 3;
var s41RulerDrag = null;

function s41Enter() {
  if (s41Solved) return;
  s41Selected  = null;
  s41Attempts  = 0;
  s41RulerDrag = null;

  document.querySelectorAll('[data-screen="5"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });

  var ruler = document.getElementById('s41-ruler');
  if (ruler) { ruler.style.left = ''; ruler.style.top = ''; }

  var fb = document.getElementById('s41-feedback');
  if (fb) { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
  var fbBold = document.getElementById('s41-fb-bold');
  var fbReg  = document.getElementById('s41-fb-regular');
  var fbIcon = document.getElementById('s41-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';

  var cont = document.getElementById('s41-continue');
  if (cont) { cont.disabled = true; cont.textContent = 'צדקתי?'; cont.onclick = function() { s41Submit(); }; }
  var hintBtn = document.getElementById('s41-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s41-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s41Select(idx) {
  if (s41Solved) return;
  s41Selected = idx;
  document.querySelectorAll('[data-screen="5"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var cont = document.getElementById('s41-continue');
  if (cont) cont.disabled = false;
}

function s41ToggleHint() {
  var popup = document.getElementById('s41-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s41CloseHint() {
  var popup = document.getElementById('s41-hint-popup');
  if (popup) popup.hidden = true;
}

function s41Submit() {
  if (s41Solved) { goTo(6); return; }
  if (s41Selected === null) return;

  var correct = (s41Selected === S41_CORRECT);
  s41Attempts++;

  var fb      = document.getElementById('s41-feedback');
  var fbBold  = document.getElementById('s41-fb-bold');
  var fbReg   = document.getElementById('s41-fb-regular');
  var fbIcon  = document.getElementById('s41-fb-icon');
  var cont    = document.getElementById('s41-continue');
  var hintBtn = document.getElementById('s41-hint-btn');
  var opts    = Array.from(document.querySelectorAll('[data-screen="5"] .s5-opt'));

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s41Solved = true;
    opts[s41Selected].classList.remove('is-selected');
    opts[s41Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent = 'יופי!';
    fbReg.innerHTML    = 'תחילה עלינו למצוא את אורך הצלע במציאות – 8 מטרים. אחר-כך, נחשב את שטח הריבוע: 64 מ”ר = 8 · 8';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    cont.disabled    = false;
    cont.textContent = 'שנמשיך?';
    cont.onclick     = function() { goTo(6); };

  } else if (s41Attempts === 1) {
    fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;
    opts[s41Selected].classList.remove('is-selected');
    s41Selected = null;
    cont.disabled = true;

  } else {
    s41Solved = true;
    opts.forEach(function(o, i) {
      if (i === S41_CORRECT)      o.classList.add('is-correct');
      else if (i === s41Selected) o.classList.add('is-incorrect');
      o.disabled = true;
    });
    fbBold.textContent = 'לא מדויק, בואו נבין למה:';
    fbReg.innerHTML    = 'תחילה עלינו למצוא את אורך הצלע במציאות – 8 מטרים. אחר-כך, נחשב את שטח הריבוע: 64 מ”ר = 8 · 8';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    cont.disabled    = false;
    cont.textContent = 'שנמשיך?';
    cont.onclick     = function() { goTo(6); };
  }
}

function s41RulerDown(e) {
  var ruler = document.getElementById('s41-ruler');
  if (!ruler) return;
  var transform = getComputedStyle(document.getElementById('app')).transform;
  var scale = 1;
  if (transform && transform !== 'none') {
    var m = transform.match(/matrix\(([^,]+)/);
    if (m) scale = parseFloat(m[1]) || 1;
  }
  s41RulerDrag = {
    scale:     scale,
    startX:    e.clientX,
    startY:    e.clientY,
    startLeft: ruler.offsetLeft,
    startTop:  ruler.offsetTop
  };
  ruler.style.cursor = 'grabbing';
  e.preventDefault();
}

document.addEventListener('mousemove', function(e) {
  if (!s41RulerDrag) return;
  var ruler = document.getElementById('s41-ruler');
  if (!ruler) return;
  var dx = (e.clientX - s41RulerDrag.startX) / s41RulerDrag.scale;
  var dy = (e.clientY - s41RulerDrag.startY) / s41RulerDrag.scale;
  ruler.style.left = (s41RulerDrag.startLeft + dx) + 'px';
  ruler.style.top  = (s41RulerDrag.startTop  + dy) + 'px';
});

document.addEventListener('mouseup', function() {
  if (!s41RulerDrag) return;
  var ruler = document.getElementById('s41-ruler');
  if (ruler) ruler.style.cursor = 'grab';
  s41RulerDrag = null;
});

/* ════════════════════════════════════════════
   Screen 42 — Q3ג: text-input stations question
   ════════════════════════════════════════════ */

var s42Attempts = 0;
var s42Done     = false;

function s42Enter() {
  if (s42Done) return;
  s42Attempts = 0;
  var input = document.getElementById('s42-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var fb = document.getElementById('s42-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  var fbBold = document.getElementById('s42-fb-bold');
  var fbReg  = document.getElementById('s42-fb-regular');
  var fbIcon = document.getElementById('s42-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';
  var btn = document.getElementById('s42-check');
  if (btn) { btn.disabled = true; btn.textContent = 'צדקתי?'; btn.onclick = function() { s42Check(); }; }
  var hintBtn = document.getElementById('s42-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s42-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s42OnInput() {
  if (s42Done) return;
  var input = document.getElementById('s42-answer-input');
  var btn   = document.getElementById('s42-check');
  if (btn) btn.disabled = !(input && input.value.trim() !== '');
}

function s42Check() {
  if (s42Done) { goTo(7); return; }
  var input   = document.getElementById('s42-answer-input');
  var val     = parseFloat(input ? input.value : '');
  var correct = (val === 16);
  s42Attempts++;

  var fb      = document.getElementById('s42-feedback');
  var fbBold  = document.getElementById('s42-fb-bold');
  var fbReg   = document.getElementById('s42-fb-regular');
  var fbIcon  = document.getElementById('s42-fb-icon');
  var btn     = document.getElementById('s42-check');
  var hintBtn = document.getElementById('s42-hint-btn');

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s42Done = true;
    if (input) input.disabled = true;
    fbBold.textContent = 'טוב מאוד!';
    fbReg.innerHTML    = 'כל עמדת VR מצריכה 4 מ״ר. נחלק את שטח המתחם (64 מ"ר) בשטח הדרוש לעמדה אחת: 16 = 4 ÷ 64, ונקבל שניתן להציב במתחם 16 עמדות.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(7); };

  } else if (s42Attempts === 1) {
    fbBold.textContent = 'לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;
    if (input) { input.value = ''; input.disabled = false; }
    btn.disabled = true;

  } else {
    s42Done = true;
    if (input) input.disabled = true;
    fbBold.textContent = 'זו טעות, לא נורא, בואו נלמד ממנה:';
    fbReg.innerHTML    = 'כל עמדת VR מצריכה 4 מ״ר. נחלק את שטח המתחם (64 מ"ר) בשטח הדרוש לעמדה אחת: 16 = 4 ÷ 64, ונקבל שניתן להציב במתחם 16 עמדות.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(7); };
  }
}

function s42ToggleHint() {
  var popup = document.getElementById('s42-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s42CloseHint() {
  var popup = document.getElementById('s42-hint-popup');
  if (popup) popup.hidden = true;
}

/* ════════════════════════════════════════════
   Screen 45 — Q4: קנה מידה של המפה
   ════════════════════════════════════════════ */

var s45Attempts = 0;
var s45Done     = false;


function s45Enter() {
  if (s45Done) return;
  finalAssessmentScore.correct = 0;
  s45Attempts = 0;
  var input = document.getElementById('s45-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var fb = document.getElementById('s45-feedback');
  if (fb) { fb.hidden = true; fb.className = 's5-inline-feedback s18-feedback-bar'; }
  var fbBold = document.getElementById('s45-fb-bold');
  var fbReg  = document.getElementById('s45-fb-regular');
  var fbIcon = document.getElementById('s45-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';
  var btn = document.getElementById('s45-check');
  if (btn) { btn.disabled = true; btn.textContent = 'המשך'; btn.onclick = function() { s45Check(); }; }
  var hintBtn = document.getElementById('s45-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s45-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s45OnInput() {
  if (s45Done) return;
  var input = document.getElementById('s45-answer-input');
  var btn   = document.getElementById('s45-check');
  if (btn) btn.disabled = !(input && input.value.trim() !== '');
}

function s45Check() {
  if (s45Done) { goTo(10); return; }
  var input   = document.getElementById('s45-answer-input');
  var val     = parseFloat((input ? input.value : '').replace(',', ''));
  var correct = (val === 25000);
  s45Attempts++;

  var fb      = document.getElementById('s45-feedback');
  var fbBold  = document.getElementById('s45-fb-bold');
  var fbReg   = document.getElementById('s45-fb-regular');
  var fbIcon  = document.getElementById('s45-fb-icon');
  var btn     = document.getElementById('s45-check');
  var hintBtn = document.getElementById('s45-hint-btn');

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s45Done = true;
    finalAssessmentScore.correct++;
    if (input) input.disabled = true;
    fbBold.textContent = 'תשובה יפה!';
    fbReg.innerHTML    = 'המרחק במציאות הוא 2 ק״מ, שהם 2,000 מטרים, שהם 200,000 ס״מ, ואורך המסלול על המסך הוא 8 ס״מ.<br>לכן, קנה המידה הוא 200,000 : 8.<br>נחלק ב-8, ונקבל קנה מידה מצומצם של 25,000 : 1.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(10); };

  } else if (s45Attempts === 1) {
    fbBold.textContent = 'לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;

  } else {
    s45Done = true;
    if (input) input.disabled = true;
    fbBold.textContent = 'זו טעות, אבל זה בסדר גמור, כך בדיוק לומדים!';
    fbReg.innerHTML    = 'המרחק במציאות הוא 2 ק״מ, שהם 2,000 מטרים, שהם 200,000 ס״מ, ואורך המסלול על המסך הוא 8 ס״מ.<br>לכן, קנה המידה הוא 200,000 : 8.<br>נחלק ב-8, ונקבל קנה מידה מצומצם של 25,000 : 1.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'שנמשיך?';
    btn.onclick     = function() { goTo(10); };
  }
}

function s45ToggleHint() {
  var popup = document.getElementById('s45-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s45CloseHint() {
  var popup = document.getElementById('s45-hint-popup');
  if (popup) popup.hidden = true;
}

/* ════════════════════════════════════════════
   Screen 47 — Q5ב: Multiple choice (checkboxes)
   ════════════════════════════════════════════ */

var s47Selected  = new Set();
var s47Attempts  = 0;
var s47Solved    = false;
var S47_CORRECT  = new Set([0, 2]); // Options 1 and 3 in human terms = indices 0 and 2

function s47Enter() {
  if (s47Solved) return;
  s47Selected  = new Set();
  s47Attempts  = 0;

  document.querySelectorAll('[data-screen="11"] .s47-checkbox').forEach(function(checkbox) {
    checkbox.checked  = false;
    checkbox.disabled = false;
  });
  document.querySelectorAll('[data-screen="11"] .s47-option').forEach(function(opt) {
    opt.classList.remove('is-correct', 'is-incorrect');
  });

  var fb = document.getElementById('s47-feedback');
  if (fb) { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
  var fbBold = document.getElementById('s47-fb-bold');
  var fbReg  = document.getElementById('s47-fb-regular');
  var fbIcon = document.getElementById('s47-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';

  var btn = document.getElementById('s47-check');
  if (btn) { btn.disabled = true; btn.textContent = 'המשך'; btn.onclick = function() { s47Check(); }; }
  var hintBtn = document.getElementById('s47-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s47-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s47Toggle(idx) {
  if (s47Solved) return;
  if (s47Selected.has(idx)) {
    s47Selected.delete(idx);
  } else {
    s47Selected.add(idx);
  }
  s47UpdateCheckBtn();
}

function s47UpdateCheckBtn() {
  var btn = document.getElementById('s47-check');
  if (btn) btn.disabled = (s47Selected.size === 0);
}

function s47Check() {
  if (s47Solved) { goTo(12); return; }

  var correct = (s47Selected.size === S47_CORRECT.size &&
                 Array.from(s47Selected).every(i => S47_CORRECT.has(i)));
  s47Attempts++;

  var fb      = document.getElementById('s47-feedback');
  var fbBold  = document.getElementById('s47-fb-bold');
  var fbReg   = document.getElementById('s47-fb-regular');
  var fbIcon  = document.getElementById('s47-fb-icon');
  var btn     = document.getElementById('s47-check');
  var hintBtn = document.getElementById('s47-hint-btn');
  var checkboxes = Array.from(document.querySelectorAll('[data-screen="11"] .s47-checkbox'));

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s47Solved = true;
    finalAssessmentScore.correct++;
    checkboxes.forEach(function(cb) { cb.disabled = true; });
    fbBold.textContent = 'כל הכבוד!';
    fbReg.innerHTML    = '3 גלילי כבל של 350 מ׳ הם 1,050 מ׳, שזה יותר מ-1 ק״מ (1,000 מ׳). בנוסף, בחישוב קנה המידה: 1,000 מ׳ לחלק ל-250 מ׳ (שזה הייצוג של 1 ס״מ במציאות) נותן 4 ס״מ.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'המשך';
    btn.onclick     = function() { goTo(12); };

  } else if (s47Attempts === 1) {
    fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;
    s47Selected = new Set();
    checkboxes.forEach(function(cb) { cb.checked = false; });
    s47UpdateCheckBtn();

  } else {
    s47Solved = true;
    checkboxes.forEach(function(cb) {
      var idx   = parseInt(cb.getAttribute('data-index'), 10);
      var label = cb.closest('.s47-option');
      if (S47_CORRECT.has(idx)) {
        cb.checked = true;
        if (label) label.classList.add('is-correct');
      } else if (s47Selected.has(idx)) {
        cb.checked = false;
        if (label) label.classList.add('is-incorrect');
      }
      cb.disabled = true;
    });
    fbBold.textContent = 'זו טעות:';
    fbReg.innerHTML    = '3 גלילי כבל של 350 מ׳ הם 1,050 מ׳ - זה מספיק לכיסוי המרחק של 1,000 מ׳. לגבי המפה: 1,000 מ׳ לחלק ל-250 מ׳ לכל ס״מ הם 4 ס״מ.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    btn.disabled    = false;
    btn.textContent = 'המשך';
    btn.onclick     = function() { goTo(12); };
  }
}

function s47ToggleHint() {
  var popup = document.getElementById('s47-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s47CloseHint() {
  var popup = document.getElementById('s47-hint-popup');
  if (popup) popup.hidden = true;
}

/* ════════════════════════════════════════════
   Screen 49 — ג: Zoom effect on scale
   ════════════════════════════════════════════ */

var s49Selected  = null;
var s49Attempts  = 0;
var s49Solved    = false;
var S49_CORRECT  = 1; // Noa (option index 1)

function s49Enter() {
  if (s49Solved) return;
  s49Selected  = null;
  s49Attempts  = 0;

  document.querySelectorAll('[data-screen="13"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });

  var fb = document.getElementById('s49-feedback');
  if (fb) { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
  var fbBold = document.getElementById('s49-fb-bold');
  var fbReg  = document.getElementById('s49-fb-regular');
  var fbIcon = document.getElementById('s49-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';

  var cont = document.getElementById('s49-continue');
  if (cont) { cont.disabled = true; cont.textContent = 'המשך'; cont.onclick = function() { s49Submit(); }; }
  var hintBtn = document.getElementById('s49-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s49-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s49Select(idx) {
  if (s49Solved) return;
  s49Selected = idx;
  document.querySelectorAll('[data-screen="13"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var cont = document.getElementById('s49-continue');
  if (cont) cont.disabled = false;
}

function s49ToggleHint() {
  var popup = document.getElementById('s49-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s49CloseHint() {
  var popup = document.getElementById('s49-hint-popup');
  if (popup) popup.hidden = true;
}

function s49Submit() {
  if (s49Solved) { goTo(14); return; }
  if (s49Selected === null) return;

  var correct = (s49Selected === S49_CORRECT);
  s49Attempts++;

  var fb      = document.getElementById('s49-feedback');
  var fbBold  = document.getElementById('s49-fb-bold');
  var fbReg   = document.getElementById('s49-fb-regular');
  var fbIcon  = document.getElementById('s49-fb-icon');
  var cont    = document.getElementById('s49-continue');
  var hintBtn = document.getElementById('s49-hint-btn');
  var opts    = Array.from(document.querySelectorAll('[data-screen="13"] .s5-opt'));

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s49Solved = true;
    finalAssessmentScore.correct++;
    opts[s49Selected].classList.remove('is-selected');
    opts[s49Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent = 'זה נכון מאוד!';
    fbReg.innerHTML    = 'זום עובד הפוך מהאינטואיציה: ככל שמגדילים את התמונה, כמות המציאות שנכנסת בכל סנטימטר קטנה. לכן, אם התמונה גדלה פי 4, קנה המידה מוקטן פי 4.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    cont.disabled    = false;
    cont.textContent = 'שנמשיך?';
    cont.onclick     = function() { goTo(14); };

  } else if (s49Attempts === 1) {
    fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;
    opts[s49Selected].classList.remove('is-selected');
    s49Selected = null;
    cont.disabled = true;

  } else {
    s49Solved = true;
    opts.forEach(function(o, i) {
      if (i === S49_CORRECT)      o.classList.add('is-correct');
      else if (i === s49Selected) o.classList.add('is-incorrect');
      o.disabled = true;
    });
    fbBold.textContent = 'זה לא מדויק. נסביר:';
    fbReg.innerHTML    = 'זום עובד הפוך מהאינטואיציה: ככל שמגדילים את התמונה, כמות המציאות שנכנסת בכל סנטימטר קטנה. לכן, אם התמונה גדלה פי 4, קנה המידה מוקטן פי 4.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    cont.disabled    = false;
    cont.textContent = 'שנמשיך?';
    cont.onclick     = function() { goTo(14); };
  }
}

/* ════════════════════════════════════════════
   Screen 51 — ד: Helicopter landing clearance
   ════════════════════════════════════════════ */

var s51Selected  = null;
var s51Attempts  = 0;
var s51Solved    = false;
var S51_CORRECT  = 0; // Option 1 (רחפן א')

function s51Enter() {
  if (s51Solved) return;
  s51Selected  = null;
  s51Attempts  = 0;

  document.querySelectorAll('[data-screen="15"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });

  var fb = document.getElementById('s51-feedback');
  if (fb) { fb.hidden = true; fb.classList.remove('s5-fb--correct', 's5-fb--incorrect'); }
  var fbBold = document.getElementById('s51-fb-bold');
  var fbReg  = document.getElementById('s51-fb-regular');
  var fbIcon = document.getElementById('s51-fb-icon');
  if (fbBold) fbBold.textContent = '';
  if (fbReg)  fbReg.textContent  = '';
  if (fbIcon) fbIcon.innerHTML   = '';

  var cont = document.getElementById('s51-continue');
  if (cont) { cont.disabled = true; cont.textContent = 'המשך'; cont.onclick = function() { s51Submit(); }; }
  var hintBtn = document.getElementById('s51-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s51-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
}

function s51Select(idx) {
  if (s51Solved) return;
  s51Selected = idx;
  document.querySelectorAll('[data-screen="15"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var cont = document.getElementById('s51-continue');
  if (cont) cont.disabled = false;
}

function s51ToggleHint() {
  var popup = document.getElementById('s51-hint-popup');
  if (popup) popup.hidden = !popup.hidden;
}

function s51CloseHint() {
  var popup = document.getElementById('s51-hint-popup');
  if (popup) popup.hidden = true;
}

function s51Submit() {
  if (s51Solved) { goTo(16); return; }
  if (s51Selected === null) return;

  var correct = (s51Selected === S51_CORRECT);
  s51Attempts++;

  var fb      = document.getElementById('s51-feedback');
  var fbBold  = document.getElementById('s51-fb-bold');
  var fbReg   = document.getElementById('s51-fb-regular');
  var fbIcon  = document.getElementById('s51-fb-icon');
  var cont    = document.getElementById('s51-continue');
  var hintBtn = document.getElementById('s51-hint-btn');
  var opts    = Array.from(document.querySelectorAll('[data-screen="15"] .s5-opt'));

  var checkSvg = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xSvg     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  fb.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s51Solved = true;
    finalAssessmentScore.correct++;
    opts[s51Selected].classList.remove('is-selected');
    opts[s51Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent = 'בדיוק!';
    fbReg.innerHTML    = 'רחפן א: 1 ס״מ כפול 6,250 = 62.5 מטרים.<br>רחפן ב: 2 ס״מ כפול 2,000 = 40 מטרים.<br>השטח של קרחת היער שצילם רחפן א עולה על 50 מטרים, ולכן היא זו שמתאימה להנחתה.';
    fbIcon.innerHTML   = checkSvg;
    fb.classList.add('s5-fb--correct');
    fb.hidden = false;
    cont.disabled    = false;
    cont.textContent = 'שנמשיך?';
    cont.onclick     = function() { goTo(16); };

  } else if (s51Attempts === 1) {
    fbBold.textContent = 'זה לא מדויק, ננסה שוב?';
    fbReg.textContent  = '';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    if (hintBtn) hintBtn.hidden = false;
    opts[s51Selected].classList.remove('is-selected');
    s51Selected = null;
    cont.disabled = true;

  } else {
    s51Solved = true;
    opts.forEach(function(o, i) {
      if (i === S51_CORRECT)      o.classList.add('is-correct');
      else if (i === s51Selected) o.classList.add('is-incorrect');
      o.disabled = true;
    });
    fbBold.textContent = 'זה לא מדויק. בואו נראה למה:';
    fbReg.innerHTML    = 'רחפן א: 1 ס״מ כפול 6,250 = 62.5 מטרים.<br>רחפן ב: 2 ס״מ כפול 2,000 = 40 מטרים.<br>השטח של קרחת היער שצילם רחפן א עולה על 50 מטרים, ולכן היא זו שמתאימה להנחתה.';
    fbIcon.innerHTML   = xSvg;
    fb.classList.add('s5-fb--incorrect');
    fb.hidden = false;
    cont.disabled    = false;
    cont.textContent = 'שנמשיך?';
    cont.onclick     = function() { goTo(16); };
  }
}

/* ════════════════════════════════════════════
   Screen 53 — Final Assessment Result
   ════════════════════════════════════════════ */

function s53Enter() {
  var successDiv = document.getElementById('s53-success');
  var retryDiv   = document.getElementById('s53-retry');
  var gif        = document.getElementById('s53-gif');

  if (!successDiv || !retryDiv) return;

  var passed    = finalAssessmentScore.correct >= 3;
  var character = localStorage.getItem('lomdaCharacter') || 'text';
  var charNum   = character === 'video' ? '2' : '1';
  var mood      = passed ? 'Happy' : 'Sad';

  if (gif) {
    gif.src = './assets/gifs/Character' + charNum + ' GIF ' + mood + '.gif';
  }

  if (passed) {
    successDiv.hidden = false;
    retryDiv.hidden   = true;
  } else {
    successDiv.hidden = true;
    retryDiv.hidden   = false;
  }
}

/* ── Quiz score + routing ── */
// חידון — 5 תרגילים, סף מעבר לתרגול כיתה: 4/5
// תרגיל 1: מסך 18       (שאלה 1)
// תרגיל 2: מסך 19 + 20  (שאלה 2 — א+ב, שניהם יחד)
// תרגיל 3: מסך 21       (שאלה 3)
// תרגיל 4: מסך 22       (שאלה 4)
// תרגיל 5: מסך 23       (שאלה 5)
function getQuizScore() {
  var count = 0;
  if (s18Correct)                count++; // שאלה 1
  if (s19Correct && s20Correct)  count++; // שאלה 2 (א+ב יחד)
  if (s21Correct)                count++; // שאלה 3
  if (s22Correct)                count++; // שאלה 4
  if (s23Correct)                count++; // שאלה 5
  return count;
}

// â‰¥4 נכון â†’ תרגול כיתה (מסך 24) | <4 â†’ תרגול בסיסי (מסך 25)
function routeAfterQuiz() {
  goTo(getQuizScore() >= 4 ? 24 : 25);
}

/* ── Basic practice score + routing ── */
// תרגול בסיסי — 4 תרגילים, סף מעבר לתרגול כיתה: 3/4
// תרגיל 1: מסך 26       (שאלה 1)
// תרגיל 2: מסך 27       (שאלה 2)
// תרגיל 3: מסך 28       (שאלה 3)
// תרגיל 4: מסך 29 + 30  (שאלה 4 — א+ב, שניהם יחד)

/* ── Dev tool bridge (index_dev.html postMessage) ── */
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'DEV_GOTO') { goTo(e.data.screen); }
});
window.addEventListener('load', function() {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_READY', total: TOTAL_SCREENS }, '*');
  }
});

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

