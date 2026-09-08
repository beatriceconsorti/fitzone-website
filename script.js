// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Form submission
const form = document.getElementById('contactForm');

// Database dei piani di allenamento
const workoutPlans = {
    loss: {
        beginner: {
            3: [
                { day: 'Giorno 1', session: 'Cardio base', exercises: 'Camminata veloce 30min, Leg Press, Lat Machine' },
                { day: 'Giorno 2', session: 'Full Body', exercises: 'Squat a corpo libero, Push-up, Rematore, Plank' },
                { day: 'Giorno 3', session: 'Cardio + Core', exercises: 'Cyclette 25min, Crunch, Mountain Climber' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Gambe & Cardio', exercises: 'Squat, Affondi, Leg Press, Cardio 20min' },
                { day: 'Giorno 2', session: 'Spinta', exercises: 'Push-up, Chest Press, Shoulder Press' },
                { day: 'Giorno 3', session: 'Trazione & Core', exercises: 'Lat Machine, Rematore, Plank, Russian Twist' },
                { day: 'Giorno 4', session: 'Cardio HIIT', exercises: 'Interval training 25min, Burpee, Jumping Jack' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Petto & Tricipiti', exercises: 'Panca piana, Croci, Push-up, French Press' },
                { day: 'Giorno 2', session: 'Gambe & Glutei', exercises: 'Squat, Affondi, Hip Thrust, Leg Curl' },
                { day: 'Giorno 3', session: 'Cardio HIIT', exercises: 'Interval 30min, Sprint, Mountain Climber' },
                { day: 'Giorno 4', session: 'Schiena & Bicipiti', exercises: 'Trazioni, Rematore, Curl bilanciere' },
                { day: 'Giorno 5', session: 'Spalle & Core', exercises: 'Shoulder Press, Alzate laterali, Plank' }
            ]
        },
        intermediate: {
            3: [
                { day: 'Giorno 1', session: 'Full Body A', exercises: 'Squat con bilanciere, Panca, Rematore, Russian Twist' },
                { day: 'Giorno 2', session: 'Circuito HIIT', exercises: 'Burpee, Kettlebell Swing, Battle Rope, 8 round' },
                { day: 'Giorno 3', session: 'Gambe & Cardio', exercises: 'Squat, Stacco rumeno, Affondi, Cardio 25min' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Gambe', exercises: 'Squat, Stacco, Affondi, Leg Press, Calf' },
                { day: 'Giorno 2', session: 'Spinta', exercises: 'Panca, Shoulder Press, Dip, Croci' },
                { day: 'Giorno 3', session: 'Trazione', exercises: 'Trazioni, Rematore, Face Pull, Curl' },
                { day: 'Giorno 4', session: 'HIIT & Core', exercises: 'Tabata 20min, Plank, Leg Raise, Bicicletta' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Petto & Tricipiti', exercises: 'Panca piana, Incline Press, Dip, Push-down' },
                { day: 'Giorno 2', session: 'Gambe', exercises: 'Squat, Stacco, Affondi, Leg Extension' },
                { day: 'Giorno 3', session: 'Schiena & Bicipiti', exercises: 'Trazioni, Rematore, Pulldown, Curl' },
                { day: 'Giorno 4', session: 'Spalle & Cardio', exercises: 'Shoulder Press, Suppa, Cardio 30min' },
                { day: 'Giorno 5', session: 'Core & HIIT', exercises: 'Plank, Turkish Get-up, Cardio Tabata' }
            ]
        },
        advanced: {
            3: [
                { day: 'Giorno 1', session: 'PUSH (pesante)', exercises: 'Panca pesante, Overhead Press, Dip con peso' },
                { day: 'Giorno 2', session: 'Gambe (pesante)', exercises: 'Squat frontale, Stacco rumeno, Affondi camminati' },
                { day: 'Giorno 3', session: 'PULL + Cardio', exercises: 'Trazioni pesate, Rematore, HIIT 20min' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Push', exercises: 'Panca, OHP, Dip, Push-up esplosivo' },
                { day: 'Giorno 2', session: 'Pull', exercises: 'Trazioni, Rematore con manubri, Face Pull' },
                { day: 'Giorno 3', session: 'Legs', exercises: 'Squat, Stacco, Affondi, Leg Curl, Calf' },
                { day: 'Giorno 4', session: 'HIIT intenso', exercises: 'Sprint, Burpee, Kettlebell, 5 round' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Push heavy', exercises: 'Panca 5x5, OHP 5x5, Dip pesato' },
                { day: 'Giorno 2', session: 'Pull heavy', exercises: 'Trazioni pesate 5x5, Rematore 5x5' },
                { day: 'Giorno 3', session: 'Legs heavy', exercises: 'Squat 5x5, Stacco 1x5, Affondi' },
                { day: 'Giorno 4', session: 'Accessori & Cardio', exercises: 'Isolamento, Cardio LISS 30min' },
                { day: 'Giorno 5', session: 'Full Body power', exercises: 'Clean, Press, Kettlebell, Crossfit WOD' }
            ]
        }
    },
    muscle: {
        beginner: {
            3: [
                { day: 'Giorno 1', session: 'Petto & Tricipiti', exercises: 'Panca manubri 3x10, Croci, Push-up, French Press' },
                { day: 'Giorno 2', session: 'Schiena & Bicipiti', exercises: 'Lat Machine, Rematore, Curl, Hammer Curl' },
                { day: 'Giorno 3', session: 'Gambe & Spalle', exercises: 'Leg Press, Squat, Shoulder Press, Alzate' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Petto & Tricipiti', exercises: 'Panca piana 4x8, Panca inclinata, Push-down' },
                { day: 'Giorno 2', session: 'Schiena & Bicipiti', exercises: 'Trazioni assistite, Rematore, Curl 4x10' },
                { day: 'Giorno 3', session: 'Gambe', exercises: 'Squat 4x10, Leg Press, Leg Curl, Calf' },
                { day: 'Giorno 4', session: 'Spalle & Core', exercises: 'Shoulder Press, Alzate laterali, Plank' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Petto', exercises: 'Panca piana 4x8, Incline, Croci, Dip' },
                { day: 'Giorno 2', session: 'Schiena', exercises: 'Trazioni, Rematore, Pulldown, Stacco' },
                { day: 'Giorno 3', session: 'Gambe', exercises: 'Squat, Leg Press, Affondi, Leg Curl' },
                { day: 'Giorno 4', session: 'Spalle & Trapezi', exercises: 'OHP, Alzate, Face Pull, Shrug' },
                { day: 'Giorno 5', session: 'Braccia & Core', exercises: 'Curl, Push-down, Hammer, Plank' }
            ]
        },
        intermediate: {
            3: [
                { day: 'Giorno 1', session: 'Push', exercises: 'Panca 4x8, OHP, Dip, Croci, Push-down' },
                { day: 'Giorno 2', session: 'Pull', exercises: 'Trazioni 4x8, Rematore, Curl, Face Pull' },
                { day: 'Giorno 3', session: 'Legs', exercises: 'Squat 4x8, Stacco rumeno, Leg Press, Calf' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Push', exercises: 'Panca inclinata, OHP, Dip pesato, French Press' },
                { day: 'Giorno 2', session: 'Pull', exercises: 'Trazioni pesate, Rematore bilanciere, Scott Curl' },
                { day: 'Giorno 3', session: 'Legs', exercises: 'Squat frontale, Stacco, Affondi, Leg Extension' },
                { day: 'Giorno 4', session: 'Arms & Shoulders', exercises: 'Arricchimento braccia e deltoidi' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Push heavy', exercises: 'Panca 5x5, OHP 3x8, Dip 4x10' },
                { day: 'Giorno 2', session: 'Pull heavy', exercises: 'Trazioni 5x5, Rematore 4x8, Curl' },
                { day: 'Giorno 3', session: 'Legs heavy', exercises: 'Squat 5x5, Stacco 4x6, Affondi' },
                { day: 'Giorno 4', session: 'Push accessory', exercises: 'Isolamento petto/spalle/tricipiti' },
                { day: 'Giorno 5', session: 'Pull accessory', exercises: 'Isolamento schiena/bicipiti/core' }
            ]
        },
        advanced: {
            3: [
                { day: 'Giorno 1', session: 'Push (progressivo)', exercises: 'Panca 5x5, Incline 4x8, Dip pesato' },
                { day: 'Giorno 2', session: 'Pull (progressivo)', exercises: 'Trazioni 5x5, Rematore 4x8, Shrug' },
                { day: 'Giorno 3', session: 'Legs (progressivo)', exercises: 'Squat 5x5, Stacco 1x5, Affondi, Calf' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Petto', exercises: 'Panca pesante, Incline, Dip, Fly' },
                { day: 'Giorno 2', session: 'Schiena', exercises: 'Stacco, Trazioni, Rematore, Pullover' },
                { day: 'Giorno 3', session: 'Gambe & Glutei', exercises: 'Squat, Hip Thrust, Stacco rumeno' },
                { day: 'Giorno 4', session: 'Spalle & Braccia', exercises: 'OHP, Alzate, Curl, Push-down' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Chest focus', exercises: 'Panca 6x6, Incline 4x8, Dip 4x10' },
                { day: 'Giorno 2', session: 'Back focus', exercises: 'Trazioni 6x6, Rematore, Face Pull' },
                { day: 'Giorno 3', session: 'Legs focus', exercises: 'Squat 6x6, Stacco, Leg Curl, Calf' },
                { day: 'Giorno 4', session: 'Shoulder focus', exercises: 'OHP 5x5, Alzate, Upright Row' },
                { day: 'Giorno 5', session: 'Arms & Abs', exercises: 'Curl, Push-down, Crunch, Hanging Leg Raise' }
            ]
        }
    },
    toning: {
        beginner: {
            3: [
                { day: 'Giorno 1', session: 'Full Body leggero', exercises: 'Squat, Push-up sulle ginocchia, Rematore, Plank' },
                { day: 'Giorno 2', session: 'Cardio & Core', exercises: 'Ellittica 25min, Crunch, Russian Twist' },
                { day: 'Giorno 3', session: 'Gambe & Glutei', exercises: 'Affondi, Hip Bridge, Leg curl, Cardio' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Lower Body', exercises: 'Squat, Affondi, Hip Thrust, Calf' },
                { day: 'Giorno 2', session: 'Upper Body', exercises: 'Push-up, Lat Machine, Rematore, Spalle' },
                { day: 'Giorno 3', session: 'Cardio', exercises: 'Cyclette 30min + Core' },
                { day: 'Giorno 4', session: 'Full Body', exercises: 'Circuito 30min, kettlebells, core' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Lower Body', exercises: 'Squat, Affondi, Hip Thrust, Step-up' },
                { day: 'Giorno 2', session: 'Upper Body', exercises: 'Push-up, Rematore, Press, Curl' },
                { day: 'Giorno 3', session: 'Cardio & Core', exercises: 'HIIT 25min, Plank, Leg Raise' },
                { day: 'Giorno 4', session: 'Full Body', exercises: 'Circuito funzionale completo' },
                { day: 'Giorno 5', session: 'Glutei & Cardio', exercises: 'Glutei multi-esercizio, Cardio 20min' }
            ]
        },
        intermediate: {
            3: [
                { day: 'Giorno 1', session: 'Legs & Glutes', exercises: 'Squat, Hip Thrust, Affondi, Kickback' },
                { day: 'Giorno 2', session: 'Upper Circuit', exercises: 'Circuito braccia/spalle/schiena' },
                { day: 'Giorno 3', session: 'Cardio & Core', exercises: 'HIIT 30min, Plank, Russian Twist' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Glutes focus', exercises: 'Hip Thrust, Bridge, Kickback, Abduction' },
                { day: 'Giorno 2', session: 'Upper Body', exercises: 'Push-up, Rematore, OHP, Curl' },
                { day: 'Giorno 3', session: 'Legs', exercises: 'Squat, Affondi, Step-up, Calf' },
                { day: 'Giorno 4', session: 'HIIT & Core', exercises: 'Tabata cardio, Addominali completi' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Glutes', exercises: 'Hip Thrust pesato, Kickback, Abduction' },
                { day: 'Giorno 2', session: 'Push', exercises: 'Push-up, Incline Press, Dip, Front Raise' },
                { day: 'Giorno 3', session: 'Pull', exercises: 'Lat Machine, Rematore, Face Pull, Curl' },
                { day: 'Giorno 4', session: 'Legs', exercises: 'Squat, Affondi, Leg Curl, Calf' },
                { day: 'Giorno 5', session: 'Full Body & Cardio', exercises: 'Circuito + HIIT finale' }
            ]
        },
        advanced: {
            3: [
                { day: 'Giorno 1', session: 'Legs & Glutes heavy', exercises: 'Squat, Hip Thrust, Bulgari, Abduction' },
                { day: 'Giorno 2', session: 'Upper body heavy', exercises: 'Panca, Rematore, OHP, Trazioni' },
                { day: 'Giorno 3', session: 'Full body cardio', exercises: 'CrossFit-lite, Battlerope, Burpee' }
            ],
            4: [
                { day: 'Giorno 1', session: 'Glute strength', exercises: 'Hip Thrust, Stacco rumeno, Bulgari' },
                { day: 'Giorno 2', session: 'Upper strength', exercises: 'Panca, Trazioni, Rematore, Dip' },
                { day: 'Giorno 3', session: 'Legs endurance', exercises: 'Circuito gambe ad alta ripetizioni' },
                { day: 'Giorno 4', session: 'Core & Cardio', exercises: 'Plank variazione, HIIT sprint' }
            ],
            5: [
                { day: 'Giorno 1', session: 'Glute intensive', exercises: 'Hip Thrust, Kickback, Abduction pesate' },
                { day: 'Giorno 2', session: 'Push', exercises: 'Panca, OHP, Dip, Push-up esplosivo' },
                { day: 'Giorno 3', session: 'Pull', exercises: 'Trazioni, Rematore, Face Pull, Curl' },
                { day: 'Giorno 4', session: 'Legs', exercises: 'Squat, Affondi, Step-up, Calf' },
                { day: 'Giorno 5', session: 'Metabolic', exercises: 'CrossFit WOD, Burpee, Kettlebell' }
            ]
        }
    }
};

// Database piani alimentari
const dietPlans = {
    loss: {
        beginner: '🥗 Dieta per Perdita di Peso (Principiante)',
        intermediate: '🥗 Dieta per Perdita di Peso (Intermedio)',
        advanced: '🥗 Dieta per Perdita di Peso (Avanzato)'
    },
    muscle: {
        beginner: '💪 Dieta per Massa Muscolare (Principiante)',
        intermediate: '💪 Dieta per Massa Muscolare (Intermedio)',
        advanced: '💪 Dieta per Massa Muscolare (Avanzato)'
    },
    toning: {
        beginner: '✨ Dieta per Tonificazione (Principiante)',
        intermediate: '✨ Dieta per Tonificazione (Intermedio)',
        advanced: '✨ Dieta per Tonificazione (Avanzato)'
    }
};

// Dettagli dei piani alimentari
const dietDetails = {
    loss: [
        { meal: 'Colazione', food: 'Yogurt greco magro, frutta fresca, tè verde' },
        { meal: 'Spuntino', food: 'Mela e mandorle (10g)' },
        { meal: 'Pranzo', food: 'Petto di pollo alla griglia, verdure, riso integrale (60g)' },
        { meal: 'Spuntino', food: 'Frutta e proteine in polvere' },
        { meal: 'Cena', food: 'Salmone o verdure proteiche, insalata mista' }
    ],
    muscle: [
        { meal: 'Colazione', food: 'Fiocchi d\'avena, banana, proteine whey, uova' },
        { meal: 'Spuntino', food: 'Pane integrale con burro d\'arachidi' },
        { meal: 'Pranzo', food: 'Pasta integrale ai frutti di mare, petto di pollo' },
        { meal: 'Spuntino', food: 'Yogurt greco, noci e miele' },
        { meal: 'Cena', food: 'Bistecca magra, patate dolci, broccoli' }
    ],
    toning: [
        { meal: 'Colazione', food: 'Omelette di albumi, pane integrale, frutta' },
        { meal: 'Spuntino', food: 'Frullato proteico con verdure' },
        { meal: 'Pranzo', food: 'Tacchino, quinoa, insalata, pomodori' },
        { meal: 'Spuntino', food: 'Ricotta magra con frutti di bosco' },
        { meal: 'Cena', food: 'Pesce bianco, verdure grigliate, avocado' }
    ]
};

// Aggiungi consigli nutrizionali specifici per livello
const levelTips = {
    beginner: 'Inizia gradualmente con porzioni controllate e molti liquidi.',
    intermediate: 'Mantieni un deficit/surplus moderato e monitora i progressi.',
    advanced: 'Pianifica i macronutrienti con precisione e periodizzazione.'
};

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const plan = document.getElementById('plan').value;
    const goal = document.getElementById('goal').value;
    const level = document.getElementById('level').value;
    const days = document.getElementById('days').value;

    if (name && email && phone && goal && level && days) {
        generatePlan(name, goal, level, days, plan);
        document.getElementById('planResult').style.display = 'block';
        document.getElementById('planResult').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Per favore compila tutti i campi, incluso obiettivo, livello e giorni.');
    }
});

function generatePlan(name, goal, level, days, plan) {
    const workout = workoutPlans[goal][level][days] || workoutPlans[goal][level][3];
    
    let workoutHTML = `<h5>Piano di ${name}</h5><p class="plan-meta">🎯 Obiettivo: ${getGoalLabel(goal)} | 📊 Livello: ${getLevelLabel(level)} | 📅 ${days} giorni/settimana</p>`;
    workoutHTML += '<table class="plan-table"><thead><tr><th>Giorno</th><th>Focus</th><th>Esercizi</th></tr></thead><tbody>';
    workout.forEach(item => {
        workoutHTML += `<tr><td>${item.day}</td><td>${item.session}</td><td>${item.exercises}</td></tr>`;
    });
    workoutHTML += '</tbody></table>';

    const dietType = goal;
    let dietHTML = `<h5>${dietPlans[goal][level]}</h5><p class="plan-meta">💡 Consiglio: ${levelTips[level]}</p>`;
    dietHTML += '<table class="plan-table"><thead><tr><th>Pasto</th><th>Cosa Mangiare</th></tr></thead><tbody>';
    dietDetails[dietType].forEach(item => {
        dietHTML += `<tr><td>${item.meal}</td><td>${item.food}</td></tr>`;
    });
    dietHTML += '</tbody></table>';

    if (plan) {
        const planLabels = { base: 'Base', pro: 'Pro', elite: 'Elite' };
        dietHTML += `<p class="plan-meta">💳 Abbonamento incluso: ${planLabels[plan] || plan}</p>`;
    }

    document.getElementById('workoutPlan').innerHTML = workoutHTML;
    document.getElementById('dietPlan').innerHTML = dietHTML;
}

function getGoalLabel(goal) {
    const labels = { loss: 'Perdita di peso', muscle: 'Massa muscolare', toning: 'Tonificazione' };
    return labels[goal] || goal;
}

function getLevelLabel(level) {
    const labels = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzato' };
    return labels[level] || level;
}

// Stampa
function printPlan() {
    window.print();
}

// Reset
function resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('planResult').style.display = 'none';
    document.getElementById('contatti').scrollIntoView({ behavior: 'smooth' });
}


// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.8)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Reveal animation on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.program-card, .price-card, .gallery-item, .schedule-row').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// Lightbox per la galleria
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        lightbox.addEventListener('click', () => lightbox.remove());
        document.body.appendChild(lightbox);
    });
});
