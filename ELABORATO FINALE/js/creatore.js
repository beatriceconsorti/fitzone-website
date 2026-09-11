var Sito = window.Sito || {};

Sito.piazzando = false;

var statoForm = {
  eventoId: null,
  luogoId: null,
  lat: null,
  lng: null,
};

function fillLuogoSelect(selected) {
  var sel = document.getElementById("c-luogo");
  if (!sel) return;
  sel.innerHTML =
    '<option value="">Scegli un Luogo</option>' +
    Sito.catalogo()
      .luoghi.map(function (l) {
        return (
          '<option value="' +
          Sito.escapeHtml(l.id) +
          '"' +
          (l.id === selected ? " selected" : "") +
          ">" +
          Sito.escapeHtml(l.nome) +
          "</option>"
        );
      })
      .join("");
}

function setPiazzando(on) {
  Sito.piazzando = !!on;
  document.body.classList.toggle("is-piazzando", Sito.piazzando);
  var hint = document.getElementById("coord-hint");
  if (!hint) return;
  if (Sito.piazzando) {
    hint.className = "coord-hint is-wait";
    hint.textContent = "Clicca sulla mappa 3D per piazzare il Luogo.";
  } else if (statoForm.lat != null) {
    hint.className = "coord-hint";
    hint.textContent =
      "Punto: " + statoForm.lat.toFixed(5) + ", " + statoForm.lng.toFixed(5);
  } else {
    hint.className = "coord-hint";
    hint.textContent = "";
  }
}

function syncLuogoMode() {
  var modo = document.querySelector('input[name="c-luogo-modo"]:checked');
  var isNuovo = modo && modo.value === "nuovo";
  document.getElementById("c-luogo-esistente").classList.toggle("is-on", !isNuovo);
  document.getElementById("c-luogo-nuovo").classList.toggle("is-on", isNuovo);
  document.getElementById("c-luogo").required = !isNuovo;
  document.getElementById("c-luogo-nome").required = isNuovo;
  setPiazzando(isNuovo && statoForm.lat == null);
}

function resetForm() {
  statoForm = { eventoId: null, luogoId: null, lat: null, lng: null };
  document.getElementById("c-form").reset();
  document.getElementById("c-evento-id").value = "";
  document.querySelector('input[name="c-luogo-modo"][value="esistente"]').checked = true;
  document.getElementById("c-salva").textContent = "Metti sulla mappa";
  document.getElementById("c-msg").textContent = "";
  document.getElementById("c-msg").className = "form-msg";
  fillLuogoSelect("");
  syncLuogoMode();
}

function caricaEvento(id) {
  var evento = Sito.tuttiEventi().filter(function (e) {
    return e.id === id;
  })[0];
  if (!evento) return;
  var luogo = Sito.luogoById(evento.luogoId);
  statoForm = {
    eventoId: evento.id,
    luogoId: evento.luogoId,
    lat: luogo ? luogo.lat : null,
    lng: luogo ? luogo.lng : null,
  };
  document.getElementById("c-evento-id").value = evento.id;
  document.getElementById("c-titolo").value = evento.titolo;
  document.getElementById("c-giorno").value = evento.data;
  document.getElementById("c-testo").value = evento.descrizione || "";
  document.querySelector('input[name="c-luogo-modo"][value="esistente"]').checked = true;
  fillLuogoSelect(evento.luogoId);
  document.getElementById("c-salva").textContent = "Salva";
  document.getElementById("c-msg").textContent = "";
  syncLuogoMode();
}

function renderElenco() {
  var eventi = Sito.tuttiEventi();
  var ul = document.getElementById("elenco-eventi");
  if (!eventi.length) {
    ul.innerHTML = "<li class='meta'>Nessun Evento in questo browser.</li>";
  } else {
    ul.innerHTML = eventi
      .map(function (e) {
        return (
          "<li><div class='nome'>" +
          Sito.escapeHtml(e.titolo) +
          "</div><div class='meta'>" +
          Sito.formatGiorno(e.data) +
          " · " +
          Sito.escapeHtml(e.luogoNome) +
          " · " +
          Sito.etichettaData(e.data) +
          (e.origine === "semina" ? " · semina" : "") +
          "</div><div class='row-actions'>" +
          "<button type='button' data-edit='" +
          Sito.escapeHtml(e.id) +
          "'>Correggi</button>" +
          "<button type='button' data-del='" +
          Sito.escapeHtml(e.id) +
          "'>Togli</button>" +
          "</div></li>"
        );
      })
      .join("");
  }

  var extra = Sito.luoghiAggiunti();
  var box = document.getElementById("elenco-luoghi");
  if (!extra.length) {
    box.innerHTML = "<li class='meta'>Nessun Luogo aggiunto in questo browser.</li>";
  } else {
    box.innerHTML = extra
      .map(function (l) {
        return (
          "<li><div class='nome'>" +
          Sito.escapeHtml(l.nome) +
          "</div><div class='meta'>" +
          (l.eventi.length ? l.eventi.length + " Evento" : "Nessun Evento") +
          "</div><div class='row-actions'>" +
          "<button type='button' data-del-luogo='" +
          Sito.escapeHtml(l.id) +
          "'>Togli</button>" +
          "</div></li>"
        );
      })
      .join("");
  }
}

