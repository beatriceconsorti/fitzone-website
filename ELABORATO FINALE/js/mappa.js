var Sito = window.Sito || {};

Sito.EVENT_BUILDING_MAX_M = 80;
Sito.MAP_ZOOM = 17.45;
Sito.MAP_TILT = 45;
Sito.MAP_ROT = -22;
Sito.BUILDING_TILES =
  "https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json";
Sito.BUILDING_CACHE_KEY = "ascoli-buildings-v4";

Sito.mappa = {
  osmb: null,
  previewOsmb: null,
  buildingTiles: null,
  detailedLayer: null,
  eventLayer: null,
  eventMarkers: [],
  cachedFc: null,
  buildingTint: { toLuogo: {}, color: {} },
  featureMeta: {},
  loadedBoxes: [],
  overpassBusy: false,
  panTimer: null,
  onLuogo: null,
  onMappaClick: null,
  marksId: "event-marks",
};

function metersToLuogo(lng, lat, luogo) {
  var dy = (lat - luogo.lat) * 110540;
  var dx = (lng - luogo.lng) * 111320 * Math.cos((lat * Math.PI) / 180);
  return Math.hypot(dx, dy);
}

function ringCentroid(ring) {
  var x = 0;
  var y = 0;
  var n = ring.length - 1;
  var i;
  for (i = 0; i < n; i++) {
    x += ring[i][0];
    y += ring[i][1];
  }
  return [x / n, y / n];
}

function ringBBox(ring) {
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var i;
  for (i = 0; i < ring.length - 1; i++) {
    minX = Math.min(minX, ring[i][0]);
    minY = Math.min(minY, ring[i][1]);
    maxX = Math.max(maxX, ring[i][0]);
    maxY = Math.max(maxY, ring[i][1]);
  }
  return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
}

function rememberBuilding(id, luogo) {
  if (!id || !luogo) return;
  var m = Sito.mappa;
  var key = String(id);
  var raw = key.replace(/^osm-w/i, "");
  var col = Sito.coloreLuogo(luogo);
  m.buildingTint.toLuogo[key] = luogo.id;
  m.buildingTint.toLuogo[raw] = luogo.id;
  m.buildingTint.color[key] = col;
  m.buildingTint.color[raw] = col;
}

function readBuildingCache() {
  try {
    var raw = localStorage.getItem(Sito.BUILDING_CACHE_KEY);
    if (!raw) return null;
    var fc = JSON.parse(raw);
    if (!fc || !fc.features || !fc.features.length) return null;
    return fc;
  } catch (err) {
    return null;
  }
}

function writeBuildingCache(fc) {
  try {
    localStorage.setItem(Sito.BUILDING_CACHE_KEY, JSON.stringify(fc));
  } catch (err) {}
}

function dropBuildingTiles() {
  var m = Sito.mappa;
  if (m.buildingTiles && typeof m.buildingTiles.destroy === "function") {
    try {
      m.buildingTiles.destroy();
    } catch (err) {}
  }
  m.buildingTiles = null;
  if (m.osmb) m.osmb.dataGrid = null;
}

function dropEventBeacons() {
  var m = Sito.mappa;
  if (m.eventLayer && typeof m.eventLayer.destroy === "function") {
    try {
      m.eventLayer.destroy();
    } catch (err) {}
  }
  m.eventLayer = null;
}

function isChurch(tags) {
  var b = (tags.building || "") + " " + (tags["building:part"] || "");
  var n = tags.name || "";
  return (
    tags.amenity === "place_of_worship" ||
    /church|cathedral|chapel|basilica/i.test(b) ||
    /chiesa|duomo|cattedrale|battistero/i.test(n)
  );
}

function isTheatre(tags) {
  var blob = (tags.amenity || "") + " " + (tags.building || "") + " " + (tags.name || "");
  return /theatre|theater|teatro/i.test(blob);
}

function isCastle(tags) {
  var blob =
    (tags.historic || "") +
    " " +
    (tags.castle_type || "") +
    " " +
    (tags.building || "") +
    " " +
    (tags.name || "");
  return /castle|fort|malatesta|fortezza/i.test(blob);
}

function matchScore(f, luogo, dist) {
  var meta = Sito.mappa.featureMeta[String(f.id)] || {};
  var props = f.properties || {};
  var name = meta.name || props.name || "";
  var named = luogo.preferName && luogo.preferName.test(name);
  var max = luogo.maxM || Sito.EVENT_BUILDING_MAX_M;
  if (named && dist <= 220) {
    /* ok */
  } else if (dist > max) {
    return null;
  }
  var s = dist;
  if (named) s -= 250;
  if (luogo.preferChurch && (meta.church || props.metaChurch)) s -= 50;
  if (luogo.preferTheatre && (meta.theatre || props.metaTheatre)) s -= 250;
  if (luogo.preferCastle && (meta.castle || props.metaCastle)) s -= 250;
  return s;
}

