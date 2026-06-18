(function () {
  'use strict';

  var cfg = window.IupiterConfig || {};
  var agentId = cfg.agentId;
  if (!agentId) { console.warn('[Iupiter] Missing IupiterConfig.agentId'); return; }

  var BASE     = cfg.baseUrl  || 'https://iupiter.vercel.app';
  var COLOR    = cfg.color    || '#2563EB';
  var SIDE     = cfg.position || 'right';

  /* ── Inject styles ── */
  var css = [
    '#iupiter-btn{position:fixed;bottom:24px;' + SIDE + ':24px;z-index:999999;',
    'width:56px;height:56px;border-radius:50%;background:' + COLOR + ';border:none;',
    'cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.20);',
    'display:flex;align-items:center;justify-content:center;transition:transform .15s;}',
    '#iupiter-btn:hover{transform:scale(1.08);}',
    '#iupiter-frame-wrap{display:none;position:fixed;bottom:94px;' + SIDE + ':24px;',
    'z-index:999998;width:370px;height:580px;max-height:calc(100vh - 110px);',
    'border-radius:16px;overflow:hidden;',
    'box-shadow:0 8px 40px rgba(0,0,0,.18);background:#fff;}',
    '#iupiter-frame-wrap.iup-open{display:block;}',
    '#iupiter-iframe{width:100%;height:100%;border:none;}',
    '@media(max-width:440px){',
    '#iupiter-frame-wrap{' + SIDE + ':0;bottom:0;width:100%;height:100%;',
    'max-height:100%;border-radius:0;}}',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Helper: create SVG element safely ── */
  function makeSVG(pathD, size) {
    var ns  = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width',  size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'white');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);
    return svg;
  }

  var PATH_CHAT  = 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z';
  var PATH_CLOSE = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';

  /* ── Button ── */
  var btn = document.createElement('button');
  btn.id  = 'iupiter-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.appendChild(makeSVG(PATH_CHAT, '24'));

  /* ── Frame wrapper + iframe ── */
  var wrap   = document.createElement('div');
  wrap.id    = 'iupiter-frame-wrap';

  var iframe = document.createElement('iframe');
  iframe.id    = 'iupiter-iframe';
  iframe.title = 'Chat';
  iframe.setAttribute('allow', 'clipboard-write');
  var loaded   = false;

  wrap.appendChild(iframe);
  document.body.appendChild(wrap);
  document.body.appendChild(btn);

  /* ── Toggle open/close ── */
  var isOpen = false;

  function setOpen(val) {
    isOpen = val;
    if (isOpen) {
      wrap.classList.add('iup-open');
      btn.setAttribute('aria-label', 'Close chat');
      while (btn.firstChild) btn.removeChild(btn.firstChild);
      btn.appendChild(makeSVG(PATH_CLOSE, '22'));
      if (!loaded) {
        iframe.src = BASE + '/widget/' + encodeURIComponent(agentId);
        loaded = true;
      }
    } else {
      wrap.classList.remove('iup-open');
      btn.setAttribute('aria-label', 'Open chat');
      while (btn.firstChild) btn.removeChild(btn.firstChild);
      btn.appendChild(makeSVG(PATH_CHAT, '24'));
    }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!isOpen);
  });

  document.addEventListener('click', function (e) {
    if (isOpen && !wrap.contains(e.target) && e.target !== btn) {
      setOpen(false);
    }
  });
})();
