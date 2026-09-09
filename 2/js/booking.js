(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthBooking = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DISCLAIMER = 'È una richiesta di chiamata: vi confermiamo lo slot con un messaggio.';
  const WEEKDAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const MONTHS_IT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function slotId(date, hour) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(hour) + ':00';
  }

  function isWeekend(date) {
    const d = date.getDay();
    return d === 0 || d === 6;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function buildSlots(now) {
    const slots = [];
    const cursor = startOfDay(now);
    cursor.setDate(cursor.getDate() + 1);
    while (slots.length < 10) {
      if (!isWeekend(cursor)) {
        slots.push({
          id: slotId(cursor, 10),
          period: 'mattina',
          label: WEEKDAYS_IT[cursor.getDay()] + ' ' + cursor.getDate() + ' ' + MONTHS_IT[cursor.getMonth()] + ', 10:00'
        });
        slots.push({
          id: slotId(cursor, 15),
          period: 'pomeriggio',
          label: WEEKDAYS_IT[cursor.getDay()] + ' ' + cursor.getDate() + ' ' + MONTHS_IT[cursor.getMonth()] + ', 15:00'
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return slots;
  }

  function validateBooking({ name, email, slotId: id, slots, takenIds }) {
    if (!String(name || '').trim()) return { ok: false, error: 'Inserisci il nome.' };
    if (!/^\S+@\S+\.\S+$/.test(String(email || '').trim())) {
      return { ok: false, error: 'Inserisci un’email valida.' };
    }
    if (!id) return { ok: false, error: 'Scegli uno slot.' };
    const exists = (slots || []).some((s) => s.id === id);
    if (!exists || (takenIds || []).indexOf(id) !== -1) {
      return { ok: false, error: 'Questo slot non è disponibile.' };
    }
    return { ok: true };
  }

  function confirmMessage(id) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(id);
    if (!m) return 'Chiamata richiesta. Vi scriviamo per confermare.';
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    const day = WEEKDAYS_IT[date.getDay()] + ' ' + date.getDate() + ' ' + MONTHS_IT[date.getMonth()] + ' ' + date.getFullYear();
    const time = pad(date.getHours()) + ':' + pad(date.getMinutes());
    return 'Chiamata richiesta per ' + day + ', ore ' + time + '. Vi scriviamo per confermare.';
  }

  return { buildSlots, validateBooking, confirmMessage, DISCLAIMER };
}));
