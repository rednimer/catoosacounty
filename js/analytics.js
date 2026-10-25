/*
 * Shared GA4 conversion events for every page.
 * Listens on document (capture) so one script covers current and future markup.
 * Does not change navigation, form submission, copy, or styling.
 *
 * phone_call      — click on an <a href="tel:...">; param link_url
 * rent_click      — click on a rent / reserve / booking link or button
 * get_directions  — click on a directions link or a Google Maps link
 * generate_lead   — submit of a contact or quote form (no field values)
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  var doc = root && root.document;
  if (doc) {
    api.bind(doc);
  }
})(typeof window !== 'undefined' ? window : this, function () {
  var MAPS_URL = /(?:google\.[a-z.]+\/maps(?:[/?#]|$)|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;
  var RESERVE_URL = /(?:^|\/)reserve\.html(?:[?#]|$)/i;
  var RENT_LABEL = /\b(rent|rents|rental|reserve|reserves|reservation|reservations|book|booking|bookings)\b/i;
  var DIRECTIONS_LABEL = /\b(get directions|directions)\b/i;
  var LEAD_FORM = /(contact|quote)/i;
  var LEAD_SUBMIT_LABEL = /\b(send message|get a quote|request a quote|request quote|contact us)\b/i;

  function textOf(el) {
    if (!el) return '';
    var raw = '';
    if (el.tagName === 'INPUT') raw = el.value || '';
    else raw = el.textContent || '';
    if (!raw && el.getAttribute) raw = el.getAttribute('aria-label') || '';
    return String(raw).replace(/\s+/g, ' ').trim();
  }

  function send(eventName, params) {
    var gtag = typeof window !== 'undefined' ? window.gtag : undefined;
    if (typeof gtag !== 'function') return;
    var payload = { transport_type: 'beacon' };
    if (params) {
      for (var key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined && params[key] !== '') {
          payload[key] = params[key];
        }
      }
    }
    gtag('event', eventName, payload);
  }

  function controlFrom(target) {
    if (!target || !target.closest) return null;
    return target.closest('a, button, input[type="submit"], input[type="button"]');
  }

  function isFaqQuestion(el) {
    return !!(el && el.classList && el.classList.contains('faq-question'));
  }

  function eventForClick(el) {
    if (!el || isFaqQuestion(el)) return null;
    var tag = el.tagName;
    var href = (el.getAttribute && el.getAttribute('href')) || '';
    var label = textOf(el);

    if (tag === 'A' && /^tel:/i.test(href.trim())) {
      return { name: 'phone_call', params: { link_url: href.trim() } };
    }

    if (tag === 'A' && MAPS_URL.test(href)) {
      return { name: 'get_directions', params: { link_url: href, link_text: label } };
    }

    var reserveHref = tag === 'A' && RESERVE_URL.test(href);
    var rentLabel = label.length > 0 && label.length <= 80 && RENT_LABEL.test(label);
    if (reserveHref || rentLabel) {
      var rentParams = { link_text: label };
      if (href) rentParams.link_url = href;
      return { name: 'rent_click', params: rentParams };
    }

    if (tag === 'A' && label.length > 0 && label.length <= 40 && DIRECTIONS_LABEL.test(label)) {
      return { name: 'get_directions', params: { link_url: href, link_text: label } };
    }

    return null;
  }

  function isLeadForm(form) {
    if (!form || String(form.tagName).toUpperCase() !== 'FORM') return false;
    var id = form.id || '';
    var name = (form.getAttribute && form.getAttribute('name')) || '';
    var action = (form.getAttribute && form.getAttribute('action')) || '';
    var cls = typeof form.className === 'string' ? form.className : '';
    if (LEAD_FORM.test([id, name, action, cls].join(' '))) return true;

    var controls = form.querySelectorAll ? form.querySelectorAll('button, input[type="submit"]') : [];
    for (var i = 0; i < controls.length; i++) {
      var label = textOf(controls[i]);
      if (label.length <= 80 && LEAD_SUBMIT_LABEL.test(label)) return true;
    }
    return false;
  }

  function onClick(event) {
    var el = controlFrom(event.target);
    var match = eventForClick(el);
    if (!match) return;
    send(match.name, match.params);
  }

  function onSubmit(event) {
    var form = event.target;
    if (!isLeadForm(form)) return;
    var params = {};
    if (form.id) params.form_id = form.id;
    if (form.getAttribute && form.getAttribute('name')) params.form_name = form.getAttribute('name');
    send('generate_lead', params);
  }

  function bind(doc) {
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('submit', onSubmit, true);
  }

  return {
    bind: bind,
    eventForClick: eventForClick,
    isLeadForm: isLeadForm
  };
});
