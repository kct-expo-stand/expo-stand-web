class GameDevGame {
    constructor() {
        this.container = null;
        this.levelIndex = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.sequenceIndex = 0;
        this.mistakes = 0;
        this.liveInterval = null;
        this.stableSeconds = 0;

        this.levels = [
            {
                name: 'Пайплайн ассетов',
                desc: 'Собери правильный маршрут ассетов: графика, код, звук и сборка. 3 ошибки — и билд падает.',
                time: 60
            },
            {
                name: 'Держим FPS',
                desc: 'Регулируй ползунки. Нужно 12 секунд подряд: FPS 55–70 и багов ≤ 3.',
                time: 80
            },
            {
                name: 'Релиз на площадки',
                desc: 'Собери релиз: платформа → билд → подпись → загрузка. Перепутал — накапливаются «битые» билды.',
                time: 75
            }
        ];
    }

    start(container) {
        this.container = container;
        this.renderIntro();
    }

    formatSteps() {
        return this.levels.map((_, idx) => {
            const classes = [
                idx === this.levelIndex ? 'active' : '',
                idx < this.levelIndex ? 'done' : ''
            ].join(' ').trim();
            return `<div class="mini-step-dot ${classes}"></div>`;
        }).join('');
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
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
                    <h3 style="margin:12px 0 6px 0;">GameDev: мини-продакшн</h3>
                    <p style="color:#4b5563; max-width:720px; margin:0 auto 16px;">Собери пайплайн, удержи FPS в живой симуляции и выпусти билд без битых шагов. Без кода, только логика.</p>
                    <button class="mini-btn" id="gdStart">Поехали</button>
                </div>
            </div>
        `;
        this.container.querySelector('#gdStart').addEventListener('click', () => this.startLevel(0));
    }

    startLevel(idx) {
        this.levelIndex = idx;
        const level = this.levels[idx];
        this.timeLeft = level.time;
        this.mistakes = 0;
        this.sequenceIndex = 0;
        this.stableSeconds = 0;
        if (this.liveInterval) clearInterval(this.liveInterval);

        if (idx === 0) this.renderLevel1(level);
        if (idx === 1) this.renderLevel2(level);
        if (idx === 2) this.renderLevel3(level);

        this.startTimer(() => this.failOverlay());
    }

    renderHeader(level, extraRight = '') {
        return `
            <div class="mini-level-header">
                <div class="mini-level-info">
                    <div class="mini-steps">${this.formatSteps()}</div>
                    <h3>${level.name}</h3>
                    <p>${level.desc}</p>
                </div>
                <div class="mini-inline" style="gap:10px; flex-wrap:wrap;">
                    ${extraRight}
                    <div class="mini-timer"><i class="fa-regular fa-clock"></i> <span>${this.formatTime(level.time)}</span></div>
                </div>
            </div>
        `;
    }

    renderLevel1(level) {
        const modules = [
            { name: 'Текстуры → компрессия', lane: 'Графика' },
            { name: 'Mesh → оптимизация', lane: 'Графика' },
            { name: 'Скрипты → билд', lane: 'Код' },
            { name: 'Звук → нормализация', lane: 'Аудио' },
            { name: 'Сборка билда', lane: 'Сборка' },
            { name: 'Тест сцены', lane: 'Код' }
        ];
        const lanes = ['Графика', 'Код', 'Аудио', 'Сборка'];

        const cards = [...modules].sort(() => Math.random() - 0.5).map(m => `
            <div class="mini-drag-card" draggable="true" data-lane="${m.lane}">
                ${m.name}
                <span class="mini-pill">${m.lane}</span>
            </div>
        `).join('');

        const drops = lanes.map((lane, idx) => `
            <div class="mini-drop-zone" data-accept="${lane}">
                ${idx + 1}. ${lane}
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.renderHeader(level, `<div class="mini-pill" id="gdMistakes">Ошибки: 0/3</div>`)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Элементы пайплайна</div>
                        <div class="mini-checklist" id="gdCards">${cards}</div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Линии пайплайна</div>
                        <div class="mini-body-grid" id="gdDrops">
                            ${drops}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindDragDrop(
            '#gdCards .mini-drag-card',
            '#gdDrops .mini-drop-zone',
            (card, drop) => {
                if (card.dataset.lane === drop.dataset.accept && !drop.classList.contains('filled')) {
                    drop.classList.add('filled');
                    drop.appendChild(card);
                    card.draggable = false;
                    card.style.cursor = 'default';
                    this.checkLevel1(modules.length);
                    return true;
                }
                return false;
            }
        );
    }

    bindDragDrop(cardSelector, dropSelector, onCorrect) {
        const cards = this.container.querySelectorAll(cardSelector);
        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', '');
                GameDevGame.dragItem = card;
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
                const card = GameDevGame.dragItem;
                if (!card) return;
                const ok = onCorrect(card, drop);
                if (!ok) {
                    this.mistakes += 1;
                    drop.classList.add('wrong');
                    setTimeout(() => drop.classList.remove('wrong'), 600);
                    this.updateMistakes();
                    if (this.mistakes >= 3) this.failOverlay();
                }
                GameDevGame.dragItem = null;
            });
        });
    }

    updateMistakes() {
        const el = this.container.querySelector('#gdMistakes');
        if (el) el.textContent = `Ошибки: ${this.mistakes}/3`;
    }

    checkLevel1(total) {
        const placed = this.container.querySelectorAll('#gdDrops .mini-drag-card').length;
        if (placed === total) this.levelComplete();
    }

    renderLevel2(level) {
        this.container.innerHTML = `
            <div class="mini-game">
                ${this.renderHeader(level, `<div class="mini-pill" id="gdStable">Стабильно: 0/12 c</div>`)}
                <div class="mini-body-grid">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Регулируй нагрузку</div>
                        <label>Модели / полигоны
                            <input type="range" min="10" max="90" value="50" class="mini-slider" id="gdPoly">
                        </label>
                        <label>Эффекты / частицы
                            <input type="range" min="10" max="90" value="55" class="mini-slider" id="gdFx">
                        </label>
                        <label>AI / логика
                            <input type="range" min="10" max="90" value="45" class="mini-slider" id="gdAi">
                        </label>
                        <p style="color:#4b5563; margin-top:8px;">Нужен FPS 55–70 и багов ≤ 3 в течение 12 секунд подряд.</p>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Мониторинг в реальном времени</div>
                        <div class="mini-stat"><span>FPS</span><strong id="gdFps">120</strong></div>
                        <div class="mini-stat"><span>Баги</span><strong id="gdBugs">0</strong></div>
                        <div class="mini-meter">
                            <div class="mini-meter-fill" id="gdStableBar" style="width:0%;"></div>
                        </div>
                        <div class="mini-log" id="gdLog"></div>
                    </div>
                </div>
            </div>
        `;

        const sliders = ['gdPoly', 'gdFx', 'gdAi'].map(id => this.container.querySelector(`#${id}`));

        const simulate = () => {
            const poly = parseInt(sliders[0].value, 10);
            const fx = parseInt(sliders[1].value, 10);
            const ai = parseInt(sliders[2].value, 10);
            const fps = Math.max(20, Math.round(110 - poly * 0.4 - fx * 0.5 - ai * 0.25 + (Math.random() * 6 - 3)));
            const bugs = Math.max(0, Math.round((poly - 50) / 18 + (ai - 50) / 20 + (fx - 50) / 22 + Math.random() * 1.4));
            this.container.querySelector('#gdFps').textContent = `${fps}`;
            this.container.querySelector('#gdBugs').textContent = `${bugs}`;
            const ok = fps >= 55 && fps <= 70 && bugs <= 3;
            if (ok) {
                this.stableSeconds += 1;
            } else {
                this.stableSeconds = 0;
            }
            const percent = Math.min(100, (this.stableSeconds / 12) * 100);
            this.container.querySelector('#gdStableBar').style.width = `${percent}%`;
            const stableText = this.container.querySelector('#gdStable');
            if (stableText) stableText.textContent = `Стабильно: ${this.stableSeconds}/12 c`;
            this.log(`FPS: ${fps}, баги: ${bugs} — ${ok ? 'норма' : 'прыгает'}`);
            if (this.stableSeconds >= 12) this.levelComplete();
        };

        sliders.forEach(s => s.addEventListener('input', () => this.log('Ползунки обновлены — держи FPS.')));
        simulate();
        this.liveInterval = setInterval(simulate, 1000);
    }

    log(text) {
        const log = this.container.querySelector('#gdLog');
        if (!log) return;
        const line = document.createElement('div');
        line.textContent = text;
        log.prepend(line);
        const max = 6;
        while (log.children.length > max) log.removeChild(log.lastChild);
    }

    renderLevel3(level) {
        const sequence = ['android on', 'npm run build', 'sign release', 'upload'];
        const labels = {
            'android on': 'Включить Android',
            'npm run build': 'Собрать билд',
            'sign release': 'Подписать',
            upload: 'Загрузить'
        };
        this.sequenceIndex = 0;
        let broken = 0;

        const extra = `<div class="mini-pill" id="gdBroken">Битых билдов: 0/2</div>`;

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.renderHeader(level, extra)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Команды релиза</div>
                        <div class="mini-options" id="gdCmds">
                            ${Object.keys(labels).concat(['ios on', 'clean cache']).sort(() => Math.random() - 0.5).map(cmd => `
                                <button class="mini-option-btn" data-cmd="${cmd}">${labels[cmd] || cmd}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Лог</div>
                        <div class="mini-log" id="gdReleaseLog"></div>
                        <div class="mini-tags" id="gdReleaseProgress"></div>
                    </div>
                </div>
            </div>
        `;

        const progress = () => {
            const holder = this.container.querySelector('#gdReleaseProgress');
            holder.innerHTML = sequence.map((cmd, idx) => `
                <span class="mini-tag" style="background:${idx < this.sequenceIndex ? '#ecfdf3' : '#f1f5f9'}">${idx < this.sequenceIndex ? '✔ ' : ''}${labels[cmd]}</span>
            `).join('');
        };
        progress();

        this.container.querySelectorAll('#gdCmds .mini-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                const needed = sequence[this.sequenceIndex];
                if (cmd === needed) {
                    this.sequenceIndex += 1;
                    btn.classList.add('correct');
                    this.pushReleaseLog(`Ок: ${labels[cmd] || cmd}`);
                    progress();
                    if (this.sequenceIndex === sequence.length) this.levelComplete();
                } else {
                    broken += 1;
                    btn.classList.add('wrong');
                    this.pushReleaseLog(`Порядок нарушен: ${cmd}.`);
                    const b = this.container.querySelector('#gdBroken');
                    if (b) b.textContent = `Битых билдов: ${broken}/2`;
                    if (broken >= 2) this.failOverlay();
                }
            });
        });
    }

    pushReleaseLog(text) {
        const log = this.container.querySelector('#gdReleaseLog');
        if (!log) return;
        const line = document.createElement('div');
        line.textContent = text;
        log.prepend(line);
        while (log.children.length > 6) log.removeChild(log.lastChild);
    }

    levelComplete() {
        clearInterval(this.timer);
        if (this.liveInterval) clearInterval(this.liveInterval);
        if (this.levelIndex < this.levels.length - 1) {
            this.showOverlay(true, 'Готово! Следующий этап ближе к релизу.', 'Дальше', () => this.startLevel(this.levelIndex + 1));
        } else {
            this.showOverlay(true, 'Ты прошел GameDev-трек: пайплайн, оптимизация и релиз.', 'Вернуться к выбору', () => {
                const back = document.getElementById('backToGrid');
                back ? back.click() : window.location.reload();
            });
        }
    }

    failOverlay() {
        clearInterval(this.timer);
        if (this.liveInterval) clearInterval(this.liveInterval);
        this.showOverlay(false, 'Билд упал или время вышло. Попробуем заново.', 'Начать сначала', () => this.startLevel(0));
    }

    showOverlay(success, text, btnText, action) {
        const overlay = document.createElement('div');
        overlay.className = 'mini-overlay';
        overlay.innerHTML = `
            <div class="mini-overlay-content">
                <h3>${success ? 'Готово' : 'Не успели'}</h3>
                <p>${text}</p>
                <button class="mini-btn" id="gdOverlayBtn">${btnText}</button>
            </div>
        `;
        this.container.appendChild(overlay);
        overlay.querySelector('#gdOverlayBtn').addEventListener('click', () => {
            overlay.remove();
            action();
        });
    }
}

window.GameDevGame = GameDevGame;