function cloneFeat(f) {
  return JSON.parse(JSON.stringify(f));
}

function paintEventColors(fc) {
  var m = Sito.mappa;
  var features = fc.features || [];
  var cat = Sito.catalogo();
  var luoghi = cat.luoghi.filter(function (l) {
    return Sito.statoLuogo(l) !== "vuoto";
  });
  m.buildingTint.toLuogo = {};
  m.buildingTint.color = {};
  m.eventMarkers = [];

  var i;
  for (i = 0; i < features.length; i++) {
    if (!features[i].properties) continue;
    features[i].properties.color = Sito.COLOR_CITTA;
    features[i].properties.roofColor = Sito.COLOR_CITTA;
  }

  var pairs = [];
  features.forEach(function (f) {
    if (!f.id || String(f.id).indexOf("-cupola") !== -1) return;
    if (String(f.id).indexOf("ev-") === 0) return;
    var ring = f.geometry && f.geometry.coordinates && f.geometry.coordinates[0];
    if (!ring) return;
    var c = ringCentroid(ring);
    luoghi.forEach(function (luogo) {
      var d = metersToLuogo(c[0], c[1], luogo);
      var s = matchScore(f, luogo, d);
      if (s == null) return;
      pairs.push({ s: s, d: d, f: f, luogo: luogo, c: c });
    });
  });
  pairs.sort(function (a, b) {
    return a.s - b.s;
  });

  var usedFeature = {};
  var usedLuogo = {};
  pairs.forEach(function (p) {
    var fid = String(p.f.id);
    if (usedFeature[fid] || usedLuogo[p.luogo.id]) return;
    usedFeature[fid] = true;
    usedLuogo[p.luogo.id] = true;
    var col = Sito.coloreLuogo(p.luogo);
    p.f.properties.color = col;
    p.f.properties.roofColor = col;
    rememberBuilding(p.f.id, p.luogo);
    var extras = [];
    features.forEach(function (part) {
      if (String(part.id) !== fid + "-cupola" || !part.properties) return;
      part.properties.color = col;
      part.properties.roofColor = col;
      rememberBuilding(part.id, p.luogo);
      extras.push(cloneFeat(part));
    });
    m.eventMarkers.push({
      id: p.luogo.id,
      lng: p.c[0],
      lat: p.c[1],
      alt: Math.max(16, p.f.properties.height || 16) + 1,
      color: col,
      features: [cloneFeat(p.f)].concat(extras),
    });
  });

  luoghi.forEach(function (luogo) {
    if (usedLuogo[luogo.id]) return;
    addBeaconFeature(fc, luogo);
  });

  return fc;
}

function addBeaconFeature(fc, luogo) {
  var m = Sito.mappa;
  var color = Sito.coloreLuogo(luogo);
  var d = luogo.suolo === "piazza" || luogo.suolo === "giardino" ? 0.00012 : 0.00008;
  var h = Sito.statoLuogo(luogo) === "in-corso" ? 28 : 22;
  var id = "ev-" + luogo.id;
  var feat = {
    type: "Feature",
    id: id,
    properties: {
      height: h,
      color: color,
      roofColor: color,
      roofShape: "gabled",
      roofHeight: 6,
      roofDirection: 90,
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [luogo.lng - d, luogo.lat - d],
          [luogo.lng + d, luogo.lat - d],
          [luogo.lng + d, luogo.lat + d],
          [luogo.lng - d, luogo.lat + d],
          [luogo.lng - d, luogo.lat - d],
        ],
      ],
    },
  };
  rememberBuilding(id, luogo);
  fc.features.push(feat);
  m.eventMarkers.push({
    id: luogo.id,
    lng: luogo.lng,
    lat: luogo.lat,
    alt: h + 1,
    color: color,
    features: [cloneFeat(feat)],
  });
}

function mountEventMarks() {
  var m = Sito.mappa;
  var layer = document.getElementById(m.marksId);
  if (!layer) return;
  layer.innerHTML = "";
  m.eventMarkers.forEach(function (mark) {
    var luogo = Sito.luogoById(mark.id);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "event-mark";
    btn.style.setProperty("--mark", mark.color);
    btn.setAttribute("aria-label", luogo ? luogo.nome : "Evento");
    btn.innerHTML =
      '<span class="event-mark-ball"></span><span class="event-mark-dots" aria-hidden="true"></span>';
    btn.onclick = function (e) {
      e.stopPropagation();
      if (luogo && m.onLuogo) m.onLuogo(luogo);
    };
    layer.appendChild(btn);
  });
  syncEventMarks();
}

