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
});
