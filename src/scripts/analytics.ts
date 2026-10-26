/**
 * Delegated GA4 conversion events. Loaded once from BaseLayout.
 *
 * phone_call      — click on an <a href="tel:...">
 * get_directions  — click on a Google Maps link
 * rent_click      — click on a reserve link, or a rent/reserve button
 * generate_lead   — submit of a form (no field values)
 *
 * Does not change navigation, form submission, copy, or styling.
 */

type EventParams = Record<string, string | undefined>;

interface GtagWindow {
  gtag?: (command: string, name: string, params: Record<string, string>) => void;
}

const MAPS_URL =
  /(?:google\.[a-z.]+\/maps(?:[/?#]|$)|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;

const RENT_LABEL =
  /\b(rent|rents|rental|reserve|reserves|reservation|reservations|book|booking|bookings)\b/i;

function textOf(el: Element): string {
  const raw = el instanceof HTMLInputElement ? el.value : (el.textContent ?? '');
  const label = raw || el.getAttribute('aria-label') || '';
  return label.replace(/\s+/g, ' ').trim();
}

function send(name: string, params: EventParams): void {
  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag !== 'function') return;
  const payload: Record<string, string> = { transport_type: 'beacon' };
  for (const [key, value] of Object.entries(params)) {
    if (value) payload[key] = value;
  }
  gtag('event', name, payload);
}

/** /reserve and /reserve?size=… — not /reserve/thank-you. */
export function isReserveHref(href: string): boolean {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return path === '/reserve' || path === '/reserve.html';
  } catch {
    return false;
  }
}

export function eventForClick(el: Element | null): { name: string; params: EventParams } | null {
  if (!el) return null;
  const href = el.getAttribute('href') ?? '';
  const label = textOf(el);

  if (el.tagName === 'A' && /^tel:/i.test(href.trim())) {
    return { name: 'phone_call', params: { link_url: href.trim() } };
  }

  if (el.tagName === 'A' && MAPS_URL.test(href)) {
    return { name: 'get_directions', params: { link_url: href, link_text: label } };
  }

  const reserveHref = el.tagName === 'A' && isReserveHref(href);
  const rentLabel = label.length > 0 && label.length <= 80 && RENT_LABEL.test(label);
  if (reserveHref || rentLabel) {
    return { name: 'rent_click', params: { link_url: href || undefined, link_text: label } };
  }

  return null;
}

function onClick(event: Event): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const el = target.closest('a, button, input[type="submit"], input[type="button"]');
  const match = eventForClick(el);
  if (!match) return;
  send(match.name, match.params);
}

function onSubmit(event: Event): void {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  send('generate_lead', {
    form_id: form.id || undefined,
    form_name: form.getAttribute('name') || undefined,
  });
}

export function bindAnalytics(doc: Document): void {
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('submit', onSubmit, true);
}