function syncEventMarks() {
  var m = Sito.mappa;
  if (!m.osmb || typeof m.osmb.project !== "function") return;
  var layer = document.getElementById(m.marksId);
  if (!layer) return;
  var size = m.osmb.getSize ? m.osmb.getSize() : null;
  var h = size && (size.height || size[1]) ? size.height || size[1] : 2000;
  var w = size && (size.width || size[0]) ? size.width || size[0] : 2000;
  var kids = layer.children;
  var i;
  for (i = 0; i < m.eventMarkers.length; i++) {
    var mark = m.eventMarkers[i];
    var el = kids[i];
    if (!el) continue;
    var p = m.osmb.project(mark.lat, mark.lng, mark.alt);
    if (!p || p.x == null || p.y == null || p.x < -40 || p.x > w + 40 || p.y < -60 || p.y > h + 40) {
      el.style.visibility = "hidden";
      continue;
    }
    el.style.visibility = "visible";
    el.style.transform =
      "translate(" + Math.round(p.x) + "px," + Math.round(p.y) + "px) translate(-50%, -100%)";
  }
}

function showDetailedBuildings(fc) {
  var m = Sito.mappa;
  if (!m.osmb || !fc || !fc.features || !fc.features.length) return;
  dropEventBeacons();
  if (m.detailedLayer && typeof m.detailedLayer.destroy === "function") {
    try {
      m.detailedLayer.destroy();
    } catch (err) {}
  }
  var painted = paintEventColors(JSON.parse(JSON.stringify(fc)));
  m.detailedLayer = m.osmb.addGeoJSON(painted, { fadeIn: false });
  mountEventMarks();
}

function addEventBeacons() {
  var m = Sito.mappa;
  if (!m.osmb) return;
  dropEventBeacons();
  m.eventMarkers = [];
  var cat = Sito.catalogo();
  var fc = { type: "FeatureCollection", features: [] };
  cat.luoghi.forEach(function (luogo) {
    if (Sito.statoLuogo(luogo) === "vuoto") return;
    addBeaconFeature(fc, luogo);
  });
  if (!fc.features.length) {
    mountEventMarks();
    return;
  }
  m.eventLayer = m.osmb.addGeoJSON(fc, { fadeIn: false });
  mountEventMarks();
}

function wayRing(el) {
  var pts = el.geometry || [];
  var coords = pts.map(function (p) {
    return [p.lon, p.lat];
  });
  if (!coords.length) return null;
  var a = coords[0];
  var b = coords[coords.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) coords.push([a[0], a[1]]);
  if (coords.length < 4) return null;
  return coords;
}

function orientedRect(ring) {
  var best = 0;
  var ax = 1;
  var ay = 0;
  var i;
  for (i = 0; i < ring.length - 1; i++) {
    var dx = ring[i + 1][0] - ring[i][0];
    var dy = ring[i + 1][1] - ring[i][1];
    var len = Math.hypot(dx, dy);
    if (len > best) {
      best = len;
      ax = dx / len;
      ay = dy / len;
    }
  }
  var px = -ay;
  var py = ax;
  var minA = Infinity;
  var maxA = -Infinity;
  var minP = Infinity;
  var maxP = -Infinity;
  for (i = 0; i < ring.length - 1; i++) {
    var a = ring[i][0] * ax + ring[i][1] * ay;
    var p = ring[i][0] * px + ring[i][1] * py;
    minA = Math.min(minA, a);
    maxA = Math.max(maxA, a);
    minP = Math.min(minP, p);
    maxP = Math.max(maxP, p);
  }
  function pt(a, p) {
    return [a * ax + p * px, a * ay + p * py];
  }
  var rect = [pt(minA, minP), pt(maxA, minP), pt(maxA, maxP), pt(minA, maxP)];
  rect.push(rect[0]);
  return rect;
}

function roofDirectionOf(tags, ring) {
  var raw = String(tags["roof:direction"] || "");
  var num = parseFloat(raw);
  if (!isNaN(num) && raw !== "") return num;
  var compass = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
  };
  if (compass[raw.toUpperCase()] != null) return compass[raw.toUpperCase()];
  var best = 0;
  var bearing = 90;
  var i;
  for (i = 0; i < ring.length - 1; i++) {
    var dx = ring[i + 1][0] - ring[i][0];
    var dy = ring[i + 1][1] - ring[i][1];
    var len = dx * dx + dy * dy;
    if (len > best) {
      best = len;
      var deg = (Math.atan2(dx, dy) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      bearing = (deg + 90) % 360;
    }
  }
  return bearing;
}

function mapRoofShape(raw) {
  var s = String(raw || "").toLowerCase();
  if (!s) return "";
  if (s === "pyramidal") return "pyramid";
  if (s === "hipped" || s === "half-hipped") return "gabled";
  return s;
}

function isHouse(tags) {
  var b = tags.building || "";
  return /^(house|detached|terrace|semidetached_house|bungalow|villa|residential)$/i.test(b);
}

