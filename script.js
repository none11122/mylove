// ====== НАСТРОЙКИ ТЕЛЕГРАМ-БОТА ======
const TELEGRAM_BOT_TOKEN = "8743308188:AAHoQLUdwone9M_knICzK7ZnDLTwl9tovAM";
const TELEGRAM_CHAT_ID   = "5037027845";
// ======================================

// -------- Плавающие сердечки --------
(function createHearts() {
    const bg = document.getElementById('heartsBg');
    if (!bg) return;
    const emojis = ['❤️', '💖', '💕', '💗', '💓', '🌸'];
    for (let i = 0; i < 25; i++) {
        const h = document.createElement('div');
        h.className = 'floating-heart';
        h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        h.style.left = Math.random() * 100 + 'vw';
        h.style.fontSize = (12 + Math.random() * 22) + 'px';
        h.style.animationDuration = (8 + Math.random() * 10) + 's';
        h.style.animationDelay = (Math.random() * 10) + 's';
        bg.appendChild(h);
    }
})();

// -------- Хелперы --------
function showStep(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('step' + n);
    if (el) el.classList.add('active');
}

function shakeAndBlink(el, blink = false) {
    el.classList.remove('wrong', 'blink');
    void el.offsetWidth; // reflow чтобы анимация перезапускалась
    el.classList.add('wrong');
    if (blink) {
        setTimeout(() => el.classList.add('blink'), 500);
        setTimeout(() => el.classList.remove('blink'), 1600);
    }
    setTimeout(() => el.classList.remove('wrong'), 1800);
}

// ================= ШАГ 1 =================
const step1Btn = document.querySelector('#step1 .check-btn');
const monthsSelect = document.getElementById('monthsSelect');

step1Btn.addEventListener('click', () => {
    const val = monthsSelect.value;
    if (!val) {
        shakeAndBlink(step1Btn);
        return;
    }
    if (val === '3') {
        step1Btn.classList.add('correct');
        step1Btn.disabled = true;
        monthsSelect.disabled = true;
        setTimeout(() => showStep(2), 700);
    } else {
        shakeAndBlink(step1Btn);
    }
});

// ================= ШАГ 2 =================
const placeOptions = document.getElementById('placeOptions');
const step2Btn = document.querySelector('#step2 .check-btn');
let selectedPlace = null;

placeOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;
    placeOptions.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPlace = btn.dataset.value;
    step2Btn.disabled = false;
});

step2Btn.addEventListener('click', () => {
    if (!selectedPlace) return;
    if (selectedPlace === 'Берёзовая роща') {
        const chosen = placeOptions.querySelector('.option-btn.selected');
        chosen.classList.add('correct');
        step2Btn.classList.add('correct');
        step2Btn.disabled = true;
        placeOptions.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
        setTimeout(() => showStep(3), 800);
    } else {
        const chosen = placeOptions.querySelector('.option-btn.selected');
        shakeAndBlink(chosen, true);
    }
});

// ================= ШАГ 3 =================
const heightInput = document.getElementById('heightInput');
const step3Btn = document.querySelector('#step3 .check-btn');

heightInput.addEventListener('input', () => {
    // оставляем только цифры
    heightInput.value = heightInput.value.replace(/\D/g, '');
});

step3Btn.addEventListener('click', () => {
    const val = heightInput.value.trim();
    if (!val) {
        shakeAndBlink(step3Btn);
        return;
    }
    if (val === '189') {
        step3Btn.classList.add('correct');
        step3Btn.disabled = true;
        heightInput.disabled = true;
        setTimeout(() => showStep(4), 700);
    } else {
        shakeAndBlink(step3Btn, true);
    }
});

// ================= ШАГ 4 (отправка в Telegram) =================
const sendBtn = document.getElementById('sendBtn');
const loveMessage = document.getElementById('loveMessage');
const sendStatus = document.getElementById('sendStatus');

sendBtn.addEventListener('click', async () => {
    stopMusic();
    const text = loveMessage.value.trim();
    if (!text) {
        sendStatus.textContent = 'Напиши хоть что-нибудь 💌';
        sendStatus.classList.add('error');
        return;
    }

    sendBtn.disabled = true;
    sendStatus.classList.remove('error');
    sendStatus.textContent = 'Отправляю...';

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: `💌 Сообщение от любимой:\n\n${text}`
            })
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.description || 'Ошибка Telegram');

        sendStatus.textContent = 'Отправлено ❤️';
        sendStatus.classList.remove('error');
        loveMessage.disabled = true;
        sendBtn.classList.add('correct');

        setTimeout(() => {
            showStep(5);
            startVideo();
        }, 900);
    } catch (err) {
        console.error(err);
        sendStatus.textContent = 'Не удалось отправить 😢 Попробуй ещё раз.';
        sendStatus.classList.add('error');
        sendBtn.disabled = false;
    }
});

// ================= ШАГ 5 (видео) =================
const finalVideo = document.getElementById('finalVideo');
let videoEnded = false;

function startVideo() {
    finalVideo.currentTime = 0;
    const playPromise = finalVideo.play();
    if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
            // автоплей может быть заблокирован — просто ждём клика
            finalVideo.controls = true;
        });
    }
}

finalVideo.addEventListener('ended', () => {
    if (videoEnded) return;
    videoEnded = true;
    showStep(6);
});

// Если видео не загрузилось / нет файла — даём кнопку "дальше" через 3 сек
finalVideo.addEventListener('error', () => {
    setTimeout(() => showStep(6), 1500);
});

// ================= ШАГ 6 =================
document.getElementById('yesBtn').addEventListener('click', () => showStep(7));
document.getElementById('noBtn').addEventListener('click', () => showStep(7));
// ================= ФОНОВАЯ МУЗЫКА =================
const bgMusic = document.getElementById('bgMusic');

let musicStarted = false;

function tryStartMusic() {
    if (musicStarted || !bgMusic) return;
    bgMusic.volume = 0.5; // громкость 0..1 — можешь поменять
    const p = bgMusic.play();
    if (p && p.catch) {
        p.then(() => {
            musicStarted = true;
            removeStartListeners();
        }).catch(() => {
            // браузер ещё не разрешает — попробуем на следующее действие
        });
    }
}

function removeStartListeners() {
    document.removeEventListener('click', tryStartMusic);
    document.removeEventListener('touchstart', tryStartMusic);
    document.removeEventListener('keydown', tryStartMusic);
    document.removeEventListener('mousemove', tryStartMusic);
}

// Запускаем музыку при первом действии пользователя
document.addEventListener('click', tryStartMusic);
document.addEventListener('touchstart', tryStartMusic);
document.addEventListener('keydown', tryStartMusic);
document.addEventListener('mousemove', tryStartMusic);

// Пытаемся сразу (вдруг браузер разрешит)
tryStartMusic();

// Функция выключения музыки (используется при отправке)
function stopMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    musicStarted = false;
}