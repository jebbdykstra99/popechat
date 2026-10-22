/* Single takedown contact for this room: NCII, copyright, violent_offensive, hate and minor-suspect reports.
   Swap the address here; pages carry the same value as no-JS fallback text.
   PENDING: subx.it mail routing to trigger inbox (Jebb) */
var SUBX_TAKEDOWN_EMAIL = 'takedown@subx.it';
(function () {
  function apply() {
    var E = SUBX_TAKEDOWN_EMAIL;
    var els = document.querySelectorAll('a[data-takedown]');
    for (var i = 0; i < els.length; i++) {
      var a = els[i];
      var q = (a.getAttribute('href') || '').split('?')[1];
      a.setAttribute('href', 'mailto:' + E + (q ? '?' + q : ''));
      a.textContent = E;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