function shortSideMeters(ring) {
  var bb = ringBBox(ring);
  var midLat = (bb.minY + bb.maxY) / 2;
  var dlon = (bb.maxX - bb.minX) * 111320 * Math.cos((midLat * Math.PI) / 180);
  var dlat = (bb.maxY - bb.minY) * 110540;
  return Math.min(dlon, dlat);
}

function pitchHeight(ring, minH) {
  var w = shortSideMeters(ring);
  return Math.max(minH, Math.min(8.5, w * 0.33));
}

function needsRidge(shape) {
  return shape === "gabled" || shape === "skillion" || shape === "gambrel" || shape === "mansard";
}

function modelProperties(tags, ring) {
  var levels = parseFloat(tags["building:levels"]) || 0;
  var taggedHeight = parseFloat(tags.height) || 0;
  var roofShape = mapRoofShape(tags["roof:shape"]);
  var roofHeight = parseFloat(tags["roof:height"]) || 0;
  var walls = taggedHeight;
  var color = Sito.COLOR_CITTA;
  var roofColor = Sito.COLOR_CITTA;
  if (isChurch(tags)) {
    if (!walls) walls = /duomo|cattedrale/i.test(tags.name || "") ? 22 : 12;
    if (!roofShape) roofShape = "gabled";
    if (!roofHeight) roofHeight = pitchHeight(ring, Math.max(5.5, walls * 0.28));
  } else if (isCastle(tags)) {
    if (!walls) walls = 16;
    if (!roofShape) roofShape = "gabled";
    if (!roofHeight) roofHeight = 4;
  } else if (isTheatre(tags)) {
    if (!walls) walls = 14;
    if (!roofShape) roofShape = "gabled";
    if (!roofHeight) roofHeight = 5;
  } else if (isHouse(tags)) {
    if (!walls) walls = Math.max(6.5, (levels || 2) * 3.1);
    if (!roofShape) roofShape = "gabled";
    if (!roofHeight) roofHeight = pitchHeight(ring, 3.2);
  } else if (/apartments/i.test(tags.building || "")) {
    if (!walls) walls = Math.max(12, (levels || 4) * 3.1);
    if (!roofShape) roofShape = levels > 5 ? "flat" : "gabled";
    if (!roofHeight && roofShape !== "flat") roofHeight = pitchHeight(ring, 3);
  } else {
    if (!walls) walls = Math.max(8, (levels || 3) * 3.1);
    if (!roofShape) roofShape = levels <= 4 ? "gabled" : "flat";
    if (!roofHeight && roofShape !== "flat") roofHeight = pitchHeight(ring, 3);
  }
  var height = taggedHeight ? taggedHeight : walls + (roofShape === "flat" ? 0 : roofHeight);
  if (taggedHeight && roofHeight) {
    roofHeight = Math.min(roofHeight, taggedHeight * 0.45);
  }
  var props = {
    height: height,
    color: color,
    roofColor: roofColor,
    name: tags.name || "",
  };
  if (levels) props.levels = levels;
  if (roofShape) props.roofShape = roofShape;
  if (roofHeight) props.roofHeight = roofHeight;
  if (needsRidge(roofShape)) props.roofDirection = roofDirectionOf(tags, ring);
  if (tags.min_height) props.minHeight = parseFloat(tags.min_height);
  return props;
}

function churchCupola(ring, baseHeight, id) {
  var c = ringCentroid(ring);
  var d = 0.000045;
  var sq = [
    [c[0] - d, c[1] - d],
    [c[0] + d, c[1] - d],
    [c[0] + d, c[1] + d],
    [c[0] - d, c[1] + d],
    [c[0] - d, c[1] - d],
  ];
  return {
    type: "Feature",
    id: id + "-cupola",
    properties: {
      height: baseHeight + 10,
      minHeight: Math.max(0, baseHeight - 0.4),
      roofShape: "dome",
      roofHeight: 9,
      color: Sito.COLOR_CITTA,
      roofColor: Sito.COLOR_CITTA,
    },
    geometry: { type: "Polygon", coordinates: [sq] },
  };
}

function footprintForRoof(ring, tags) {
  if (isChurch(tags) || isCastle(tags)) return ring;
  if (ring.length - 1 > 8) return orientedRect(ring);
  return ring;
}

