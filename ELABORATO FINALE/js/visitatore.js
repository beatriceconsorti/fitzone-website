var Sito = window.Sito || {};

function opzioniLuoghi() {
  return Sito.catalogo()
    .luoghi.map(function (l) {
      return (
        '<option value="' +
        Sito.escapeHtml(l.id) +
        '">' +
        Sito.escapeHtml(l.nome) +
        "</option>"
      );
    })
    .join("");
}

function sincronizzaLuogoFields() {
  var modo = document.querySelector('input[name="luogo-modo"]:checked');
  var extra = document.getElementById("luogo-nuovo-campi");
  var esistente = document.getElementById("luogo-esistente-campi");
  var select = document.getElementById("luogo-elenco");
  var isNuovo = modo && modo.value === "nuovo";
  if (extra) extra.classList.toggle("is-on", isNuovo);
  if (esistente) esistente.classList.toggle("is-on", !isNuovo);
  if (select) {
    select.disabled = isNuovo;
    select.required = !isNuovo;
  }
  var nome = document.getElementById("luogo-nome");
  var dove = document.getElementById("luogo-dove");
  if (nome) nome.required = isNuovo;
  if (dove) dove.required = isNuovo;
}

function apriProposta() {
  var modal = document.getElementById("form-modal");
  if (!modal) return;
  var select = document.getElementById("luogo-elenco");
  if (select) select.innerHTML = opzioniLuoghi();
  var form = document.getElementById("proposta-form");
  if (form) form.reset();
  var esistente = document.querySelector('input[name="luogo-modo"][value="esistente"]');
  if (esistente) esistente.checked = true;
  var msg = document.getElementById("proposta-msg");
  if (msg) {
    msg.textContent = "";
    msg.className = "form-msg";
  }
  sincronizzaLuogoFields();
  modal.classList.add("is-open");
}

function chiudiProposta() {
  var modal = document.getElementById("form-modal");
  if (modal) modal.classList.remove("is-open");
}

function mostraMsg(testo, ok) {
  var msg = document.getElementById("proposta-msg");
  if (!msg) return;
  msg.textContent = testo;
  msg.className = "form-msg " + (ok ? "is-ok" : "is-err");
}

function inviaProposta(e) {
  e.preventDefault();
  var form = e.target;
  var modo = document.querySelector('input[name="luogo-modo"]:checked');
  var isNuovo = modo && modo.value === "nuovo";
  var titolo = form.titolo.value.trim();
  var giorno = form.giorno.value;
  var testo = form.testo.value.trim();
  var nome = form.nome.value.trim();
  var email = form.email.value.trim();
  if (!titolo || !giorno || !testo || !nome || !email) {
    mostraMsg("Compila tutti i campi obbligatori.", false);
    return;
  }
  var luogoLabel;
  var nomeLuogo = "";
  var dove = "";
  if (isNuovo) {
    nomeLuogo = form["luogo-nome"].value.trim();
    dove = form["luogo-dove"].value.trim();
    if (!nomeLuogo || !dove) {
      mostraMsg("Per un Luogo nuovo servono il nome e dove sta.", false);
      return;
    }
    luogoLabel = "Luogo nuovo";
  } else {
    var select = form["luogo-elenco"];
    var opt = select.options[select.selectedIndex];
    if (!opt || !opt.value) {
      mostraMsg("Scegli un Luogo dall’elenco.", false);
      return;
    }
    luogoLabel = opt.text;
  }

  if (!WEB3FORMS_ACCESS_KEY) {
    mostraMsg(
      "La Proposta non parte: manca la chiave Web3Forms in js/config.js.",
      false
    );
    return;
  }

  var body = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: "Proposta di Evento — Ascoli Piceno",
    from_name: nome,
    email: email,
    Titolo: titolo,
    Giorno: giorno,
    Testo: testo,
    Nome: nome,
    Luogo: luogoLabel,
  };
  if (isNuovo) {
    body["Nome del Luogo"] = nomeLuogo;
    body["Dove sta"] = dove;
  }

  var btn = form.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data && data.success) {
        form.reset();
        sincronizzaLuogoFields();
        mostraMsg("Proposta inviata. Il Creatore la leggerà nella mail.", true);
      } else {
        mostraMsg("Invio non riuscito. Riprova tra un momento.", false);
      }
    })
    .catch(function () {
      mostraMsg("Invio non riuscito. Controlla la connessione.", false);
    })
    .then(function () {
      if (btn) btn.disabled = false;
    });
}

Sito.avviaMappa({
  contenitore: "map",
  onLuogo: function (luogo) {
    Sito.mostraLuogo(luogo);
  },
});

document.getElementById("proponi").onclick = apriProposta;
document.getElementById("chiudi-form").onclick = chiudiProposta;
document.getElementById("form-modal").addEventListener("click", function (e) {
  if (e.target.id === "form-modal") chiudiProposta();
});
document.querySelectorAll('input[name="luogo-modo"]').forEach(function (el) {
  el.addEventListener("change", sincronizzaLuogoFields);
});
document.getElementById("proposta-form").addEventListener("submit", inviaProposta);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") chiudiProposta();
});
sincronizzaLuogoFields();
