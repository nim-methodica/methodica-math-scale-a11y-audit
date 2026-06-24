'use strict';

const TOTAL_SCREENS = 24;
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
  if (n === 0) {
    if (window.lomdaState.selectedCharacter) {
      const card = document.querySelector(`.option-card[data-value="${window.lomdaState.selectedCharacter}"]`);
      if (card) {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
        document.getElementById('s0-continue').disabled = false;
      }
    }
  }

  if (n === 1) {
    const char = window.lomdaState.selectedCharacter;
    const src1 = char === 'text'
      ? './assets/images/Character1_binoculars.png'
      : './assets/images/Character2_binoculars.png';
    const src2 = char === 'text'
      ? './assets/images/Character1_roller.png'
      : './assets/images/Character2_roller.png';
    document.getElementById('s1-char-img-1').src = src1;
    document.getElementById('s1-char-img-2').src = src2;
    setScale(1000);

    const inner = document.querySelector('.hook-card-inner');
    inner.scrollTop = 0;

    const widget1 = document.getElementById('s1-char-widget-1');
    const widget2 = document.getElementById('s1-char-widget-2');
    widget1.classList.remove('hidden');
    widget2.classList.add('s1-char-hidden');

    const s1Btn = document.getElementById('s1-continue');
    s1Btn.disabled = true;

    inner.onscroll = null;
    inner.addEventListener('scroll', function onScroll() {
      const sectionB = document.querySelector('.hook-section-b');
      const sectionC = document.querySelector('.hook-section-c');
      const scrollTop = inner.scrollTop;
      const containerH = inner.clientHeight;

      const sectionBVisible = sectionB.offsetTop - scrollTop < containerH * 0.75;
      const sectionCVisible = sectionC.offsetTop - scrollTop < containerH * 0.75;

      if (sectionCVisible) {
        widget1.classList.add('hidden');
        widget2.classList.remove('s1-char-hidden');
      } else if (sectionBVisible) {
        widget1.classList.add('hidden');
        widget2.classList.add('s1-char-hidden');
      } else {
        widget1.classList.remove('hidden');
        widget2.classList.add('s1-char-hidden');
      }

      const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 8;
      s1Btn.disabled = !atBottom;
    });
  }

  if (n === 2) {
    document.querySelectorAll('[data-screen="2"] .option-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });
    document.getElementById('s2-continue').disabled = true;
    window.lomdaState.selectedDesign = null;

    const char = window.lomdaState.selectedCharacter;
    const isChar1 = char === 'text';
    document.getElementById('s2-char-a').src = isChar1
      ? './assets/images/Character1_popcorn.png'
      : './assets/images/Character2_popcorn.png';
    document.getElementById('s2-char-b').src = isChar1
      ? './assets/images/Character1_cards.png'
      : './assets/images/Character2_cards.png';
  }

  if (n === 3) { frcEnter(); }
  if (n === 4) { s4Enter(); }
  if (n === 5) { s5Enter(); }
  if (n === 6) {
    var s6Img = document.getElementById('s6-char-img');
    if (s6Img) {
      s6Img.src = window.lomdaState.selectedCharacter === 'text'
        ? './assets/images/Character1_holdhands.png'
        : './assets/images/Character2_holdhands.png';
    }
  }
  if (n === 7) { s7Enter(); }
  if (n === 8) { s8Enter(); }
  if (n === 9)  { s9Enter();  }
  if (n === 10) { s10Enter(); }
  if (n === 11) { s11Enter(); }
  if (n === 12) { s12Enter(); }
  if (n === 13) { s13Enter(); }
  if (n === 14) { s14Enter(); }
  if (n === 15) {
    var s15Img = document.getElementById('s15-char-img');
    if (s15Img) {
      s15Img.src = window.lomdaState.selectedCharacter === 'text'
        ? './assets/images/Character1_workout.png'
        : './assets/images/Character2_workout.png';
    }
  }
  if (n === 17) {
    var s17Img = document.getElementById('s17-char-img');
    if (s17Img) {
      s17Img.src = window.lomdaState.selectedCharacter === 'text'
        ? './assets/images/Character1.png'
        : './assets/images/Character2.png';
    }
  }
  if (n === 16) { s16Enter(); }
  if (n === 18) { s18Enter(); }
  if (n === 19) { s19Enter(); }
  if (n === 20) { s20Enter(); }
  if (n === 21) { s21Enter(); }
  if (n === 22) { s22Enter(); }
  if (n === 23) { s23Enter(); }
}

