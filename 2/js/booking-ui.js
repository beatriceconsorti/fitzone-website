(function (root, factory) {
  const Booking = (typeof require === 'function' && typeof document === 'undefined')
    ? require('./booking.js')
    : root.AzimuthBooking;
  const exported = factory(Booking);
  if (typeof module === 'object' && module.exports) module.exports = exported;
  else root.AzimuthBookingUI = exported;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (Booking) {
  'use strict';

  const STORAGE_KEY = 'azimuth-taken-slots';
  let mem = [];

  function storage() {
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) { /* ignore */ }
    return null;
  }

  function readTaken() {
    const s = storage();
    if (!s) return mem.slice();
    try {
      const raw = s.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeTaken(ids) {
    mem = ids.slice();
    const s = storage();
    if (s) s.setItem(STORAGE_KEY, JSON.stringify(mem));
  }

  function mount(el, now) {
    if (!el || !Booking) return;
    const slots = Booking.buildSlots(now || new Date());
    const stored = readTaken();
    const demoTaken = stored.length ? stored : [slots[2] && slots[2].id];
    let selected = '';

    el.innerHTML =
      '<div class="slot-grid"></div>' +
      '<form class="booking-form">' +
        '<label>Nome <input name="name" required autocomplete="name"></label>' +
        '<label>Email <input name="email" type="email" required autocomplete="email"></label>' +
        '<label>Nota sul progetto <textarea name="note" rows="3"></textarea></label>' +
        '<button class="booking-submit" type="submit">Invia richiesta</button>' +
      '</form>' +
      '<p class="booking-disclaimer">' + Booking.DISCLAIMER + '</p>' +
      '<p class="booking-msg" hidden></p>';

    const grid = el.querySelector('.slot-grid');
    const form = el.querySelector('.booking-form');
    const msg = el.querySelector('.booking-msg');

    function paint() {
      grid.innerHTML = '';
      slots.forEach(function (slot) {
        const taken = demoTaken.indexOf(slot.id) !== -1 && stored.indexOf(slot.id) !== -1
          ? true
          : demoTaken.indexOf(slot.id) !== -1 && stored.length === 0
            ? true
            : stored.indexOf(slot.id) !== -1;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.dataset.slotId = slot.id;
        const unavailable = stored.indexOf(slot.id) !== -1 || (stored.length === 0 && slot.id === demoTaken[0]);
        btn.disabled = unavailable;
        btn.textContent = unavailable ? slot.label + ' (Non disponibile)' : slot.label;
        btn.setAttribute('aria-pressed', selected === slot.id ? 'true' : 'false');
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          selected = slot.id;
          paint();
        });
        grid.appendChild(btn);
      });
    }

    paint();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.elements.name.value;
      const email = form.elements.email.value;
      const takenIds = readTaken().concat(stored.length === 0 ? demoTaken : []);
      const result = Booking.validateBooking({
        name: name,
        email: email,
        slotId: selected,
        slots: slots,
        takenIds: takenIds
      });
      msg.hidden = false;
      if (!result.ok) {
        msg.className = 'booking-msg is-error';
        msg.textContent = result.error;
        return;
      }
      const nextTaken = readTaken().concat([selected]);
      writeTaken(nextTaken);
      demoTaken.length = 0;
      nextTaken.forEach(function (id) { demoTaken.push(id); });
      msg.className = 'booking-msg is-ok';
      msg.textContent = Booking.confirmMessage(selected);
      paint();
    });
  }

  return { STORAGE_KEY, readTaken, writeTaken, mount };
}));