function messaggio(testo, ok) {
  var el = document.getElementById("c-msg");
  el.textContent = testo;
  el.className = "form-msg " + (ok ? "is-ok" : "is-err");
}

function onSubmit(e) {
  e.preventDefault();
  var titolo = document.getElementById("c-titolo").value.trim();
  var giorno = document.getElementById("c-giorno").value;
  var testo = document.getElementById("c-testo").value.trim();
  if (!titolo || !giorno || !testo) {
    messaggio("Titolo, giorno e testo sono obbligatori.", false);
    return;
  }
  var modo = document.querySelector('input[name="c-luogo-modo"]:checked');
  var isNuovo = modo && modo.value === "nuovo";
  var luogoId;
  if (isNuovo) {
    var nome = document.getElementById("c-luogo-nome").value.trim();
    var suolo = document.getElementById("c-luogo-suolo").value.trim();
    if (!nome) {
      messaggio("Dai un nome al Luogo nuovo.", false);
      return;
    }
    if (statoForm.lat == null || statoForm.lng == null) {
      messaggio("Clicca sulla mappa per piazzare il Luogo.", false);
      setPiazzando(true);
      return;
    }
    luogoId = Sito.salvaLuogo({
      id: statoForm.luogoId,
      nome: nome,
      suolo: suolo,
      lat: statoForm.lat,
      lng: statoForm.lng,
    });
  } else {
    luogoId = document.getElementById("c-luogo").value;
    if (!luogoId) {
      messaggio("Scegli un Luogo dall’elenco.", false);
      return;
    }
  }

  Sito.salvaEvento({
    id: statoForm.eventoId || undefined,
    luogoId: luogoId,
    titolo: titolo,
    data: giorno,
    descrizione: testo,
  });
  Sito.aggiornaMappa();
  renderElenco();
  fillLuogoSelect(luogoId);
  resetForm();
  messaggio("Sulla mappa di questo browser.", true);
}

document.getElementById("elenco-eventi").addEventListener("click", function (e) {
  var edit = e.target.getAttribute("data-edit");
  var del = e.target.getAttribute("data-del");
  if (edit) caricaEvento(edit);
  if (del) {
    Sito.togliEvento(del);
    Sito.aggiornaMappa();
    renderElenco();
    if (statoForm.eventoId === del) resetForm();
  }
});

document.getElementById("elenco-luoghi").addEventListener("click", function (e) {
  var id = e.target.getAttribute("data-del-luogo");
  if (!id) return;
  Sito.togliLuogo(id);
  Sito.aggiornaMappa();
  renderElenco();
  fillLuogoSelect("");
});

document.querySelectorAll('input[name="c-luogo-modo"]').forEach(function (el) {
  el.addEventListener("change", function () {
    statoForm.lat = null;
    statoForm.lng = null;
    statoForm.luogoId = null;
    syncLuogoMode();
  });
});

document.getElementById("c-annulla").onclick = resetForm;
document.getElementById("c-form").addEventListener("submit", onSubmit);

Sito.avviaMappa({
  contenitore: "map",
  onLuogo: function (luogo) {
    if (Sito.piazzando) return;
    Sito.mostraLuogo(luogo);
  },
  onMappaClick: function (lat, lng) {
    statoForm.lat = lat;
    statoForm.lng = lng;
    setPiazzando(false);
    var hint = document.getElementById("coord-hint");
    hint.className = "coord-hint";
    hint.textContent = "Punto: " + lat.toFixed(5) + ", " + lng.toFixed(5);
  },
});

fillLuogoSelect("");
syncLuogoMode();
renderElenco();
