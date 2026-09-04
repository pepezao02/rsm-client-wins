/* RSM Operators — funnel motion. Gated so no-JS renders the full page. */
(function () {
  var root = document.querySelector('.rsm');
  if (!root) return;
  root.classList.add('js');

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---- headline letter cascade: aria-label BEFORE splitting ---- */
  var display = root.querySelector('.rsm-display');
  if (display && !reduce) {
    try {
      display.setAttribute('aria-label', display.textContent.replace(/\s+/g, ' ').trim());
      var walk = function (node) {
        var kids = Array.prototype.slice.call(node.childNodes);
        kids.forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.nodeValue.split(/(\s+)/).forEach(function (tok) {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span');
              w.className = 'w';
              tok.split('').forEach(function (ch) {
                var i = document.createElement('i');
                i.textContent = ch;
                w.appendChild(i);
              });
              frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') {
            walk(n);
          }
        });
      };
      walk(display);
      var chars = display.querySelectorAll('.w i');
      Array.prototype.forEach.call(chars, function (c, i) {
        c.style.transitionDelay = (140 + i * 16) + 'ms';
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { display.classList.add('on'); });
      });
    } catch (e) { display.classList.add('on'); }
  } else if (display) {
    display.classList.add('on');
  }

  /* ---- scroll reveal ---- */
  var rises = root.querySelectorAll('[data-rise]');
  if (!rises.length) return;

  if (!('IntersectionObserver' in window) || reduce) {
    Array.prototype.forEach.call(rises, function (el) { el.classList.add('on'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var group = el.parentElement ? el.parentElement.querySelectorAll(':scope > [data-rise]') : [el];
      var idx = Array.prototype.indexOf.call(group, el);
      el.style.setProperty('--d', Math.max(0, idx) * 80 + 'ms');
      el.classList.add('on');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(rises, function (el) { io.observe(el); });
})();
