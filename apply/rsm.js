/* RSM Operators — funnel behaviour. Gated so no-JS still renders the full page.
   Headlines render instantly: Jasmine asked for no animation on the header. */
(function () {
  var root = document.querySelector('.rsm');
  if (!root) return;
  root.classList.add('js');

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------------------------------------------------------------
     Add-to-calendar buttons.
     The booking tool appends the event times to the redirect URL.
       Calendly : ?event_start_time=...&event_end_time=...
       OnceHub  : ?start=...&end=...
     Both ISO 8601. Without them the buttons stay hidden rather than
     sending someone to an empty calendar entry.
     --------------------------------------------------------------- */
  (function calendarLinks() {
    var box = root.querySelector('[data-cal]');
    if (!box) return;

    var q = new URLSearchParams(location.search);
    var startRaw = q.get('event_start_time') || q.get('start') || q.get('start_time');
    var endRaw = q.get('event_end_time') || q.get('end') || q.get('end_time');
    if (!startRaw) { box.setAttribute('hidden', ''); return; }

    var start = new Date(startRaw);
    if (isNaN(start)) { box.setAttribute('hidden', ''); return; }
    var end = endRaw ? new Date(endRaw) : null;
    if (!end || isNaN(end)) end = new Date(start.getTime() + 45 * 60000);

    var title = box.getAttribute('data-cal-title') || 'Consultation Call';
    var details = box.getAttribute('data-cal-details') || '';
    var stamp = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };

    var google = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(title)
      + '&dates=' + stamp(start) + '/' + stamp(end)
      + '&details=' + encodeURIComponent(details);

    var outlook = 'https://outlook.live.com/calendar/0/deeplink/compose'
      + '?path=/calendar/action/compose&rru=addevent'
      + '&subject=' + encodeURIComponent(title)
      + '&startdt=' + start.toISOString()
      + '&enddt=' + end.toISOString()
      + '&body=' + encodeURIComponent(details);

    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Revenue Systems Model//EN',
      'BEGIN:VEVENT', 'UID:' + stamp(start) + '@revenuesystemsmodel.com',
      'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
      'SUMMARY:' + title, 'DESCRIPTION:' + details.replace(/\n/g, '\\n'),
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');

    var set = function (sel, href, dl) {
      var a = box.querySelector(sel);
      if (!a) return;
      a.href = href;
      if (dl) a.setAttribute('download', dl); else { a.target = '_blank'; a.rel = 'noopener'; }
    };
    set('[data-cal-google]', google);
    set('[data-cal-outlook]', outlook);
    set('[data-cal-apple]', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics), 'consultation-call.ics');

    box.removeAttribute('hidden');
  })();

  /* ---- scroll reveal (headlines excluded) ---- */
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
