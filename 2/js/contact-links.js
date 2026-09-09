(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthContactLinks = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function mailto(email) {
    return 'mailto:' + email;
  }

  function tel(phoneTel) {
    const n = String(phoneTel).replace(/\s/g, '');
    return n.startsWith('tel:') ? n : 'tel:' + n;
  }

  function whatsapp(number, message) {
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
  }

  return { mailto, tel, whatsapp };
}));
