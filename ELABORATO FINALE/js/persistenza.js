var Sito = window.Sito || {};

Sito.STORAGE_KEY = "ascoli-creatore-v1";

Sito.vuotoStore = function () {
  return {
    v: 1,
    luoghi: [],
    eventi: [],
    nascostiEventi: [],
    nascostiLuoghi: [],
    patchEventi: {},
    patchLuoghi: {},
  };
};

Sito.leggiStore = function () {
  try {
    var raw = localStorage.getItem(Sito.STORAGE_KEY);
    if (!raw) return Sito.vuotoStore();
    var data = JSON.parse(raw);
    if (!data || data.v !== 1) return Sito.vuotoStore();
    data.luoghi = data.luoghi || [];
    data.eventi = data.eventi || [];
    data.nascostiEventi = data.nascostiEventi || [];
    data.nascostiLuoghi = data.nascostiLuoghi || [];
    data.patchEventi = data.patchEventi || {};
    data.patchLuoghi = data.patchLuoghi || {};
    return data;
  } catch (err) {
    return Sito.vuotoStore();
  }
};

Sito.scriviStore = function (data) {
  localStorage.setItem(Sito.STORAGE_KEY, JSON.stringify(data));
};

Sito.nuovoId = function (prefisso) {
  return prefisso + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};

function applicaPatch(base, patch) {
  if (!patch) return base;
  var out = {};
  var k;
  for (k in base) {
    if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
  }
  for (k in patch) {
    if (Object.prototype.hasOwnProperty.call(patch, k) && patch[k] != null) {
      out[k] = patch[k];
    }
  }
  return out;
}

Sito.catalogo = function () {
  var store = Sito.leggiStore();
  var nascostiL = {};
  var nascostiE = {};
  var i;
  for (i = 0; i < store.nascostiLuoghi.length; i++) {
    nascostiL[store.nascostiLuoghi[i]] = true;
  }
  for (i = 0; i < store.nascostiEventi.length; i++) {
    nascostiE[store.nascostiEventi[i]] = true;
  }

  var luoghi = [];
  var byId = {};

  function mettiLuogo(src, origine) {
    if (!src || !src.id || nascostiL[src.id] || byId[src.id]) return;
    var l = applicaPatch(src, store.patchLuoghi[src.id]);
    l.origine = origine;
    l.eventi = [];
    luoghi.push(l);
    byId[l.id] = l;
  }

  for (i = 0; i < Sito.SEMINA_LUOGHI.length; i++) {
    mettiLuogo(Sito.SEMINA_LUOGHI[i], "semina");
  }
  for (i = 0; i < store.luoghi.length; i++) {
    mettiLuogo(store.luoghi[i], "creatore");
  }

  function mettiEvento(src, origine) {
    if (!src || !src.id || nascostiE[src.id]) return;
    var e = applicaPatch(src, store.patchEventi[src.id]);
    var luogo = byId[e.luogoId];
    if (!luogo) return;
    e.origine = origine;
    e.luogoNome = luogo.nome;
    luogo.eventi.push(e);
  }

  for (i = 0; i < Sito.SEMINA_EVENTI.length; i++) {
    mettiEvento(Sito.SEMINA_EVENTI[i], "semina");
  }
  for (i = 0; i < store.eventi.length; i++) {
    mettiEvento(store.eventi[i], "creatore");
  }

  for (i = 0; i < luoghi.length; i++) {
    luoghi[i].eventi.sort(function (a, b) {
      var d = Sito.ordineEvento(a) - Sito.ordineEvento(b);
      if (d) return d;
      return String(a.data).localeCompare(String(b.data));
    });
  }

  return { luoghi: luoghi, byId: byId };
};

Sito.luogoById = function (id) {
  return Sito.catalogo().byId[id] || null;
};

