class PmGame {
    constructor() {
        this.container = null;
        this.levelIndex = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.health = 3;
        this.riskDebt = 0;
        this.feedInterval = null;
    }

    levels() {
        return [
            { name: 'Груминг + риски', desc: 'Разложи задачи по MoSCoW, учитывая риск и импакт.', time: 70 },
            { name: 'Планирование спринта', desc: 'Собери спринт: 10–14 sp и суммарный риск ≤ 7.', time: 75 },
            { name: 'Инцидент-колл', desc: 'Выбирай правильные шаги, сохраняя SLA. 3 ошибки — провал.', time: 80 }
        ];
    }

    start(container) {
        this.container = container;
        this.renderIntro();
    }

    formatSteps() {
        return this.levels().map((_, idx) => {
            const cls = [
                idx === this.levelIndex ? 'active' : '',
                idx < this.levelIndex ? 'done' : ''
            ].join(' ').trim();
            return `<div class="mini-step-dot ${cls}"></div>`;
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
                    <h3 style="margin:10px 0 6px 0;">Project Manager: почувствуй ритм</h3>
                    <p style="color:#4b5563; max-width:720px; margin:0 auto 16px;">Приоритизируй задачи, уложись в capacity и отработай инцидент. Чуть сложнее кликов — но понятно новичку.</p>
                    <button class="mini-btn" id="pmStart">Начать</button>
                </div>
            </div>
        `;
        this.container.querySelector('#pmStart').addEventListener('click', () => this.startLevel(0));
    }

    startLevel(idx) {
        this.levelIndex = idx;
        const level = this.levels()[idx];
        this.timeLeft = level.time;
        this.health = 3;
        this.riskDebt = 0;
        if (this.feedInterval) clearInterval(this.feedInterval);

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
        const tasks = [
            { text: 'Оплата падает у 5% пользователей', target: 'must', risk: 2, impact: 8 },
            { text: 'Отчёт в личном кабинете', target: 'should', risk: 2, impact: 5 },
            { text: 'Сменить иконку профиля', target: 'could', risk: 1, impact: 1 },
            { text: 'Темная тема', target: 'could', risk: 2, impact: 3 },
            { text: 'Нагрузка API', target: 'must', risk: 3, impact: 7 },
            { text: 'Пуши на андроид', target: 'should', risk: 2, impact: 4 }
        ];

        const cards = tasks.map(t => `
            <div class="mini-drag-card" draggable="true" data-target="${t.target}" data-risk="${t.risk}" data-impact="${t.impact}">
                ${t.text}
                <span class="mini-pill">${t.target}</span>
                <span class="mini-pill">Риск ${t.risk}</span>
                <span class="mini-pill">Импакт ${t.impact}</span>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="pmScore">Импакт must+should: 0</div>`)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Карточки задач</div>
                        <div class="mini-checklist" id="pmTasks">${cards}</div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">MoSCoW</div>
                        <div class="mini-body-grid">
                            <div class="mini-drop-zone" data-bucket="must">Must</div>
                            <div class="mini-drop-zone" data-bucket="should">Should</div>
                            <div class="mini-drop-zone" data-bucket="could">Could</div>
                        </div>
                        <p style="margin-top:8px; color:#4b5563;">Цель: суммарный импакт Must+Should ≥ 15, и не больше 2 задач в Must.</p>
                    </div>
                </div>
            </div>
        `;

        this.bindDrag('#pmTasks .mini-drag-card', '.mini-drop-zone[data-bucket]', (card, drop) => {
            if (card.dataset.target === drop.dataset.bucket) {
                drop.appendChild(card);
                card.draggable = false;
                this.updateScoreLevel1();
                return true;
            }
            return false;
        });
    }

    updateScoreLevel1() {
        let impact = 0;
        const mustCount = this.container.querySelectorAll('[data-bucket="must"] .mini-drag-card').length;
        ['must', 'should'].forEach(bucket => {
            this.container.querySelectorAll(`[data-bucket="${bucket}"] .mini-drag-card`).forEach(card => {
                impact += parseInt(card.dataset.impact, 10);
            });
        });
        const pill = this.container.querySelector('#pmScore');
        if (pill) pill.textContent = `Импакт must+should: ${impact}`;
        if (impact >= 15 && mustCount <= 2 && this.container.querySelectorAll('.mini-drag-card[draggable]').length === 0) {
            this.levelComplete();
        }
    }

    bindDrag(cardSelector, dropSelector, onDropCheck) {
        const cards = this.container.querySelectorAll(cardSelector);
        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', '');
                PmGame.currentDrag = card;
            });
        });

        this.container.querySelectorAll(dropSelector).forEach(drop => {
            drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('hovered'); });
            drop.addEventListener('dragleave', () => drop.classList.remove('hovered'));
            drop.addEventListener('drop', e => {
                e.preventDefault();
                drop.classList.remove('hovered');
                const card = PmGame.currentDrag;
                if (!card) return;
                const ok = onDropCheck(card, drop);
                if (!ok) {
                    drop.classList.add('wrong');
                    setTimeout(() => drop.classList.remove('wrong'), 600);
                }
                PmGame.currentDrag = null;
            });
        });
    }

    renderLevel2(level) {
        const tasks = [
            { text: 'Фикс авторизации', points: 5, risk: 2 },
            { text: 'Отчёт в личном кабинете', points: 3, risk: 1 },
            { text: 'Нагрузка API', points: 8, risk: 4 },
            { text: 'Новые пуши', points: 2, risk: 1 },
            { text: 'Рефакторинг биллинга', points: 6, risk: 3 }
        ];

        const cards = tasks.map(t => `
            <div class="mini-drag-card" draggable="true" data-points="${t.points}" data-risk="${t.risk}">
                ${t.text}
                <span class="mini-pill">${t.points} sp</span>
                <span class="mini-pill">Риск ${t.risk}</span>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="pmRisk">Риск: 0</div>`)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Бэклог</div>
                        <div class="mini-checklist" id="pmBacklog">${cards}</div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Спринт (10–14 sp, риск ≤ 7)</div>
                        <div class="mini-checklist" id="pmSprint"></div>
                        <div class="mini-stat"><span>Сумма</span><strong id="pmSum">0 sp</strong></div>
                        <p id="pmHint" style="margin-top:8px; color:#4b5563;">Перетаскивай карточки. Риск считаетcя суммой.</p>
                    </div>
                </div>
            </div>
        `;

        this.bindDrag('#pmBacklog .mini-drag-card, #pmSprint .mini-drag-card', '#pmBacklog, #pmSprint', (card, drop) => {
            drop.appendChild(card);
            this.updateLevel2();
            return true;
        });
        this.updateLevel2();
    }

    updateLevel2() {
        const sum = Array.from(this.container.querySelectorAll('#pmSprint .mini-drag-card'))
            .reduce((acc, card) => acc + parseInt(card.dataset.points, 10), 0);
        const risk = Array.from(this.container.querySelectorAll('#pmSprint .mini-drag-card'))
            .reduce((acc, card) => acc + parseInt(card.dataset.risk, 10), 0);
        this.container.querySelector('#pmSum').textContent = `${sum} sp`;
        const hint = this.container.querySelector('#pmHint');
        const riskPill = this.container.querySelector('#pmRisk');
        if (riskPill) riskPill.textContent = `Риск: ${risk}`;
        const ok = sum >= 10 && sum <= 14 && risk <= 7;
        hint.textContent = ok ? 'Отлично: capacity и риски в норме.' : 'Собери 10–14 sp и риск ≤ 7.';
        hint.style.color = ok ? '#10b981' : '#4b5563';
        if (ok) this.levelComplete();
    }

    renderLevel3(level) {
        const steps = [
            {
                q: 'Сервис упал после релиза. Первое действие?',
                options: ['Роллбек/выключить фичу', 'Искать виноватого', 'Ждать утра'],
                correct: 'Роллбек/выключить фичу'
            },
            {
                q: 'Нужно защитить клиентов, пока чиним. Что параллельно?',
                options: ['Добавить фича-флаг/канарейку', 'Отключить мониторинг', 'Писать отчёт прямо сейчас'],
                correct: 'Добавить фича-флаг/канарейку'
            },
            {
                q: 'После фикса что делаем?',
                options: ['Короткий отчёт + благодарность команде', 'Отключить алерты', 'Ничего'],
                correct: 'Короткий отчёт + благодарность команде'
            }
        ];

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="pmHealth">Ошибки: 0/3</div>`)}
                <div class="mini-card-surface" id="pmQuiz"></div>
            </div>
        `;

        this.renderQuiz(steps, 0);
    }

    renderQuiz(steps, idx) {
        const wrap = this.container.querySelector('#pmQuiz');
        const step = steps[idx];
        wrap.innerHTML = `
            <div class="mini-section-title">Шаг ${idx + 1} из ${steps.length}</div>
            <p style="font-weight:700; color:#111827;">${step.q}</p>
            <div class="mini-options">
                ${step.options.map(opt => `<button class="mini-option-btn" data-val="${opt}">${opt}</button>`).join('')}
            </div>
        `;

        wrap.querySelectorAll('.mini-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                if (val === step.correct) {
                    btn.classList.add('correct');
                    if (idx === steps.length - 1) {
                        this.levelComplete();
                    } else {
                        setTimeout(() => this.renderQuiz(steps, idx + 1), 400);
                    }
                } else {
                    btn.classList.add('wrong');
                    this.health -= 1;
                    this.updateHealth();
                    if (this.health <= 0) this.fail();
                }
            });
        });
    }

    updateHealth() {
        const pill = this.container.querySelector('#pmHealth');
        if (pill) pill.textContent = `Ошибки: ${3 - this.health}/3`;
    }

    levelComplete() {
        clearInterval(this.timer);
        if (this.feedInterval) clearInterval(this.feedInterval);
        if (this.levelIndex < this.levels().length - 1) {
            this.overlay(true, 'Готово! Следующий шаг.', 'Дальше', () => this.startLevel(this.levelIndex + 1));
        } else {
            this.overlay(true, 'PM трек пройден: приоритеты, спринт, инциденты.', 'Вернуться к выбору', () => {
                const back = document.getElementById('backToGrid');
                back ? back.click() : window.location.reload();
            });
        }
    }

    fail() {
        clearInterval(this.timer);
        if (this.feedInterval) clearInterval(this.feedInterval);
        this.overlay(false, 'Провал по времени/ошибкам. Попробуем ещё раз.', 'Перезапустить', () => this.startLevel(0));
    }

    overlay(success, text, btnText, action) {
        const ov = document.createElement('div');
        ov.className = 'mini-overlay';
        ov.innerHTML = `
            <div class="mini-overlay-content">
                <h3>${success ? 'Готово' : 'Не успели'}</h3>
                <p>${text}</p>
                <button class="mini-btn" id="pmOverlayBtn">${btnText}</button>
            </div>
        `;
        this.container.appendChild(ov);
        ov.querySelector('#pmOverlayBtn').addEventListener('click', () => {
            ov.remove();
            action();
        });
    }
}

window.PmGame = PmGame;