function overpassToFeatures(data) {
  var m = Sito.mappa;
  var els = (data && data.elements) || [];
  var items = [];
  els.forEach(function (el) {
    var tags = el.tags || {};
    if (
      !tags.building &&
      !tags["building:part"] &&
      tags.amenity !== "theatre" &&
      tags.amenity !== "place_of_worship" &&
      tags.historic !== "castle" &&
      tags.historic !== "fort"
    ) {
      return;
    }
    var ring = wayRing(el);
    if (!ring) return;
    items.push({
      id: "osm-w" + el.id,
      tags: tags,
      ring: ring,
      part: !!tags["building:part"],
    });
  });
  var parts = items.filter(function (it) {
    return it.part;
  });
  var features = [];
  items.forEach(function (it) {
    if (
      !it.part &&
      parts.length &&
      (isChurch(it.tags) || it.tags["building:parts"])
    ) {
      var bb = ringBBox(it.ring);
      var inside = 0;
      parts.forEach(function (p) {
        var c = ringCentroid(p.ring);
        if (c[0] >= bb.minX && c[0] <= bb.maxX && c[1] >= bb.minY && c[1] <= bb.maxY) {
          inside += 1;
        }
      });
      if (inside >= 2) return;
    }
    var ring = footprintForRoof(it.ring, it.tags);
    var props = modelProperties(it.tags, ring);
    props.metaChurch = isChurch(it.tags);
    props.metaTheatre = isTheatre(it.tags);
    props.metaCastle = isCastle(it.tags);
    m.featureMeta[it.id] = {
      name: it.tags.name || "",
      church: props.metaChurch,
      theatre: props.metaTheatre,
      castle: props.metaCastle,
    };
    features.push({
      type: "Feature",
      id: it.id,
      properties: props,
      geometry: { type: "Polygon", coordinates: [ring] },
    });
    if (isChurch(it.tags)) {
      features.push(churchCupola(it.ring, props.height, it.id));
    }
  });
  return features;
}

function mergeBuildingFeatures(features) {
  var m = Sito.mappa;
  if (!m.cachedFc) m.cachedFc = { type: "FeatureCollection", features: [] };
  var have = {};
  m.cachedFc.features.forEach(function (f) {
    have[String(f.id)] = true;
  });
  var added = 0;
  features.forEach(function (f) {
    if (have[String(f.id)]) return;
    m.cachedFc.features.push(f);
    have[String(f.id)] = true;
    added += 1;
  });
  return added;
}

function rememberBox(box) {
  var m = Sito.mappa;
  m.loadedBoxes = m.loadedBoxes || [];
  m.loadedBoxes.push({ s: box.s, w: box.w, n: box.n, e: box.e });
}

function viewBox() {
  var m = Sito.mappa;
  if (!m.osmb || typeof m.osmb.getBounds !== "function") return null;
  var b = m.osmb.getBounds();
  if (!b || !b.length) return null;
  var lats = [];
  var lngs = [];
  b.forEach(function (p) {
    if (!p) return;
    lats.push(p.latitude);
    lngs.push(p.longitude);
  });
  if (!lats.length) return null;
  var pad = 0.0014;
  var box = {
    s: Math.min.apply(null, lats) - pad,
    n: Math.max.apply(null, lats) + pad,
    w: Math.min.apply(null, lngs) - pad,
    e: Math.max.apply(null, lngs) + pad,
  };
  var maxSpan = 0.02;
  if (box.n - box.s > maxSpan) {
    var midLat = (box.n + box.s) / 2;
    box.s = midLat - maxSpan / 2;
    box.n = midLat + maxSpan / 2;
  }
  if (box.e - box.w > maxSpan) {
    var midLng = (box.e + box.w) / 2;
    box.w = midLng - maxSpan / 2;
    box.e = midLng + maxSpan / 2;
  }
  return box;
}

function boxCovered(box) {
  var boxes = Sito.mappa.loadedBoxes || [];
  var i;
  for (i = 0; i < boxes.length; i++) {
    var l = boxes[i];
    if (box.s >= l.s && box.n <= l.n && box.w >= l.w && box.e <= l.e) return true;
  }
  return false;
}

function overpassQuery(box) {
  var b = box.s + "," + box.w + "," + box.n + "," + box.e;
  return (
    "[out:json][timeout:40];(" +
    'way["building"](' + b + ");" +
    'way["building:part"](' + b + ");" +
    'way["amenity"="theatre"](' + b + ");" +
    'way["amenity"="place_of_worship"](' + b + ");" +
    'way["historic"="castle"](' + b + ");" +
    'way["historic"="fort"](' + b + ");" +
    ");out geom;"
  );
}

function fetchWithTimeout(url, ms) {
  var ctrl = typeof AbortController === "function" ? new AbortController() : null;
  var to = window.setTimeout(function () {
    if (ctrl) ctrl.abort();
  }, ms || 12000);
  var opts = ctrl ? { signal: ctrl.signal } : {};
  return fetch(url, opts).then(
    function (r) {
      window.clearTimeout(to);
      return r;
    },
    function (err) {
      window.clearTimeout(to);
      throw err;
    }
  );
}