Sito.tuttiEventi = function () {
  var cat = Sito.catalogo();
  var out = [];
  var i, j;
  for (i = 0; i < cat.luoghi.length; i++) {
    for (j = 0; j < cat.luoghi[i].eventi.length; j++) {
      out.push(cat.luoghi[i].eventi[j]);
    }
  }
  out.sort(function (a, b) {
    return String(a.data).localeCompare(String(b.data));
  });
  return out;
};

Sito.salvaEvento = function (evento) {
  var store = Sito.leggiStore();
  var i;
  if (!evento.id) evento.id = Sito.nuovoId("evento");
  var seme = Sito.SEMINA_EVENTI.filter(function (e) {
    return e.id === evento.id;
  })[0];
  if (seme) {
    store.patchEventi[evento.id] = {
      titolo: evento.titolo,
      data: evento.data,
      descrizione: evento.descrizione,
      luogoId: evento.luogoId,
    };
    Sito.scriviStore(store);
    return evento.id;
  }
  for (i = 0; i < store.eventi.length; i++) {
    if (store.eventi[i].id === evento.id) {
      store.eventi[i] = {
        id: evento.id,
        luogoId: evento.luogoId,
        titolo: evento.titolo,
        data: evento.data,
        descrizione: evento.descrizione,
      };
      Sito.scriviStore(store);
      return evento.id;
    }
  }
  store.eventi.push({
    id: evento.id,
    luogoId: evento.luogoId,
    titolo: evento.titolo,
    data: evento.data,
    descrizione: evento.descrizione,
  });
  Sito.scriviStore(store);
  return evento.id;
};

Sito.togliEvento = function (id) {
  var store = Sito.leggiStore();
  var seme = Sito.SEMINA_EVENTI.filter(function (e) {
    return e.id === id;
  })[0];
  if (seme) {
    if (store.nascostiEventi.indexOf(id) === -1) store.nascostiEventi.push(id);
    delete store.patchEventi[id];
    Sito.scriviStore(store);
    return;
  }
  store.eventi = store.eventi.filter(function (e) {
    return e.id !== id;
  });
  Sito.scriviStore(store);
};

Sito.salvaLuogo = function (luogo) {
  var store = Sito.leggiStore();
  var i;
  if (!luogo.id) luogo.id = Sito.nuovoId("luogo");
  var seme = Sito.SEMINA_LUOGHI.filter(function (l) {
    return l.id === luogo.id;
  })[0];
  if (seme) {
    store.patchLuoghi[luogo.id] = {
      nome: luogo.nome,
      suolo: luogo.suolo,
      lat: luogo.lat,
      lng: luogo.lng,
    };
    Sito.scriviStore(store);
    return luogo.id;
  }
  for (i = 0; i < store.luoghi.length; i++) {
    if (store.luoghi[i].id === luogo.id) {
      store.luoghi[i] = {
        id: luogo.id,
        nome: luogo.nome,
        suolo: luogo.suolo || "",
        lat: luogo.lat,
        lng: luogo.lng,
      };
      Sito.scriviStore(store);
      return luogo.id;
    }
  }
  store.luoghi.push({
    id: luogo.id,
    nome: luogo.nome,
    suolo: luogo.suolo || "",
    lat: luogo.lat,
    lng: luogo.lng,
  });
  Sito.scriviStore(store);
  return luogo.id;
};

Sito.togliLuogo = function (id) {
  var store = Sito.leggiStore();
  var seme = Sito.SEMINA_LUOGHI.filter(function (l) {
    return l.id === id;
  })[0];
  var i;
  if (seme) return;
  store.luoghi = store.luoghi.filter(function (l) {
    return l.id !== id;
  });
  store.eventi = store.eventi.filter(function (e) {
    return e.luogoId !== id;
  });
  for (i = store.nascostiEventi.length - 1; i >= 0; i--) {
    /* leftover hide flags for extra eventi are harmless */
  }
  Sito.scriviStore(store);
};

Sito.luoghiAggiunti = function () {
  return Sito.catalogo().luoghi.filter(function (l) {
    return l.origine === "creatore";
  });
};
