var Sito = window.Sito || {};

Sito.COLOR_IN_CORSO = "#ff4d00";
Sito.COLOR_IN_ARRIVO = "#eab308";
Sito.COLOR_PASSATO = "#7d756c";
Sito.COLOR_CITTA = "rgb(250, 250, 248)";

Sito.SEMINA_LUOGHI = [
  {
    id: "popolo",
    nome: "Piazza del Popolo",
    suolo: "piazza",
    lat: 42.85472,
    lng: 13.57505,
    preferName: /capitani|popolo/i,
  },
  {
    id: "arringo",
    nome: "Piazza Arringo",
    suolo: "piazza",
    lat: 42.85355,
    lng: 13.57685,
    preferName: /arringo|vescovile|comunale/i,
  },
  {
    id: "duomo",
    nome: "Cattedrale di Sant'Emidio",
    suolo: "chiesa",
    lat: 42.85335,
    lng: 13.57715,
    preferName: /emidio|cattedrale|duomo/i,
    preferChurch: true,
    maxM: 140,
  },
  {
    id: "francesco",
    nome: "Chiesa di San Francesco",
    suolo: "chiesa",
    lat: 42.8551,
    lng: 13.5752,
    preferName: /francesco/i,
    preferChurch: true,
    maxM: 140,
  },
  {
    id: "teatro",
    nome: "Teatro Ventidio Basso",
    suolo: "edificio",
    lat: 42.85564,
    lng: 13.57478,
    preferName: /ventidio|teatro/i,
    preferTheatre: true,
    maxM: 160,
  },
  {
    id: "cecco",
    nome: "Ponte di Cecco",
    suolo: "ponte",
    lat: 42.85256,
    lng: 13.58583,
    maxM: 120,
  },
  {
    id: "malatesta",
    nome: "Forte Malatesta",
    suolo: "forte",
    lat: 42.85286,
    lng: 13.58529,
    preferName: /malatesta|forte/i,
    preferCastle: true,
    maxM: 180,
  },
  {
    id: "giardini",
    nome: "Giardini di Piazza Roma",
    suolo: "giardino",
    lat: 42.85395,
    lng: 13.57285,
  },
  {
    id: "piazza-ventidio",
    nome: "Piazza Ventidio Basso",
    suolo: "piazza",
    lat: 42.8578,
    lng: 13.5735,
    preferName: /pietro martire|vincenzo|anastasio/i,
    maxM: 120,
  },
  {
    id: "battistero",
    nome: "Battistero di San Giovanni",
    suolo: "chiesa",
    lat: 42.8535,
    lng: 13.57672,
    preferName: /battistero|giovanni/i,
    preferChurch: true,
    maxM: 120,
  },
];

Sito.SEMINA_EVENTI = [
  {
    id: "seme-fai",
    luogoId: "teatro",
    titolo: "Aperture FAI del Teatro Ventidio Basso",
    data: "2026-09-12",
    descrizione: "Visite al teatro Unesco, mattina e pomeriggio.",
  },
  {
    id: "seme-mercatino",
    luogoId: "popolo",
    titolo: "Mercatino dell’Antiquariato",
    data: "2026-09-19",
    descrizione: "Terzo fine settimana del mese; in piazza dalle 9.",
  },
  {
    id: "seme-quintana",
    luogoId: "piazza-ventidio",
    titolo: "Corteo storico della Quintana",
    data: "2026-08-02",
    descrizione: "Partenza del corteo verso il Campo dei Giochi, edizione per Sant’Emidio.",
  },
  {
    id: "seme-emidio",
    luogoId: "duomo",
    titolo: "Festa di Sant’Emidio",
    data: "2026-08-05",
    descrizione: "Giorno del patrono.",
  },
];

Sito.oggi = function () {
  var d = new Date();
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length < 2) m = "0" + m;
  if (day.length < 2) day = "0" + day;
  return d.getFullYear() + "-" + m + "-" + day;
};

Sito.etichettaData = function (iso) {
  var oggi = Sito.oggi();
  if (iso === oggi) return "in corso";
  if (iso > oggi) return "in arrivo";
  return "passato";
};

Sito.formatGiorno = function (iso) {
  var mesi = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  var p = String(iso || "").split("-");
  var d = parseInt(p[2], 10);
  var m = parseInt(p[1], 10);
  if (!d || !m) return iso;
  return d + " " + mesi[m - 1];
};

Sito.suoloLabel = function (suolo) {
  if (!suolo) return "";
  return suolo.charAt(0).toUpperCase() + suolo.slice(1);
};

Sito.statoLuogo = function (luogo) {
  var eventi = (luogo && luogo.eventi) || [];
  if (!eventi.length) return "vuoto";
  var oggi = Sito.oggi();
  var i;
  for (i = 0; i < eventi.length; i++) {
    if (eventi[i].data === oggi) return "in-corso";
  }
  for (i = 0; i < eventi.length; i++) {
    if (eventi[i].data > oggi) return "in-arrivo";
  }
  return "passato";
};

Sito.coloreLuogo = function (luogo) {
  var s = Sito.statoLuogo(luogo);
  if (s === "in-corso") return Sito.COLOR_IN_CORSO;
  if (s === "in-arrivo") return Sito.COLOR_IN_ARRIVO;
  if (s === "passato") return Sito.COLOR_PASSATO;
  return Sito.COLOR_CITTA;
};

Sito.ordineEvento = function (evento) {
  var k = Sito.etichettaData(evento.data);
  if (k === "in corso") return 0;
  if (k === "in arrivo") return 1;
  return 2;
};

Sito.escapeHtml = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};
