// p5.js — Unico campo di cubi continuo (ispirato a https://p5js.org/examples/3D-Orbit-Control/)
// Il canvas è fisso dietro tutto il sito: a ogni scroll i cubi fluiscono, ruotano
// e si espandono in base alla velocità dello scroll e al mouse.
const cubeState = {
    cubes: [],
    lastScroll: window.scrollY,
    smoothVel: 0,
    mouseX: -1,
    mouseY: -1
};

const ACCENT_STROKES = [
    [255, 255, 255], [165, 180, 252], [196, 181, 253], [103, 232, 249],
    [244, 114, 182], [129, 140, 248], [94, 234, 212], [251, 191, 36]
];

function setup() {
    const container = document.getElementById('cube-bg');
    const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('cube-bg');
    pixelDensity(1);

    // Nuvola di cubi distribuita in un cilindro largo: la camera li "attraversa"
    // mentre si scorre la pagina (continuità dell'intero sito).
    for (let i = 0; i < 240; i++) {
        const side = random(1, 4);
        cubeState.cubes.push({
            x: (random() - 0.5) * 1100 * side,
            y: random(-2400, 2400),
            z: (random() - 0.5) * 1200 - 200,
            size: random(10, 42),
            speed: random(0.003, 0.012),
            phase: random(TWO_PI),
            stroke: random(ACCENT_STROKES)
        });
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    clear();

    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const scrollY = window.scrollY;
    const progress = Math.max(0, Math.min(scrollY / maxScroll, 1));

    // Velocità di scroll (momentum): i cubi si "allargano" più scatti rapidi
    const vel = scrollY - cubeState.lastScroll;
    cubeState.lastScroll = scrollY;
    cubeState.smoothVel = lerp(cubeState.smoothVel, Math.min(Math.abs(vel), 90), 0.1);
    const surge = 1 + cubeState.smoothVel / 45;

    const t = millis() * 0.00018;

    // Rotazione continua guidata dallo scroll (un giro per pagina)
    rotateY(progress * TWO_PI * 1.5 + t);
    rotateX(sin(t * 0.6) * 0.12 + sin(progress * PI) * 0.18);

    // Camera che avanza dentro la nuvola mentre si scorre
    translate(0, progress * 2400, -progress * 900);

    // Luci: look ghiaccio
    ambientLight(140, 155, 180);
    directionalLight(255, 255, 255, 0.5, 1, -0.6);
    directionalLight(180, 210, 235, -0.6, -0.4, -0.7);
    shininess(70);
    specularMaterial(215, 232, 246);

    // Mouse: cubi vicini al cursore che "esplodono"
    let mx = mouseX >= 0 ? (mouseX / width - 0.5) * 900 : null;
    let my = mouseY >= 0 ? (mouseY / height - 0.5) * 600 : null;

    for (const c of cubeState.cubes) {
        // Espansione pulsante + momentum scroll
        const w = sin(t * (5 + c.speed * 40) + c.phase) * 0.5 + 0.5;
        const grow = (1 + 0.55 * w) * surge;
        const y = c.y + sin(t * 1.3 + c.phase) * 12;

        let boost = 1;
        if (mx !== null) {
            const d = Math.hypot(c.x - mx, y - my);
            if (d < 150) boost = 1 + (1 - d / 150) * 2;
        }

        push();
        translate(c.x, y, c.z);
        rotateX(t * c.speed * 30 + c.phase);
        rotateY(t * c.speed * 40 + c.phase * 2);
        stroke(c.stroke[0], c.stroke[1], c.stroke[2], 70);
        strokeWeight(1);
        const size = c.size * grow * boost;
        box(size, size, size);
        pop();
    }
}