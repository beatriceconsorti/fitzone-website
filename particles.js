// p5.js - Canvas di particelle animate come sfondo fisso (instance mode)
let particlesInstance;
let particles = [];
const PARTICLE_COUNT = 90;

new p5((inst) => {
    inst.setup = () => {
        const container = document.getElementById('particles-bg');
        const canvas = inst.createCanvas(inst.windowWidth, inst.windowHeight);
        canvas.parent(container);
        inst.clear();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: inst.random(inst.width),
                y: inst.random(inst.height),
                vx: inst.random(-0.8, 0.8),
                vy: inst.random(-0.8, 0.8),
                r: inst.random(1, 4),
                alpha: inst.random(80, 220)
            });
        }
    };

    inst.draw = () => {
        inst.clear();
        inst.noStroke();

        for (let p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > inst.width) p.vx *= -1;
            if (p.y < 0 || p.y > inst.height) p.vy *= -1;

            inst.fill(250, 204, 21, p.alpha);
            inst.circle(p.x, p.y, p.r * 2);
        }

        inst.stroke(250, 204, 21, 40);
        inst.strokeWeight(1);
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const d = inst.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                if (d < 120) {
                    inst.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                }
            }
        }
    };

    inst.windowResized = () => {
        inst.resizeCanvas(inst.windowWidth, inst.windowHeight);
    };
});