function loadOverpassBox(box, writeCache) {
  var m = Sito.mappa;
  if (!m.osmb || !box || m.overpassBusy) return;
  m.overpassBusy = true;
  var q = overpassQuery(box);
  var urls = [
    "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(q),
    "https://overpass.kumi.systems/api/interpreter?data=" + encodeURIComponent(q),
    "https://overpass.osm.ch/api/interpreter?data=" + encodeURIComponent(q),
  ];
  function pull(i) {
    if (i >= urls.length || !m.osmb) {
      m.overpassBusy = false;
      return;
    }
    fetchWithTimeout(urls[i], 12000)
      .then(function (r) {
        if (!r.ok) throw new Error("overpass");
        return r.json();
      })
      .then(function (data) {
        m.overpassBusy = false;
        if (!m.osmb) return;
        var features = overpassToFeatures(data);
        if (!features.length) {
          rememberBox(box);
          return;
        }
        mergeBuildingFeatures(features);
        rememberBox(box);
        if (writeCache) writeBuildingCache(m.cachedFc);
        showDetailedBuildings(m.cachedFc);
      })
      .catch(function () {
        if (i + 1 < urls.length) pull(i + 1);
        else m.overpassBusy = false;
      });
  }
  pull(0);
}

function loadVisibleBuildings() {
  var box = viewBox();
  if (!box || boxCovered(box)) return;
  loadOverpassBox(box, false);
}

function loadDetailedModels() {
  loadOverpassBox(
    { s: 42.851, w: 13.569, n: 42.8595, e: 13.5875 },
    true
  );
}

function destroyPreview() {
  var m = Sito.mappa;
  if (m.previewOsmb && typeof m.previewOsmb.destroy === "function") {
    try {
      m.previewOsmb.destroy();
    } catch (err) {}
  }
  m.previewOsmb = null;
  var box = document.getElementById("luogo-3d");
  if (box) box.innerHTML = "";
}

function ringToMeters(ring, origin) {
  var cos = Math.cos((origin[1] * Math.PI) / 180);
  return ring.map(function (pt) {
    return [
      (pt[0] - origin[0]) * 111320 * cos,
      (pt[1] - origin[1]) * 110540,
    ];
  });
}

function isoPoint(mx, my, z, originX, originY, scale) {
  return {
    x: originX + (mx - my) * scale,
    y: originY - ((mx + my) * scale) / 2 - z * scale * 0.9,
  };
}

function shadeHex(hex, amt) {
  var h = String(hex || "").replace("#", "");
  if (h.length !== 6) return hex;
  var n = parseInt(h, 16);
  var r = Math.max(0, Math.min(255, (n >> 16) + amt));
  var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  var b = Math.max(0, Math.min(255, (n & 255) + amt));
  return "rgb(" + r + "," + g + "," + b + ")";
}

