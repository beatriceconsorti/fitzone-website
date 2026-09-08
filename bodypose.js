// ml5.js BodyPose - rilevamento del corpo via webcam
let webcamP5;
let video;
let bodypose;
let poses = [];
let camActive = false;
let camLoading = false;

const startBtn = document.getElementById('startCam');
const stopBtn = document.getElementById('stopCam');
const camStatus = document.getElementById('camStatus');
const canvasContainer = document.getElementById('canvasContainer');

function setupWebcamP5() {
    canvasContainer.innerHTML = '';
    webcamP5 = new p5((inst) => {
        inst.setup = () => {
            const canvas = inst.createCanvas(640, 480);
            canvas.parent(canvasContainer);
            video = inst.createCapture(inst.VIDEO);
            video.size(640, 480);
            video.hide();
            initBodyPose();
        };
        inst.draw = () => {
            inst.background(20, 20, 20);
            if (video) {
                inst.image(video, 0, 0, inst.width, inst.height);
            }
            drawPose(inst);
        };
    });
}

function initBodyPose() {
    bodypose = new ml5.BodyPose({ flipped: true });
    bodypose.detectStart(video, gotPoses);
    camLoading = false;
    camStatus.textContent = '✅ Webcam attiva: rilevamento in corso.';
    camStatus.style.color = 'var(--yellow)';
}

function gotPoses(results) {
    poses = results;
}

function drawPose(inst) {
    if (poses.length === 0) return;
    const pose = poses[0];

    // Collega le ossa (skeleton)
    const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle']
    ];

    // Mappa di nomi che ml5 restituisce in `part`
    const keypoints = {};
    for (let kp of pose.keypoints) {
        keypoints[kp.part] = kp;
    }

    // Disegna le ossa gialle
    inst.stroke(250, 204, 21);
    inst.strokeWeight(4);
    for (let [a, b] of connections) {
        const pa = keypoints[a];
        const pb = keypoints[b];
        if (pa && pb && pa.confidence > 0.5 && pb.confidence > 0.5) {
            inst.line(pa.x, pa.y, pb.x, pb.y);
        }
    }

    // Disegna i giunti (articolazioni)
    inst.noStroke();
    inst.fill(250, 204, 21);
    for (let kp of pose.keypoints) {
        if (kp.confidence > 0.5) {
            inst.circle(kp.x, kp.y, 10);
        }
    }
}

startBtn?.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !window.isSecureContext) {
        camStatus.textContent = '⚠️ La webcam richiede una connessione sicura (HTTPS). Carica il sito su GitHub Pages o avvia un server locale.';
        camStatus.style.color = '#f87171';
        return;
    }
    if (camLoading) return;
    camLoading = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    camStatus.textContent = '⏳ Avvio della webcam...';
    camStatus.style.color = 'var(--gray)';
    setupWebcamP5();
    camActive = true;
});

stopBtn?.addEventListener('click', () => {
    if (video) {
        video.remove();
        video = null;
    }
    if (webcamP5) {
        webcamP5.remove();
        webcamP5 = null;
    }
    canvasContainer.innerHTML = '<p class="webcam-placeholder">🎥 Webcam fermata. Premi il pulsante per riattivarla.</p>';
    camActive = false;
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    camStatus.textContent = 'Webcam fermata.';
    camStatus.style.color = 'var(--gray)';
});