/* ── Screen 0: character selection ── */
function selectOption(cardEl) {
  document.querySelectorAll('[data-screen="0"] .option-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  cardEl.classList.add('selected');
  cardEl.setAttribute('aria-checked', 'true');
  window.lomdaState.selectedCharacter = cardEl.dataset.value;
  localStorage.setItem('lomdaCharacter', cardEl.dataset.value);
  document.getElementById('s0-continue').disabled = false;
}

function advanceFromS0() {
  if (!window.lomdaState.selectedCharacter) return;
  goTo(1);
}

/* ── Screen 2: design sub-selection ── */
function selectDesign(cardEl) {
  document.querySelectorAll('[data-screen="2"] .option-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  cardEl.classList.add('selected');
  cardEl.setAttribute('aria-checked', 'true');
  window.lomdaState.selectedDesign = cardEl.dataset.value;
  document.getElementById('s2-continue').disabled = false;
}

function advanceFromS2() {
  if (!window.lomdaState.selectedDesign) return;
  goTo(window.lomdaState.selectedDesign === 'video' ? 4 : 3);
}

/* ── Screen 3: flip cards ── */
function frcFlip(cardEl) {
  const idx = parseInt(cardEl.dataset.index);
  const nowFlipped = !cardEl.classList.contains('is-flipped');
  cardEl.classList.toggle('is-flipped');
  cardEl.setAttribute('aria-expanded', nowFlipped ? 'true' : 'false');
  cardEl.querySelector('.frc-card-back')[nowFlipped ? 'removeAttribute' : 'setAttribute']('aria-hidden', 'true');
  cardEl.querySelector('.frc-card-front')[nowFlipped ? 'setAttribute' : 'removeAttribute']('aria-hidden', 'true');
  if (nowFlipped) {
    frcRevealed[idx] = true;
    frcCheckUnlock();
  }
}

function frcCheckUnlock() {
  if (frcRevealed.every(Boolean)) {
    frcDone = true;
    document.getElementById('s3-continue').disabled = false;
  }
}

function frcEnter() {
  document.querySelectorAll('[data-screen="3"] .frc-card').forEach((card, i) => {
    if (frcRevealed[i]) {
      card.classList.add('is-flipped');
      card.setAttribute('aria-expanded', 'true');
    } else {
      card.classList.remove('is-flipped');
      card.setAttribute('aria-expanded', 'false');
    }
  });
  document.getElementById('s3-continue').disabled = !frcDone;
}

function advanceFromS3() {
  goTo(5);
}

/* ── Screen 1: scale widget ── */
function setScale(ratio) {
  const container = document.querySelector('.field-container');
  if (container) container.dataset.scale = String(ratio);

  document.querySelectorAll('.scale-input').forEach(inp => {
    inp.checked = (parseInt(inp.value) === ratio);
  });
}

/* ── Screen 4: video player ── */
function s4Enter() {
  clearInterval(s4Timer);
  s4Playing = false;
  document.getElementById('s4-placeholder').hidden = false;
  document.getElementById('s4-playing').hidden = true;
  document.getElementById('s4-progress-bar').style.width = '0%';
  document.getElementById('s4-continue').disabled = !s4VideoEnded;

  var charImg = document.getElementById('s4-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1_popcorn.png'
      : './assets/images/Character2_popcorn.png';
  }
}

function s4Start() {
  if (s4Playing) return;
  s4Playing = true;

  document.getElementById('s4-placeholder').hidden = true;
  document.getElementById('s4-playing').hidden = false;
  document.getElementById('s4-continue').disabled = true;

  const bar = document.getElementById('s4-progress-bar');
  bar.style.width = '0%';

  const DURATION_MS = 6000;
  const start = Date.now();

  s4Timer = setInterval(function () {
    const pct = Math.min(100, ((Date.now() - start) / DURATION_MS) * 100);
    bar.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(s4Timer);
      s4Playing = false;
      s4VideoEnded = true;
      document.getElementById('s4-continue').disabled = false;
    }
  }, 80);
}

function s4Back() {
  clearInterval(s4Timer);
  s4Playing = false;
  goTo(2);
}

function s4Advance() {
  if (!s4VideoEnded) return;
  goTo(5);
}

/* ── Screen 5: SingleChoiceQuestion ── */
let s5Selected = null;
let s5Submitted = false;
const S5_CORRECT = 0;

let s5Q2Selections = [null, null, null, null];
let s5Q2Submitted = false;
const S5_Q2_CORRECT = ['3,000', '1,700', '320', '700,000'];

function s5Enter() {
  s5Selected = null;
  s5Submitted = false;
  document.querySelectorAll('[data-screen="5"] .s5-opt').forEach(function (opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });

  // Reset inline feedback
  var feedback = document.getElementById('s5-inline-feedback');
  feedback.hidden = true;
  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  document.getElementById('s5-fb-bold').textContent = '';
  document.getElementById('s5-fb-regular').textContent = '';
  document.getElementById('s5-fb-icon').innerHTML = '';

  // Set toggle pill active state based on chosen design
  var design = window.lomdaState.selectedDesign;
  var btnVideo = document.getElementById('s5-toggle-video');
  var btnCards = document.getElementById('s5-toggle-cards');
  if (btnVideo && btnCards) {
    if (design === 'video') {
      btnVideo.classList.add('s3-toggle-opt--active');
      btnVideo.removeAttribute('onclick');
      btnCards.classList.remove('s3-toggle-opt--active');
      btnCards.setAttribute('onclick', 'goTo(3)');
    } else {
      btnCards.classList.add('s3-toggle-opt--active');
      btnCards.removeAttribute('onclick');
      btnVideo.classList.remove('s3-toggle-opt--active');
      btnVideo.setAttribute('onclick', 'goTo(4)');
    }
  }

  // Set character image based on chosen character
  var charImg = document.getElementById('s5-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }

  // Reset check and continue buttons
  var checkBtn = document.getElementById('s5-check');
  if (checkBtn) checkBtn.disabled = true;
  document.getElementById('s5-continue').disabled = true;

  // Reset and scroll body to top
  var scrollEl = document.querySelector('[data-screen="5"] .s5-body');
  if (scrollEl) scrollEl.scrollTop = 0;

  // Character widget: hidden on enter, appears when scrolled into info section
  var charWidget = document.getElementById('s5-char-widget');
  if (charWidget) charWidget.classList.add('hidden');
  if (scrollEl) {
    scrollEl.onscroll = function () {
      var cw = document.getElementById('s5-char-widget');
      if (!cw) return;
      var infoSection = document.querySelector('[data-screen="5"] .s5-info-section');
      var q2wrap = document.getElementById('s5-q2-wrap');
      var infoTop = infoSection ? infoSection.offsetTop : Infinity;
      var q2Top = q2wrap ? q2wrap.offsetTop : Infinity;
      var infoVisible = scrollEl.scrollTop + scrollEl.clientHeight > infoTop + 40;
      var reachedQ2 = scrollEl.scrollTop + scrollEl.clientHeight > q2Top + 80;
      if (infoVisible && !reachedQ2) {
        cw.classList.remove('hidden');
      } else {
        cw.classList.add('hidden');
      }
    };
  }

  // Reset Q2
  s5Q2Selections = [null, null, null, null];
  s5Q2Submitted = false;
  var q2CheckBtn = document.getElementById('s5-q2-check');
  if (q2CheckBtn) q2CheckBtn.disabled = true;
  var q2feedback = document.getElementById('s5-q2-inline-feedback');
  if (q2feedback) {
    q2feedback.hidden = true;
    q2feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
    document.getElementById('s5-q2-fb-bold').textContent = '';
    document.getElementById('s5-q2-fb-regular').textContent = '';
    document.getElementById('s5-q2-fb-icon').innerHTML = '';
  }
  document.querySelectorAll('[data-screen="5"] .s5-dropdown').forEach(function (d) {
    d.classList.remove('is-open', 'is-correct', 'is-incorrect');
    var panel = document.getElementById('s5-dd-panel-' + d.dataset.row);
    if (panel) panel.hidden = true;
    var valEl = document.getElementById('s5-dd-val-' + d.dataset.row);
    if (valEl) valEl.textContent = '-';
    var iconEl = document.getElementById('s5-dd-icon-' + d.dataset.row);
    if (iconEl) iconEl.innerHTML = '';
  });
}

function s5Select(idx) {
  if (s5Submitted) return;
  if (s5Selected === idx) return;
  s5Selected = idx;
  document.querySelectorAll('[data-screen="5"] .s5-opt').forEach(function (opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var checkBtn = document.getElementById('s5-check');
  if (checkBtn) checkBtn.disabled = false;
}

function s5Continue() {
  goTo(6);
}

function s5Submit() {
  if (s5Selected === null || s5Submitted) return;
  s5Submitted = true;

  var correct = (s5Selected === S5_CORRECT);
  var opts = document.querySelectorAll('[data-screen="5"] .s5-opt');

  opts[s5Selected].classList.remove('is-selected');
  opts[s5Selected].classList.add(correct ? 'is-correct' : 'is-incorrect');
  opts.forEach(function (opt) { opt.disabled = true; });

  // Disable check button (stays visible in question area)
  var checkBtn = document.getElementById('s5-check');
  if (checkBtn) checkBtn.disabled = true;

  // Show feedback toast above bottom bar
  document.getElementById('s5-fb-bold').textContent = correct ? 'צדקת!' : 'זו טעות';
  document.getElementById('s5-fb-regular').textContent = 'המספר 100 אשר בצד ימין של קנה המידה מייצג את האורך במציאות.';
  var icon = document.getElementById('s5-fb-icon');
  if (correct) {
    icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#609E12"/><path d="M9 16.5L13.5 21L23 11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else {
    icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  var feedback = document.getElementById('s5-inline-feedback');
  feedback.classList.add(correct ? 's5-fb--correct' : 's5-fb--incorrect');
  feedback.hidden = false;

  // Enable continue button after feedback is shown
  var continueBtn = document.getElementById('s5-continue');
  if (continueBtn) continueBtn.disabled = false;

  s5CheckBothDone();
}

function s5CheckBothDone() {
  if (s5Submitted && s5Q2Submitted) {
    document.getElementById('s5-continue').disabled = false;
  }
}

function s5Q2Toggle(rowIdx) {
  if (s5Q2Submitted) return;
  var dd = document.querySelector('[data-screen="5"] .s5-dropdown[data-row="' + rowIdx + '"]');
  var isOpen = dd.classList.contains('is-open');
  document.querySelectorAll('[data-screen="5"] .s5-dropdown').forEach(function (d) {
    d.classList.remove('is-open');
    document.getElementById('s5-dd-panel-' + d.dataset.row).hidden = true;
  });
  if (!isOpen) {
    dd.classList.add('is-open');
    document.getElementById('s5-dd-panel-' + rowIdx).hidden = false;
  }
}

function s5Q2Select(rowIdx, value) {
  s5Q2Selections[rowIdx] = value;
  document.getElementById('s5-dd-val-' + rowIdx).textContent = value;
  var dd = document.querySelector('[data-screen="5"] .s5-dropdown[data-row="' + rowIdx + '"]');
  dd.classList.remove('is-open');
  document.getElementById('s5-dd-panel-' + rowIdx).hidden = true;
  if (s5Q2Selections.every(function (v) { return v !== null; })) {
    document.getElementById('s5-q2-check').disabled = false;
  }
}

function s5Q2Submit() {
  if (s5Q2Submitted) return;
  s5Q2Submitted = true;
  document.getElementById('s5-q2-check').disabled = true;

  var allCorrect = true;
  s5Q2Selections.forEach(function (val, i) {
    var dd = document.querySelector('[data-screen="5"] .s5-dropdown[data-row="' + i + '"]');
    var correct = (val === S5_Q2_CORRECT[i]);
    if (!correct) allCorrect = false;
    dd.classList.add(correct ? 'is-correct' : 'is-incorrect');
    // Show correct answer value in every dropdown
    var valEl = document.getElementById('s5-dd-val-' + i);
    if (valEl) valEl.textContent = S5_Q2_CORRECT[i];
    var iconEl = document.getElementById('s5-dd-icon-' + i);
    if (iconEl) {
      iconEl.innerHTML = correct
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#B20010"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });

  // Show inline feedback
  document.getElementById('s5-q2-fb-bold').textContent = allCorrect ? 'צדקת!' : 'זו טעות';
  document.getElementById('s5-q2-fb-regular').textContent = 'התשובות הנכונות מוצגות כעת.';
  var q2icon = document.getElementById('s5-q2-fb-icon');
  if (q2icon) {
    q2icon.innerHTML = allCorrect
      ? '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#609E12"/><path d="M9 16.5L13.5 21L23 11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var feedback = document.getElementById('s5-q2-inline-feedback');
  feedback.classList.add(allCorrect ? 's5-fb--correct' : 's5-fb--incorrect');
  feedback.hidden = false;

  s5CheckBothDone();
}

/* ── Screen 16: שאלת חימום (duplicate of screen 5) ── */
let s16Selected = null;
let s16Submitted = false;
const S16_CORRECT = 0;

let s16Q2Selections = [null, null, null, null];
let s16Q2Submitted = false;
const S16_Q2_CORRECT = ['3,000', '1,700', '320', '700,000'];

function s16Enter() {
  s16Selected = null;
  s16Submitted = false;
  document.querySelectorAll('[data-screen="16"] .s5-opt').forEach(function (opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });

  var feedback = document.getElementById('s16-inline-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
    document.getElementById('s16-fb-bold').textContent = '';
    document.getElementById('s16-fb-regular').textContent = '';
    document.getElementById('s16-fb-icon').innerHTML = '';
  }

  var charImg = document.getElementById('s16-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }

  var contBtn = document.getElementById('s16-continue');
  if (contBtn) contBtn.disabled = true;

}

function s16Select(idx) {
  if (s16Submitted) return;
  if (s16Selected === idx) return;
  s16Selected = idx;
  document.querySelectorAll('[data-screen="16"] .s5-opt').forEach(function (opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  s16Submit();
}

function s16ToggleHint() {
  var popup = document.getElementById('s16-hint-popup');
  if (popup) popup.hidden = false;
}

function s16CloseHint() {
  var popup = document.getElementById('s16-hint-popup');
  if (popup) popup.hidden = true;
}

/* ── Screen 18 ── */
var s18Attempts = 0;
var s18Solved = false;
var s18Correct = false;
var s18RulerDragging = false;
var s18RulerOffX = 0, s18RulerOffY = 0;
var s18RulerInitialized = false;

function s18GetScale() {
  var scaleX = window.innerWidth / 1280;
  var scaleY = window.innerHeight / 710;
  return Math.min(scaleX, scaleY);
}

function s18InitRuler() {
  if (s18RulerInitialized) return;
  s18RulerInitialized = true;
  var ruler = document.getElementById('s18-ruler');
  if (!ruler) return;
  ruler.addEventListener('mousedown', function(e) {
    s18RulerDragging = true;
    var scale = s18GetScale();
    var rect = ruler.getBoundingClientRect();
    s18RulerOffX = (e.clientX - rect.left) / scale;
    s18RulerOffY = (e.clientY - rect.top) / scale;
    ruler.style.cursor = 'grabbing';
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!s18RulerDragging) return;
    var r = document.getElementById('s18-ruler');
    if (!r) return;
    var scale = s18GetScale();
    var app = document.getElementById('app');
    var appRect = app.getBoundingClientRect();
    r.style.left = ((e.clientX - appRect.left) / scale - s18RulerOffX) + 'px';
    r.style.top  = ((e.clientY - appRect.top)  / scale - s18RulerOffY) + 'px';
  });
  document.addEventListener('mouseup', function() {
    if (!s18RulerDragging) return;
    s18RulerDragging = false;
    var r = document.getElementById('s18-ruler');
    if (r) r.style.cursor = 'grab';
  });
}

function s18Enter() {
  s18Attempts = 0;
  s18Solved = false;
  s18Correct = false;
  var ruler = document.getElementById('s18-ruler');
  if (ruler) { ruler.style.left = '37.6946px'; ruler.style.top = '171.957px'; }
  s18InitRuler();
  var charImg = document.getElementById('s18-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }
  var input = document.getElementById('s18-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var continueBtn = document.getElementById('s18-continue');
  if (continueBtn) continueBtn.disabled = true;
  var hintBtn = document.getElementById('s18-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s18-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  var feedback = document.getElementById('s18-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  }
}

function s18CheckInput() {
  if (s18Solved) return;
  var input = document.getElementById('s18-answer-input');
  var continueBtn = document.getElementById('s18-continue');
  if (continueBtn) continueBtn.disabled = !(input && input.value.trim().length > 0);
}

function s18ToggleHint() {
  var popup = document.getElementById('s18-hint-popup');
  if (popup) popup.hidden = false;
}

function s18CloseHint() {
  var popup = document.getElementById('s18-hint-popup');
  if (popup) popup.hidden = true;
}

function s18Submit() {
  if (s18Solved) { goTo(19); return; }

  var input = document.getElementById('s18-answer-input');
  var answer = (input ? input.value.trim() : '').replace(/\s/g, '');
  var correct = (answer === '24');

  s18Attempts++;

  var feedback  = document.getElementById('s18-feedback');
  var fbBold    = document.getElementById('s18-fb-bold');
  var fbRegular = document.getElementById('s18-fb-regular');
  var fbIcon    = document.getElementById('s18-fb-icon');
  var continueBtn = document.getElementById('s18-continue');

  var explanation = '1.4 מטרים שווים ל-140 ס"מ, ולכן קנה המידה הוא 140 : 7.<br>' +
                    'כדי להגיע לקנה מידה מצומצם, נחלק את שני המספרים ב-7, ונקבל 20 : 1.';

  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s18Solved = true;
    s18Correct = true;
    fbBold.textContent = 'יפה מאוד!';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--correct');
    feedback.hidden = false;
    input.disabled = true;
    continueBtn.disabled = false;
  } else if (s18Attempts === 1) {
    fbBold.textContent = 'זה לא מדוייק, ננסה שוב?';
    fbRegular.innerHTML = '';
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    document.getElementById('s18-hint-btn').hidden = false;
    input.value = '';
    continueBtn.disabled = true;
  } else {
    s18Solved = true;
    fbBold.textContent = 'זו טעות, בואו נדייק';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    input.disabled = true;
    continueBtn.disabled = false;
  }
}

/* ── Ratio helper ── */
function checkRatio(input, a, b) {
  var s = input.replace(/\s/g, '').replace(/,/g, '');
  var parts = s.split(':');
  if (parts.length !== 2) return false;
  return (parts[0] === String(a) && parts[1] === String(b)) ||
         (parts[0] === String(b) && parts[1] === String(a));
}

/* ── Screen 19 ── */
var s19Attempts = 0;
var s19Solved = false;
var s19Correct = false;

function s19Enter() {
  s19Attempts = 0;
  s19Solved = false;
  s19Correct = false;
  var input = document.getElementById('s19-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var continueBtn = document.getElementById('s19-continue');
  if (continueBtn) continueBtn.disabled = true;
  var hintBtn = document.getElementById('s19-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s19-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  var feedback = document.getElementById('s19-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  }
}

function s19CheckInput() {
  if (s19Solved) return;
  var input = document.getElementById('s19-answer-input');
  var continueBtn = document.getElementById('s19-continue');
  if (continueBtn) continueBtn.disabled = !(input && input.value.trim().length > 0);
}

function s19ToggleHint() {
  var popup = document.getElementById('s19-hint-popup');
  if (popup) popup.hidden = false;
}

function s19CloseHint() {
  var popup = document.getElementById('s19-hint-popup');
  if (popup) popup.hidden = true;
}

function s19Submit() {
  if (s19Solved) { goTo(20); return; }

  var input = document.getElementById('s19-answer-input');
  var answer = input ? input.value : '';
  var correct = checkRatio(answer, 1, 20);

  s19Attempts++;

  var feedback    = document.getElementById('s19-feedback');
  var fbBold      = document.getElementById('s19-fb-bold');
  var fbRegular   = document.getElementById('s19-fb-regular');
  var fbIcon      = document.getElementById('s19-fb-icon');
  var continueBtn = document.getElementById('s19-continue');

  var explanation = '1.4 מטרים שווים ל-140 ס"מ,<br>' +
                    'ולכן קנה המידה הוא 140 : 7.<br>' +
                    'כדי להגיע לקנה מידה מצומצם, נחלק את שני המספרים ב-7, ונקבל 20 : 1.';

  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s19Solved = true;
    s19Correct = true;
    fbBold.textContent = 'יפה מאוד!';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--correct');
    feedback.hidden = false;
    input.disabled = true;
    continueBtn.disabled = false;
  } else if (s19Attempts === 1) {
    fbBold.textContent = 'זה לא מדוייק, ננסה שוב?';
    fbRegular.innerHTML = '';
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    document.getElementById('s19-hint-btn').hidden = false;
    input.value = '';
    continueBtn.disabled = true;
  } else {
    s19Solved = true;
    fbBold.textContent = 'זו טעות, בואו נדייק';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    input.disabled = true;
    continueBtn.disabled = false;
  }
}

/* ── Screen 22 ── */
var s22Selected = null;
var s22Attempts = 0;
var s22Solved = false;
var s22Correct = false;
var S22_CORRECT = 3;

function s22Enter() {
  s22Selected = null;
  s22Attempts = 0;
  s22Solved = false;
  s22Correct = false;
  document.querySelectorAll('[data-screen="22"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });
  var continueBtn = document.getElementById('s22-continue');
  if (continueBtn) continueBtn.disabled = true;
  var hintBtn = document.getElementById('s22-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s22-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  var feedback = document.getElementById('s22-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  }
  var tooltip = document.getElementById('s22-help-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

function s22Select(idx) {
  if (s22Solved) return;
  if (s22Selected === idx) return;
  s22Selected = idx;
  document.querySelectorAll('[data-screen="22"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var continueBtn = document.getElementById('s22-continue');
  if (continueBtn) continueBtn.disabled = false;
}

function s22ToggleHelp() {
  var tooltip = document.getElementById('s22-help-tooltip');
  if (tooltip) tooltip.classList.toggle('visible');
}

function s22ToggleHint() {
  var popup = document.getElementById('s22-hint-popup');
  if (popup) popup.hidden = false;
}

function s22CloseHint() {
  var popup = document.getElementById('s22-hint-popup');
  if (popup) popup.hidden = true;
}

function s22Submit() {
  if (s22Solved) { goTo(23); return; }
  if (s22Selected === null) return;

  var correct = (s22Selected === S22_CORRECT);
  s22Attempts++;

  var feedback    = document.getElementById('s22-feedback');
  var fbBold      = document.getElementById('s22-fb-bold');
  var fbRegular   = document.getElementById('s22-fb-regular');
  var fbIcon      = document.getElementById('s22-fb-icon');
  var continueBtn = document.getElementById('s22-continue');

  var explanation = 'קילומטר אחד שווה ל-100,000 סנטימטרים. כלומר - 7,000 ק"מ הם 700,000,000 ס"מ.<br>' +
                    'נצמצם את המרחק במציאות ב-100,000,000 ונקבל:<br>' +
                    '7 = 100,000,000 ÷ 700,000,000';

  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  var opts = document.querySelectorAll('[data-screen="22"] .s5-opt');

  if (correct) {
    s22Solved = true;
    s22Correct = true;
    opts[s22Selected].classList.remove('is-selected');
    opts[s22Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent = 'יפה!';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--correct');
    feedback.hidden = false;
    continueBtn.disabled = false;
  } else if (s22Attempts === 1) {
    opts[s22Selected].classList.remove('is-selected');
    fbBold.textContent = 'זה לא מדוייק, ננסה שוב?';
    fbRegular.innerHTML = '';
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    document.getElementById('s22-hint-btn').hidden = false;
    s22Selected = null;
    continueBtn.disabled = true;
  } else {
    s22Solved = true;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.classList.remove('is-selected');
      if (i === S22_CORRECT) o.classList.add('is-correct');
      else if (i === s22Selected) o.classList.add('is-incorrect');
    });
    fbBold.textContent = 'זו טעות, בואו נדייק';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    continueBtn.disabled = false;
  }
}

/* ── Screen 21 ── */
var s21Attempts = 0;
var s21Solved = false;
var s21Correct = false;

function s21Enter() {
  s21Attempts = 0;
  s21Solved = false;
  s21Correct = false;
  var charImg = document.getElementById('s21-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }
  var input = document.getElementById('s21-answer-input');
  if (input) { input.value = ''; input.disabled = false; }
  var continueBtn = document.getElementById('s21-continue');
  if (continueBtn) continueBtn.disabled = true;
  var hintBtn = document.getElementById('s21-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s21-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  var feedback = document.getElementById('s21-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  }
}

function s21CheckInput() {
  if (s21Solved) return;
  var input = document.getElementById('s21-answer-input');
  var continueBtn = document.getElementById('s21-continue');
  if (continueBtn) continueBtn.disabled = !(input && input.value.trim().length > 0);
}

function s21ToggleHint() {
  var popup = document.getElementById('s21-hint-popup');
  if (popup) popup.hidden = false;
}

function s21CloseHint() {
  var popup = document.getElementById('s21-hint-popup');
  if (popup) popup.hidden = true;
}

function s21Submit() {
  if (s21Solved) { goTo(22); return; }

  var input = document.getElementById('s21-answer-input');
  var answer = input ? input.value : '';
  var correct = checkRatio(answer, 1, 25000);

  s21Attempts++;

  var feedback    = document.getElementById('s21-feedback');
  var fbBold      = document.getElementById('s21-fb-bold');
  var fbRegular   = document.getElementById('s21-fb-regular');
  var fbIcon      = document.getElementById('s21-fb-icon');
  var continueBtn = document.getElementById('s21-continue');

  var explanation = '2 ק"מ הם 200,000 ס"מ.<br>' +
                    'מכאן שהיחס בין אורך כל קטע במפה לבין אורך כל קטע במציאות הוא 200,000 : 8.<br>' +
                    'נצמצם ב-8, ונקבל את קנה המידה: 25,000 : 1';

  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  if (correct) {
    s21Solved = true;
    s21Correct = true;
    fbBold.textContent = 'מצוין!';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--correct');
    feedback.hidden = false;
    input.disabled = true;
    continueBtn.disabled = false;
  } else if (s21Attempts === 1) {
    fbBold.textContent = 'זה לא מדוייק, ננסה שוב?';
    fbRegular.innerHTML = '';
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    document.getElementById('s21-hint-btn').hidden = false;
    input.value = '';
    continueBtn.disabled = true;
  } else {
    s21Solved = true;
    fbBold.textContent = 'זו טעות, בואו נדייק';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    input.disabled = true;
    continueBtn.disabled = false;
  }
}

/* ── Screen 20 ── */
var s20Selected = null;
var s20Attempts = 0;
var s20Solved = false;
var s20Correct = false;
var S20_CORRECT = 1;

function s20Enter() {
  s20Selected = null;
  s20Attempts = 0;
  s20Solved = false;
  s20Correct = false;
  document.querySelectorAll('[data-screen="20"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });
  var continueBtn = document.getElementById('s20-continue');
  if (continueBtn) continueBtn.disabled = true;
  var hintBtn = document.getElementById('s20-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s20-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  var feedback = document.getElementById('s20-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  }
}

function s20Select(idx) {
  if (s20Solved) return;
  if (s20Selected === idx) return;
  s20Selected = idx;
  document.querySelectorAll('[data-screen="20"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var continueBtn = document.getElementById('s20-continue');
  if (continueBtn) continueBtn.disabled = false;
}

function s20ToggleHint() {
  var popup = document.getElementById('s20-hint-popup');
  if (popup) popup.hidden = false;
}

function s20CloseHint() {
  var popup = document.getElementById('s20-hint-popup');
  if (popup) popup.hidden = true;
}

function s20Submit() {
  if (s20Solved) { goTo(21); return; }
  if (s20Selected === null) return;

  var correct = (s20Selected === S20_CORRECT);
  s20Attempts++;

  var feedback    = document.getElementById('s20-feedback');
  var fbBold      = document.getElementById('s20-fb-bold');
  var fbRegular   = document.getElementById('s20-fb-regular');
  var fbIcon      = document.getElementById('s20-fb-icon');
  var continueBtn = document.getElementById('s20-continue');

  var explanation = 'נמיר את מידות השטיח במציאות לסנטימטרים: 180 ס"מ ו-240 ס"מ.<br>' +
                    'מכיוון שקנה המידה הוא 20 : 1 (הקטנה פי 20), נחלק כל מידה ב-20 ונקבל שרוחב השטיח בתרשים הוא 9 ס"מ ואורכו 12 ס"מ.';

  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');

  var opts = document.querySelectorAll('[data-screen="20"] .s5-opt');

  if (correct) {
    s20Solved = true;
    s20Correct = true;
    opts[s20Selected].classList.remove('is-selected');
    opts[s20Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent = 'יפה!';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--correct');
    feedback.hidden = false;
    continueBtn.disabled = false;
  } else if (s20Attempts === 1) {
    opts[s20Selected].classList.remove('is-selected');
    fbBold.textContent = 'זה לא מדוייק, ננסה שוב?';
    fbRegular.innerHTML = '';
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    document.getElementById('s20-hint-btn').hidden = false;
    s20Selected = null;
    continueBtn.disabled = true;
  } else {
    s20Solved = true;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.classList.remove('is-selected');
      if (i === S20_CORRECT) o.classList.add('is-correct');
      else if (i === s20Selected) o.classList.add('is-incorrect');
    });
    fbBold.textContent = 'זו טעות, בואו נדייק';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    continueBtn.disabled = false;
  }
}

function s16Submit() {
  if (s16Selected === null || s16Submitted) return;
  s16Submitted = true;

  var correct = (s16Selected === S16_CORRECT);
  var opts = document.querySelectorAll('[data-screen="16"] .s5-opt');
  opts[s16Selected].classList.remove('is-selected');
  opts[s16Selected].classList.add(correct ? 'is-correct' : 'is-incorrect');
  opts.forEach(function (opt) { opt.disabled = true; });

  document.getElementById('s16-fb-bold').textContent = correct ? 'נכון!' : 'זו טעות, אבל חשוב שניסית!';
  document.getElementById('s16-fb-regular').innerHTML = 'קנה מידה נקרא משמאל לימין: המספר השמאלי מייצג את הגודל בסרטוט, והמספר הימני מייצג את הגודל במציאות.';

  var icon = document.getElementById('s16-fb-icon');
  if (correct) {
    icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else {
    icon.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  var feedback = document.getElementById('s16-inline-feedback');
  feedback.classList.add(correct ? 's5-fb--correct' : 's5-fb--incorrect');
  feedback.hidden = false;

  s16CheckBothDone();
}

function s16CheckBothDone() {
  if (!s16Submitted) return;
  var contBtn = document.getElementById('s16-continue');
  if (contBtn) contBtn.disabled = false;
}

function s16Q2Toggle(rowIdx) {
  if (s16Q2Submitted) return;
  var dd = document.querySelector('[data-screen="16"] .s5-dropdown[data-row="' + rowIdx + '"]');
  var isOpen = dd.classList.contains('is-open');
  document.querySelectorAll('[data-screen="16"] .s5-dropdown').forEach(function (d) {
    d.classList.remove('is-open');
    document.getElementById('s16-dd-panel-' + d.dataset.row).hidden = true;
  });
  if (!isOpen) {
    dd.classList.add('is-open');
    document.getElementById('s16-dd-panel-' + rowIdx).hidden = false;
  }
}

function s16Q2Select(rowIdx, value) {
  s16Q2Selections[rowIdx] = value;
  document.getElementById('s16-dd-val-' + rowIdx).textContent = value;
  var dd = document.querySelector('[data-screen="16"] .s5-dropdown[data-row="' + rowIdx + '"]');
  dd.classList.remove('is-open');
  document.getElementById('s16-dd-panel-' + rowIdx).hidden = true;
  s16CheckBothDone();
}

function s16Q2Submit() {
  if (s16Q2Submitted) return;
  s16Q2Submitted = true;

  var allCorrect = true;
  s16Q2Selections.forEach(function (val, i) {
    var dd = document.querySelector('[data-screen="16"] .s5-dropdown[data-row="' + i + '"]');
    var correct = (val === S16_Q2_CORRECT[i]);
    if (!correct) allCorrect = false;
    dd.classList.add(correct ? 'is-correct' : 'is-incorrect');
    var valEl = document.getElementById('s16-dd-val-' + i);
    if (valEl) valEl.textContent = S16_Q2_CORRECT[i];
    var iconEl = document.getElementById('s16-dd-icon-' + i);
    if (iconEl) {
      iconEl.innerHTML = correct
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#609E12"/><path d="M4.5 8.25L6.75 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#B20010"/><path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });

  document.getElementById('s16-q2-fb-bold').textContent = allCorrect ? 'נכון!' : 'זו טעות, אבל חשוב שניסיתם!';
  document.getElementById('s16-q2-fb-regular').innerHTML = 'קנה מידה נקרא משמאל לימין:<br>המספר השמאלי מייצג את הגודל בסרטוט, והמספר הימני מייצג את הגודל במציאות.';

  var q2icon = document.getElementById('s16-q2-fb-icon');
  if (q2icon) {
    q2icon.innerHTML = allCorrect
      ? '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#609E12"/><path d="M9 16.5L13.5 21L23 11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var feedback = document.getElementById('s16-q2-inline-feedback');
  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect');
  feedback.classList.add(allCorrect ? 's5-fb--correct' : 's5-fb--incorrect');
  feedback.hidden = false;

  s16CheckBothDone();
}

function s16Q2Continue() {
  if (!s16Q2Submitted) s16Q2Submit();
  goTo(17);
}

/* ── Screen 7: Guided Practice ── */
function s7Enter() {
  var charImg = document.getElementById('s7-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1_roller.png'
      : './assets/images/Character2_roller.png';
  }

  var cont = document.getElementById('s7-continue');
  if (cont) cont.disabled = true;
  if (s7Timer) { clearTimeout(s7Timer); s7Timer = null; }
  s7Timer = setTimeout(function () {
    if (currentScreen === 7 && cont) cont.disabled = false;
    s7Timer = null;
  }, 3000);
}

/* ── Screen 8: Guided Practice step 2 ── */
function s8Enter() {
  var cont = document.getElementById('s8-continue');
  if (cont) cont.disabled = true;

  document.querySelectorAll('#s8 .s8-btn').forEach(function (b) { b.disabled = false; });

  var mark = document.getElementById('s8-correct-mark');
  if (mark) mark.classList.remove('s8-mark-visible');
}

function s8Answer(answer) {
  document.querySelectorAll('#s8 .s8-btn').forEach(function (b) { b.disabled = true; });

  var mark = document.getElementById('s8-correct-mark');
  if (mark) {
    requestAnimationFrame(function () { mark.classList.add('s8-mark-visible'); });
  }

  var cont = document.getElementById('s8-continue');
  if (cont) cont.disabled = false;
}

/* ── Screen 9: Guided Practice step 3 ── */
function s9Enter() {
  var cont = document.getElementById('s9-continue');
  if (cont) cont.disabled = true;

  document.querySelectorAll('#s9 .s8-btn').forEach(function (b) { b.disabled = false; });

  var mark = document.getElementById('s9-correct-mark');
  if (mark) mark.classList.remove('s8-mark-visible');
}

function s9Answer(answer) {
  document.querySelectorAll('#s9 .s8-btn').forEach(function (b) { b.disabled = true; });

  var mark = document.getElementById('s9-correct-mark');
  if (mark) {
    requestAnimationFrame(function () { mark.classList.add('s8-mark-visible'); });
  }

  var cont = document.getElementById('s9-continue');
  if (cont) cont.disabled = false;
}

/* ── Screen 10: Guided Practice step 4 ── */
function s10Enter() {
  var cont = document.getElementById('s10-continue');
  if (cont) cont.disabled = true;

  var btn1000 = document.getElementById('s10-btn-1000');
  var btn100  = document.getElementById('s10-btn-100');
  if (btn1000) btn1000.disabled = false;
  if (btn100)  btn100.disabled  = false;

  var mark = document.getElementById('s10-correct-mark');
  if (mark) mark.classList.remove('s8-mark-visible');
}

function s10Answer(answer) {
  var btn1000 = document.getElementById('s10-btn-1000');
  var btn100  = document.getElementById('s10-btn-100');
  if (btn1000) btn1000.disabled = true;
  if (btn100)  btn100.disabled  = true;

  var mark = document.getElementById('s10-correct-mark');
  if (mark) {
    requestAnimationFrame(function () { mark.classList.add('s8-mark-visible'); });
  }

  var cont = document.getElementById('s10-continue');
  if (cont) cont.disabled = false;
}

/* ── Screen 12: duplicate of screen 7 ── */
function s12Enter() {
  var charImg = document.getElementById('s12-char-img');
  if (charImg) {
    charImg.src = window.lomdaState.selectedCharacter === 'text'
      ? './assets/images/Character1.png'
      : './assets/images/Character2.png';
  }
}

/* ── Screen 14: answer reveal, no buttons ── */
function s14Enter() {
  /* continue always enabled */
}

/* ── Screen 13: duplicate of screen 10 ── */
function s13Enter() {
  var cont = document.getElementById('s13-continue');
  if (cont) cont.disabled = true;

  var btnDiv  = document.getElementById('s13-btn-divide');
  var btnMult = document.getElementById('s13-btn-multiply');
  if (btnDiv)  btnDiv.disabled  = false;
  if (btnMult) btnMult.disabled = false;

  var mark = document.getElementById('s13-correct-mark');
  if (mark) mark.classList.remove('s8-mark-visible');
}

function s13Answer(answer) {
  var btnDiv  = document.getElementById('s13-btn-divide');
  var btnMult = document.getElementById('s13-btn-multiply');
  if (btnDiv)  btnDiv.disabled  = true;
  if (btnMult) btnMult.disabled = true;

  var mark = document.getElementById('s13-correct-mark');
  if (mark) {
    requestAnimationFrame(function () { mark.classList.add('s8-mark-visible'); });
  }

  var cont = document.getElementById('s13-continue');
  if (cont) cont.disabled = false;
}

/* ── Screen 11: Guided Practice — answer reveal (no buttons) ── */
function s11Enter() {
  /* continue is always enabled — no interaction required */
}

/* ── Screen 23 ── */
var s23Selected = null;
var s23Attempts = 0;
var s23Solved = false;
var s23Correct = false;
var S23_CORRECT = 2;

function s23Enter() {
  s23Selected = null;
  s23Attempts = 0;
  s23Solved = false;
  s23Correct = false;
  document.querySelectorAll('[data-screen="23"] .s5-opt').forEach(function(opt) {
    opt.classList.remove('is-selected', 'is-correct', 'is-incorrect');
    opt.disabled = false;
  });
  var continueBtn = document.getElementById('s23-continue');
  if (continueBtn) continueBtn.disabled = true;
  var hintBtn = document.getElementById('s23-hint-btn');
  if (hintBtn) hintBtn.hidden = true;
  var hintPopup = document.getElementById('s23-hint-popup');
  if (hintPopup) hintPopup.hidden = true;
  var feedback = document.getElementById('s23-feedback');
  if (feedback) {
    feedback.hidden = true;
    feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect', 's23-fb--final');
  }
}

function s23Select(idx) {
  if (s23Solved) return;
  if (s23Selected === idx) return;
  s23Selected = idx;
  document.querySelectorAll('[data-screen="23"] .s5-opt').forEach(function(opt, i) {
    opt.classList.toggle('is-selected', i === idx);
  });
  var continueBtn = document.getElementById('s23-continue');
  if (continueBtn) continueBtn.disabled = false;
}

function s23ToggleHint() {
  var popup = document.getElementById('s23-hint-popup');
  if (popup) popup.hidden = false;
}

function s23CloseHint() {
  var popup = document.getElementById('s23-hint-popup');
  if (popup) popup.hidden = true;
}

function s23Submit() {
  if (s23Solved) { routeAfterQuiz(); return; }
  if (s23Selected === null) return;

  var correct = (s23Selected === S23_CORRECT);
  s23Attempts++;

  var feedback    = document.getElementById('s23-feedback');
  var fbBold      = document.getElementById('s23-fb-bold');
  var fbRegular   = document.getElementById('s23-fb-regular');
  var fbIcon      = document.getElementById('s23-fb-icon');
  var continueBtn = document.getElementById('s23-continue');

  var explanation = 'קנה מידה מתאר את היחס בין האורך במפה לאורך במציאות. המסלול במציאות זהה.<br>' +
                    'אם קנה המידה היה זהה, גם אורך המסלול בשתי המפות היה צריך להיות זהה.<br>' +
                    'לכן נסיק שקני המידה שונים.';
  var checkIcon = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#58A700"/><path d="M8 16.5L13.5 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var xIcon     = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#B20010"/><path d="M11 11L21 21M21 11L11 21" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  feedback.classList.remove('s5-fb--correct', 's5-fb--incorrect', 's23-fb--final');
  var opts = document.querySelectorAll('[data-screen="23"] .s5-opt');

  if (correct) {
    s23Solved = true;
    s23Correct = true;
    opts[s23Selected].classList.remove('is-selected');
    opts[s23Selected].classList.add('is-correct');
    opts.forEach(function(o) { o.disabled = true; });
    fbBold.textContent = 'טוב מאוד!';
    fbRegular.innerHTML = explanation;
    fbIcon.innerHTML = checkIcon;
    feedback.classList.add('s5-fb--correct', 's23-fb--final');
    feedback.hidden = false;
    continueBtn.disabled = false;
  } else if (s23Attempts === 1) {
    opts[s23Selected].classList.remove('is-selected');
    fbBold.textContent = 'זה לא מדוייק, ננסה שוב?';
    fbRegular.innerHTML = '';
    fbIcon.innerHTML = xIcon;
    feedback.classList.add('s5-fb--incorrect');
    feedback.hidden = false;
    document.getElementById('s23-hint-btn').hidden = false;
    s23Selected = null;
    continueBtn.disabled = true;
  } else {
    s23Solved = true;
    opts.forEach(function(o, i) {
      o.disabled = true;
      o.classList.remove('is-selected');
      if (i === S23_CORRECT) o.classList.add('is-correct');
      else if (i === s23Selected) o.classList.add('is-incorrect');
    });
    fbBold.textContent = 'זו טעות, לא נורא – בואו נלמד ממנה:';
    fbRegular.innerHTML = 'קנה מידה מתאר את היחס בין האורך במפה לאורך במציאות.<br>המסלול במציאות זהה. אם קנה המידה היה זהה, גם אורך המסלול בשתי המפות היה צריך להיות זהה. לכן נסיק שקני המידה שונים.';
    fbIcon.innerHTML = xIcon;
    feedback.classList.add('s5-fb--incorrect', 's23-fb--final');
    feedback.hidden = false;
    continueBtn.disabled = false;
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

// ≥4 נכון → תרגול כיתה (03) | <4 → תרגול בסיסי (02)
function routeAfterQuiz() {
  if (getQuizScore() >= 4) {
    window.location.href = '../methodica-math-scale-01-03/index.html';
  } else {
    window.location.href = '../methodica-math-scale-01-02/index.html';
  }
}

/* ── Basic practice score + routing ── */
// תרגול בסיסי — 4 תרגילים, סף מעבר לתרגול כיתה: 3/4
// תרגיל 1: מסך 26       (שאלה 1)
// תרגיל 2: מסך 27       (שאלה 2)
// תרגיל 3: מסך 28       (שאלה 3)
// תרגיל 4: מסך 29 + 30  (שאלה 4 — א+ב, שניהם יחד)
function getBasicPracticeScore() {
  var count = 0;
  if (s26Correct)                count++; // שאלה 1
  if (s27Correct)                count++; // שאלה 2
  if (s28Correct)                count++; // שאלה 3
  if (s29Correct && s30Correct)  count++; // שאלה 4 (א+ב יחד)
  return count;
}

// â‰¥3 נכון â†' תרגול כיתה (מסך 24) | <3 â†' תרגול סטנדרטי מתקדם (מסך 31)
function routeAfterBasicPractice() {
  goTo(getBasicPracticeScore() >= 3 ? 24 : 31);
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

/* forward Ctrl+← / Ctrl+→ from iframe to parent dev tool */
document.addEventListener('keydown', function (e) {
  if (window.parent !== window && e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault();
    window.parent.postMessage({ type: 'DEV_KEY', key: e.key }, '*');
  }
});


/* ── Keyboard accessibility ── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-screen="0"] .option-card').forEach(card => {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectOption(card);
      }
    });
  });
  document.querySelectorAll('[data-screen="2"] .option-card').forEach(card => {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectDesign(card);
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
