class UxuiGame {
    constructor() {
        this.container = null;
        this.levelIndex = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.friction = 3;
        this.brandScore = 0;
    }

    levels() {
        return [
            { name: 'Путь пользователя', desc: 'Собери маршрут без боли: на каждом шаге выбери лучший фикс. Перебор повышает «трение».', time: 70 },
            { name: 'Дизайн-система', desc: 'Привяжи токены и доведи отступы/радиус до гайдлайна. Должно быть консистентно.', time: 70 },
            { name: 'A11y + текст', desc: 'Исправь контраст, alt и фокус. Перепиши текст по-человечески.', time: 70 }
        ];
    }

    start(container) {
        this.container = container;
        this.renderIntro();
    }

    formatSteps() {
        return this.levels().map((_, idx) => {
            const classes = [
                idx === this.levelIndex ? 'active' : '',
                idx < this.levelIndex ? 'done' : ''
            ].join(' ').trim();
            return `<div class="mini-step-dot ${classes}"></div>`;
        }).join('');
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    startTimer(onFail) {
        const timerEl = this.container.querySelector('.mini-timer span');
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (timerEl) timerEl.textContent = this.formatTime(this.timeLeft);
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                onFail();
            }
        }, 1000);
    }

    renderIntro() {
        this.container.innerHTML = `
            <div class="mini-game">
                <div class="mini-card-surface" style="text-align:center;">
                    <div class="mini-steps" style="justify-content:center;">${this.formatSteps()}</div>
                    <h3 style="margin:10px 0 6px 0;">UX/UI: сделай просто и удобно</h3>
                    <p style="color:#4b5563; max-width:720px; margin:0 auto 16px;">Ты увидишь классический путь: убери трение, привяжи токены и подтяни доступность/тексты. Всё кликами.</p>
                    <button class="mini-btn" id="uxStart">Начать</button>
                </div>
            </div>
        `;
        this.container.querySelector('#uxStart').addEventListener('click', () => this.startLevel(0));
    }

    startLevel(idx) {
        this.levelIndex = idx;
        const level = this.levels()[idx];
        this.timeLeft = level.time;
        this.friction = 3;
        this.brandScore = 0;

        if (idx === 0) this.renderLevel1(level);
        if (idx === 1) this.renderLevel2(level);
        if (idx === 2) this.renderLevel3(level);

        this.startTimer(() => this.fail());
    }

    header(level, right = '') {
        return `
            <div class="mini-level-header">
                <div class="mini-level-info">
                    <div class="mini-steps">${this.formatSteps()}</div>
                    <h3>${level.name}</h3>
                    <p>${level.desc}</p>
                </div>
                <div class="mini-inline" style="gap:10px; flex-wrap:wrap;">
                    ${right}
                    <div class="mini-timer"><i class="fa-regular fa-clock"></i> <span>${this.formatTime(level.time)}</span></div>
                </div>
            </div>
        `;
    }

    renderLevel1(level) {
        const steps = [
            { q: 'Логин: кнопка мелкая', best: 'Увеличить до 48px и добавить иконку' },
            { q: 'Каталог: лишний шаг фильтра', best: 'Спрятать продвинутые фильтры под «Ещё»' },
            { q: 'Оплата: поле CVV без подсказки', best: 'Показать пример и маску' },
            { q: 'Уведомления: непонятный текст', best: 'Писать «Заказ оплачен. Доставка завтра.»' },
            { q: 'Личный кабинет: пусто', best: 'Показать заглушку с CTA' }
        ];

        const cards = steps.map((s, idx) => `
            <div class="mini-card-surface">
                <div class="mini-section-title">Шаг ${idx + 1}</div>
                <p style="font-weight:700; color:#0f172a;">${s.q}</p>
                <div class="mini-options">
                    ${[
                        s.best,
                        'Оставить как есть',
                        'Убрать кнопку совсем'
                    ].sort(() => Math.random() - 0.5).map(opt => `
                        <button class="mini-option-btn" data-correct="${opt === s.best}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `).join('');

        const frictionPill = `<div class="mini-pill" id="uxFriction">Трение: ${this.friction}</div>`;

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, frictionPill)}
                <div class="mini-columns">
                    ${cards}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.mini-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('done')) return;
                const correct = btn.dataset.correct === 'true';
                if (correct) {
                    btn.classList.add('correct', 'done');
                } else {
                    this.friction = Math.max(0, this.friction - 1);
                    btn.classList.add('wrong', 'done');
                    this.updateFriction();
                    if (this.friction === 0) return this.fail();
                }
                const parent = btn.closest('.mini-card-surface');
                parent.querySelectorAll('.mini-option-btn').forEach(b => b.disabled = true);
                this.checkLevel1();
            });
        });
    }

    updateFriction() {
        const pill = this.container.querySelector('#uxFriction');
        if (pill) pill.textContent = `Трение: ${this.friction}`;
    }

    checkLevel1() {
        const answered = this.container.querySelectorAll('.mini-option-btn.done').length;
        const total = this.container.querySelectorAll('.mini-option-btn').length;
        const correct = this.container.querySelectorAll('.mini-option-btn.correct').length;
        if (answered === total && correct >= 4) this.levelComplete();
    }

    renderLevel2(level) {
        const tokens = [
            { label: 'Primary 600', accept: 'color' },
            { label: 'Radius 12px', accept: 'radius' },
            { label: 'Shadow Soft', accept: 'shadow' },
            { label: 'Text 16px', accept: 'font' }
        ];
        const cards = tokens.sort(() => Math.random() - 0.5).map(t => `
            <div class="mini-drag-card" draggable="true" data-token="${t.accept}">
                ${t.label}
                <span class="mini-pill">Токен</span>
            </div>
        `).join('');
        const targets = [
            { label: 'Кнопка CTA', accept: 'color' },
            { label: 'Карточка', accept: 'shadow' },
            { label: 'Модалка', accept: 'radius' },
            { label: 'Список', accept: 'font' }
        ].map(t => `<div class="mini-drop-zone" data-accept="${t.accept}">${t.label}</div>`).join('');

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="uxBrand">Консистентность: 0/4</div>`)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Токены</div>
                        <div class="mini-checklist" id="uxTokens">${cards}</div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Компоненты</div>
                        <div class="mini-checklist" id="uxTargets">${targets}</div>
                        <div style="margin-top:16px;">
                            <label>Отступы (нужно 12–20px)
                                <input type="range" min="8" max="28" value="10" class="mini-slider" id="uxSpacing">
                            </label>
                            <label>Радиус (нужно 10–16px)
                                <input type="range" min="6" max="22" value="8" class="mini-slider" id="uxRadius">
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindDrag('#uxTokens .mini-drag-card', '#uxTargets .mini-drop-zone', () => {
            this.brandScore = this.container.querySelectorAll('#uxTargets .filled').length;
            this.updateBrand();
            this.checkLevel2();
        });

        ['uxSpacing', 'uxRadius'].forEach(id => {
            this.container.querySelector(`#${id}`).addEventListener('input', () => {
                this.checkLevel2();
            });
        });
    }

    bindDrag(cardSelector, dropSelector, onCheck) {
        const cards = this.container.querySelectorAll(cardSelector);
        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', card.dataset.token);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });

        this.container.querySelectorAll(dropSelector).forEach(drop => {
            drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('hovered'); });
            drop.addEventListener('dragleave', () => drop.classList.remove('hovered'));
            drop.addEventListener('drop', e => {
                e.preventDefault();
                drop.classList.remove('hovered');
                const token = e.dataTransfer.getData('text/plain');
                if (token === drop.dataset.accept && !drop.classList.contains('filled')) {
                    drop.classList.add('filled');
                    drop.textContent = `${drop.textContent.trim()} — ${token}`;
                    const card = Array.from(cards).find(c => c.dataset.token === token);
                    if (card) card.remove();
                    onCheck();
                } else {
                    drop.classList.add('wrong');
                    setTimeout(() => drop.classList.remove('wrong'), 600);
                }
            });
        });
    }

    updateBrand() {
        const pill = this.container.querySelector('#uxBrand');
        if (pill) pill.textContent = `Консистентность: ${this.brandScore}/4`;
    }

    checkLevel2() {
        const spacing = parseInt(this.container.querySelector('#uxSpacing').value, 10);
        const radius = parseInt(this.container.querySelector('#uxRadius').value, 10);
        const spacingOk = spacing >= 12 && spacing <= 20;
        const radiusOk = radius >= 10 && radius <= 16;
        const tokenOk = this.container.querySelectorAll('#uxTargets .filled').length === 4;
        if (tokenOk && spacingOk && radiusOk) this.levelComplete();
    }

    renderLevel3(level) {
        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Доступность</div>
                        <div class="mini-checklist">
                            <label class="mini-check-item" id="uxAlt"><input type="checkbox"> Alt для картинок</label>
                            <label class="mini-check-item" id="uxFocus"><input type="checkbox"> Фокус-стиль включен</label>
                        </div>
                        <p style="margin-top:10px;">Контраст текста/фона: отрегулируй светлоту.</p>
                        <input type="range" min="20" max="90" value="40" class="mini-slider" id="uxContrastSlider">
                        <div class="mini-stat"><span>Контраст</span><strong id="uxRatio">3.0</strong></div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Тексты</div>
                        <p style="color:#4b5563;">Было: "Осуществите подтверждение операции". Напиши проще и короче.</p>
                        <textarea class="mini-textarea" id="uxCopy" placeholder="Например: Нажмите «Подтвердить», и платёж пройдёт."></textarea>
                        <div class="mini-tags" id="uxStatus"></div>
                    </div>
                </div>
            </div>
        `;

        ['uxAlt', 'uxFocus'].forEach(id => {
            const row = this.container.querySelector(`#${id}`);
            row.addEventListener('change', () => {
                row.classList.toggle('done', row.querySelector('input').checked);
                this.checkLevel3();
            });
        });

        const slider = this.container.querySelector('#uxContrastSlider');
        slider.addEventListener('input', () => {
            const bgLight = 96;
            const textLight = parseInt(slider.value, 10);
            const ratio = this.luminanceRatio(bgLight, textLight);
            this.container.querySelector('#uxRatio').textContent = ratio.toFixed(1);
            this.checkLevel3();
        });
        this.container.querySelector('#uxCopy').addEventListener('input', () => this.checkLevel3());
        slider.dispatchEvent(new Event('input'));
    }

    luminanceRatio(bg, text) {
        const l1 = (bg + 0.05) / 100;
        const l2 = (text + 0.05) / 100;
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return lighter / darker * 4; // простая псевдо-оценка для наглядности
    }

    checkLevel3() {
        const checksOk = ['uxAlt', 'uxFocus'].every(id => {
            const row = this.container.querySelector(`#${id}`);
            return row && row.querySelector('input').checked;
        });
        const ratio = parseFloat(this.container.querySelector('#uxRatio').textContent);
        const text = this.container.querySelector('#uxCopy').value.trim();
        const textOk = text.length >= 18 && text.length <= 120;
        const ready = checksOk && ratio >= 4.5 && textOk;
        const status = this.container.querySelector('#uxStatus');
        status.textContent = ready ? 'Готово: контраст, alt, фокус и ясный текст.' : 'Дотяни контраст ≥ 4.5, включи alt/фокус и перепиши текст.';
        if (ready) this.levelComplete();
    }

    levelComplete() {
        clearInterval(this.timer);
        if (this.levelIndex < this.levels().length - 1) {
            this.overlay(true, 'Шаг закрыт! Идём дальше.', 'Дальше', () => this.startLevel(this.levelIndex + 1));
        } else {
            this.overlay(true, 'UX/UI-трек пройден: путь понятный, система единая, доступность на месте.', 'Вернуться к выбору', () => {
                const back = document.getElementById('backToGrid');
                back ? back.click() : window.location.reload();
            });
        }
    }

    fail() {
        clearInterval(this.timer);
        this.overlay(false, 'Трение выросло или время вышло. Попробуем ещё раз.', 'Перезапустить', () => this.startLevel(0));
    }

    overlay(success, text, btnText, action) {
        const wrap = document.createElement('div');
        wrap.className = 'mini-overlay';
        wrap.innerHTML = `
            <div class="mini-overlay-content">
                <h3>${success ? 'Готово' : 'Не успели'}</h3>
                <p>${text}</p>
                <button class="mini-btn" id="uxOverlayBtn">${btnText}</button>
            </div>
        `;
        this.container.appendChild(wrap);
        wrap.querySelector('#uxOverlayBtn').addEventListener('click', () => {
            wrap.remove();
            action();
        });
    }
}

window.UxuiGame = UxuiGame;
