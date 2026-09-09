const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const ui = require('../js/booking-ui.js');

describe('AzimuthBookingUI storage', () => {
  beforeEach(() => {
    ui.writeTaken([]);
  });

  it('legge e scrive gli slot presi', () => {
    assert.deepEqual(ui.readTaken(), []);
    ui.writeTaken(['2026-09-10T10:00']);
    assert.deepEqual(ui.readTaken(), ['2026-09-10T10:00']);
  });

  it('segna demo slot non disponibile quando storage vuoto', () => {
    assert.equal(ui.isSlotUnavailable('2026-09-10T10:00', [], '2026-09-10T10:00'), true);
    assert.equal(ui.isSlotUnavailable('2026-09-10T15:00', [], '2026-09-10T10:00'), false);
  });

  it('segna slot appena presi non disponibili', () => {
    const taken = ['2026-09-10T15:00'];
    assert.equal(ui.isSlotUnavailable('2026-09-10T15:00', taken, '2026-09-10T10:00'), true);
    assert.equal(ui.isSlotUnavailable('2026-09-10T10:00', taken, '2026-09-10T10:00'), false);
  });
});
