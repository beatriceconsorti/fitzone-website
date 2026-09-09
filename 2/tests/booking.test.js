const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const booking = require('../js/booking.js');

const WED = new Date(2026, 8, 9, 12, 0, 0); // 9 set 2026 mercoledì, locale

describe('AzimuthBooking.buildSlots', () => {
  it('restituisce 10 slot sui 5 giorni lavorativi successivi', () => {
    const slots = booking.buildSlots(WED);
    assert.equal(slots.length, 10);
    assert.equal(slots[0].id, '2026-09-10T10:00');
    assert.equal(slots[1].id, '2026-09-10T15:00');
    assert.equal(slots[4].id, '2026-09-14T10:00');
    assert.equal(slots[9].id, '2026-09-16T15:00');
  });
});

describe('AzimuthBooking.validateBooking', () => {
  const slots = booking.buildSlots(WED);

  it('rifiuta nome vuoto', () => {
    const r = booking.validateBooking({
      name: '  ', email: 'a@b.it', slotId: slots[0].id, slots, takenIds: []
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Inserisci il nome.');
  });

  it('rifiuta email non valida', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada', slotId: slots[0].id, slots, takenIds: []
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Inserisci un’email valida.');
  });

  it('rifiuta slot mancante', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada@b.it', slotId: '', slots, takenIds: []
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Scegli uno slot.');
  });

  it('rifiuta slot già preso', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada@b.it', slotId: slots[0].id, slots, takenIds: [slots[0].id]
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Questo slot non è disponibile.');
  });

  it('accetta una richiesta valida', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada@b.it', slotId: slots[1].id, slots, takenIds: [slots[0].id]
    });
    assert.deepEqual(r, { ok: true });
  });
});

describe('AzimuthBooking.confirmMessage', () => {
  it('dice che è una richiesta da confermare', () => {
    const msg = booking.confirmMessage('2026-09-10T10:00');
    assert.equal(
      msg,
      'Chiamata richiesta per giovedì 10 settembre 2026, ore 10:00. Vi scriviamo per confermare.'
    );
  });
});