function drawIsoVolume(ctx, meters, height, color, originX, originY, scale) {
  if (!meters || meters.length < 4) return;
  var roof = [];
  var i;
  for (i = 0; i < meters.length; i++) {
    roof.push(isoPoint(meters[i][0], meters[i][1], height, originX, originY, scale));
  }
  var walls = [];
  for (i = 0; i < meters.length - 1; i++) {
    var a0 = isoPoint(meters[i][0], meters[i][1], 0, originX, originY, scale);
    var a1 = isoPoint(meters[i + 1][0], meters[i + 1][1], 0, originX, originY, scale);
    var b1 = isoPoint(meters[i + 1][0], meters[i + 1][1], height, originX, originY, scale);
    var b0 = isoPoint(meters[i][0], meters[i][1], height, originX, originY, scale);
    walls.push({ midY: (a0.y + a1.y) / 2, pts: [a0, a1, b1, b0] });
  }
  walls.sort(function (a, b) {
    return a.midY - b.midY;
  });
  ctx.lineJoin = "round";
  walls.forEach(function (wall, idx) {
    ctx.beginPath();
    ctx.moveTo(wall.pts[0].x, wall.pts[0].y);
    wall.pts.forEach(function (p) {
      ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = idx % 2 ? color : shadeHex(color, -18);
    ctx.globalAlpha = 0.94;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(63,58,54,0.18)";
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(roof[0].x, roof[0].y);
  for (i = 1; i < roof.length; i++) ctx.lineTo(roof[i].x, roof[i].y);
  ctx.closePath();
  ctx.fillStyle = shadeHex(color, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(63,58,54,0.22)";
  ctx.stroke();
}

function listaEventiHtml(luogo) {
  if (!luogo.eventi || !luogo.eventi.length) {
    return "<p class='when'>Nessun Evento su questo Luogo.</p>";
  }
  return luogo.eventi
    .map(function (e) {
      var k = Sito.etichettaData(e.data);
      var cls = k === "in corso" ? "tag-now" : k === "in arrivo" ? "tag-soon" : "tag-past";
      var desc = e.descrizione
        ? "<p class='ev-desc'>" + Sito.escapeHtml(e.descrizione) + "</p>"
        : "";
      return (
        "<div class='ev'><span class='tag " +
        cls +
        "'>" +
        k +
        "</span><div class='ev-title'>" +
        Sito.escapeHtml(e.titolo) +
        "</div>" +
        desc +
        "<p class='when'>" +
        Sito.formatGiorno(e.data) +
        "</p></div>"
      );
    })
    .join("");
}

Sito.mostraLuogo = function (luogo) {
  var card = document.getElementById("luogo-card");
  if (!card || !luogo) return;
  if (Sito.statoLuogo(luogo) === "vuoto") return;
  destroyPreview();
  card.style.setProperty("--luogo", Sito.coloreLuogo(luogo));
  card.classList.add("is-open");
  var kind = luogo.suolo
    ? "<p class='luogo-kind'>" + Sito.escapeHtml(Sito.suoloLabel(luogo.suolo)) + "</p>"
    : "";
  card.innerHTML =
    '<div class="luogo-pop" id="luogo-pop">' +
    '<div class="luogo-3d" id="luogo-3d"></div>' +
    '<div class="luogo-pop-copy">' +
    "<div class='luogo-card-head'><div><h2>" +
    Sito.escapeHtml(luogo.nome) +
    "</h2>" +
    kind +
    "</div><button type='button' class='luogo-close' id='luogo-close' aria-label='Chiudi'>×</button></div>" +
    listaEventiHtml(luogo) +
    "</div></div>";
  card.onclick = function (e) {
    if (e.target === card) Sito.nascondiLuogo();
  };
  var pop = document.getElementById("luogo-pop");
  if (pop) {
    pop.onclick = function (e) {
      e.stopPropagation();
    };
  }
  var close = document.getElementById("luogo-close");
  if (close) close.onclick = Sito.nascondiLuogo;
  window.requestAnimationFrame(function () {
    showLuogoPreview(luogo);
  });
};

Sito.nascondiLuogo = function () {
  destroyPreview();
  var card = document.getElementById("luogo-card");
  if (!card) return;
  card.classList.remove("is-open");
  card.style.removeProperty("--luogo");
  card.innerHTML = "";
  card.onclick = null;
};

function showLuogoPreview(luogo) {
  var m = Sito.mappa;
  var box = document.getElementById("luogo-3d");
  if (!box) return;
  var mark = m.eventMarkers.filter(function (item) {
    return item.id === luogo.id;
  })[0];
  var feats = mark && mark.features && mark.features.length ? mark.features : [];
  var color = Sito.coloreLuogo(luogo);
  var w = Math.max(160, box.clientWidth);
  var h = Math.max(160, box.clientHeight);
  var canvas = document.createElement("canvas");
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  box.innerHTML = "";
  box.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#efe8e0";
  ctx.fillRect(0, 0, w, h);
  var origin = [mark ? mark.lng : luogo.lng, mark ? mark.lat : luogo.lat];
  var models = feats
    .map(function (f) {
      var ring = f.geometry && f.geometry.coordinates && f.geometry.coordinates[0];
      if (!ring) return null;
      return {
        meters: ringToMeters(ring, origin),
        height: Math.max(8, (f.properties && f.properties.height) || 12),
      };
    })
    .filter(Boolean);
  if (!models.length) {
    models.push({
      meters: ringToMeters(
        [
          [origin[0] - 0.00008, origin[1] - 0.00008],
          [origin[0] + 0.00008, origin[1] - 0.00008],
          [origin[0] + 0.00008, origin[1] + 0.00008],
          [origin[0] - 0.00008, origin[1] + 0.00008],
          [origin[0] - 0.00008, origin[1] - 0.00008],
        ],
        origin
      ),
      height: 16,
    });
  }
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  models.forEach(function (model) {
    model.meters.forEach(function (pt) {
      var p0 = isoPoint(pt[0], pt[1], 0, 0, 0, 1);
      var p1 = isoPoint(pt[0], pt[1], model.height, 0, 0, 1);
      minX = Math.min(minX, p0.x, p1.x);
      maxX = Math.max(maxX, p0.x, p1.x);
      minY = Math.min(minY, p0.y, p1.y);
      maxY = Math.max(maxY, p0.y, p1.y);
    });
  });
  var spanX = Math.max(12, maxX - minX);
  var spanY = Math.max(12, maxY - minY);
  var scale = Math.min((w * 0.62) / spanX, (h * 0.62) / spanY);
  var ox = w / 2 - ((minX + maxX) / 2) * scale;
  var oy = h / 2 - ((minY + maxY) / 2) * scale + h * 0.08;
  models.sort(function (a, b) {
    return a.height - b.height;
  });
  models.forEach(function (model) {
    drawIsoVolume(ctx, model.meters, model.height, color, ox, oy, scale);
  });
}

function pointerLatLng(e) {
  var lat = e.latitude != null ? e.latitude : e.lat;
  var lng = e.longitude != null ? e.longitude : e.lng != null ? e.lng : e.lon;
  if (lat == null || lng == null) return null;
  return { lat: lat, lng: lng };
}

Sito.avviaMappa = function (opts) {
  var m = Sito.mappa;
  opts = opts || {};
  m.onLuogo = opts.onLuogo || null;
  m.onMappaClick = opts.onMappaClick || null;
  m.marksId = opts.marksId || "event-marks";
  var box = document.getElementById(opts.contenitore || "map");
  m.osmb = new OSMBuildings({
    container: opts.contenitore || "map",
    position: { latitude: 42.8544, longitude: 13.5762 },
    zoom: Sito.MAP_ZOOM,
    minZoom: 14.8,
    maxZoom: 20,
    tilt: Sito.MAP_TILT,
    rotation: Sito.MAP_ROT,
    effects: ["shadows"],
    backgroundColor: "#efe8e0",
    fogColor: "#e8e0d8",
    highlightColor: Sito.COLOR_IN_CORSO,
    style: { color: Sito.COLOR_CITTA },
    attribution: "© OpenStreetMap © OSM Buildings",
  });
  m.osmb.addMapTiles("https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png");
  if (typeof m.osmb.setDate === "function") {
    var now = new Date();
    m.osmb.setDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0));
  }
  m.osmb.setTilt(Sito.MAP_TILT);
  m.osmb.setRotation(Sito.MAP_ROT);
  m.osmb.setZoom(Sito.MAP_ZOOM);
  m.loadedBoxes = [];
  var cached = readBuildingCache();
  if (cached) {
    m.cachedFc = cached;
    m.loadedBoxes.push({ s: 42.851, w: 13.569, n: 42.8595, e: 13.5875 });
    showDetailedBuildings(cached);
  } else {
    addEventBeacons();
    loadDetailedModels();
  }
  m.osmb.on("change", function () {
    syncEventMarks();
    if (m.panTimer) window.clearTimeout(m.panTimer);
    m.panTimer = window.setTimeout(loadVisibleBuildings, 480);
  });
  m.osmb.on("resize", syncEventMarks);
  m.osmb.on("pointerup", function (e) {
    var pos = pointerLatLng(e);
    if (Sito.piazzando && m.onMappaClick && pos) {
      m.onMappaClick(pos.lat, pos.lng);
      return;
    }
    var feats = e.features || [];
    var i;
    for (i = 0; i < feats.length; i++) {
      var raw = feats[i];
      var fid = String(raw && (raw.id != null ? raw.id : raw));
      var luogoId =
        m.buildingTint.toLuogo[fid] ||
        m.buildingTint.toLuogo[fid.replace(/^osm-w/i, "")];
      if (luogoId) {
        var luogo = Sito.luogoById(luogoId);
        if (luogo && m.onLuogo) m.onLuogo(luogo);
        return;
      }
    }
    Sito.nascondiLuogo();
  });
  window.setTimeout(function () {
    if (!m.osmb || !box) return;
    m.osmb.setSize(box.clientWidth, box.clientHeight);
    m.osmb.setTilt(Sito.MAP_TILT);
    m.osmb.setRotation(Sito.MAP_ROT);
    m.osmb.setZoom(Sito.MAP_ZOOM);
    m.osmb.setPosition({ latitude: 42.8544, longitude: 13.5762 });
    syncEventMarks();
  }, 200);
};

Sito.aggiornaMappa = function () {
  var m = Sito.mappa;
  var opts = {
    contenitore: "map",
    marksId: m.marksId,
    onLuogo: m.onLuogo,
    onMappaClick: m.onMappaClick,
  };
  var cached = m.cachedFc;
  var meta = m.featureMeta;
  Sito.distruggiMappa();
  m.cachedFc = cached;
  m.featureMeta = meta;
  Sito.avviaMappa(opts);
};

Sito.distruggiMappa = function () {
  var m = Sito.mappa;
  dropBuildingTiles();
  dropEventBeacons();
  m.detailedLayer = null;
  m.eventMarkers = [];
  m.loadedBoxes = [];
  m.overpassBusy = false;
  if (m.panTimer) window.clearTimeout(m.panTimer);
  m.panTimer = null;
  var marks = document.getElementById(m.marksId);
  if (marks) marks.innerHTML = "";
  destroyPreview();
  if (m.osmb && typeof m.osmb.destroy === "function") {
    try {
      m.osmb.destroy();
    } catch (err) {}
  }
  m.osmb = null;
  m.onLuogo = null;
  m.onMappaClick = null;
};

window.addEventListener("resize", function () {
  var m = Sito.mappa;
  var box = document.getElementById("map");
  if (m.osmb && box) m.osmb.setSize(box.clientWidth, box.clientHeight);
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") Sito.nascondiLuogo();
});
