class SysAdminGame {
    constructor() {
        this.container = null;
        this.levelIndex = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.sequenceIndex = 0;
        this.mistakes = 0;
        this.feedInterval = null;
        this.handled = 0;
    }

    levels() {
        return [
            { name: 'Сетевой маршрут', desc: 'Собери путь: Пользователь → Firewall → App → База. 3 ошибки — и маршрут падает.', time: 60 },
            { name: 'Мониторинг в потоке', desc: 'Обрабатывай алерты пока SLA не упал. 8 правильных ответов подряд — победа.', time: 80 },
            { name: 'Безопасность', desc: 'Закрой дыру: последовательность команд и порты. Ошибка сбрасывает прогресс.', time: 75 }
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
                    <h3 style="margin:10px 0 6px 0;">SysAdmin: живой стендап</h3>
                    <p style="color:#4b5563; max-width:720px; margin:0 auto 16px;">Собери маршрут, жми правильные runbook на лету и закрой уязвимость последовательностью команд.</p>
                    <button class="mini-btn" id="saStart">Старт</button>
                </div>
            </div>
        `;
        this.container.querySelector('#saStart').addEventListener('click', () => this.startLevel(0));
    }

    startLevel(idx) {
        this.levelIndex = idx;
        const level = this.levels()[idx];
        this.timeLeft = level.time;
        this.sequenceIndex = 0;
        this.mistakes = 0;
        this.handled = 0;
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
        const stages = ['Пользователь', 'Firewall', 'App-сервер', 'База данных'];
        const cards = [...stages].sort(() => Math.random() - 0.5).map(s => `
            <div class="mini-drag-card" draggable="true" data-val="${s}">
                ${s}
                <span class="mini-pill">Перетащи</span>
            </div>
        `).join('');

        const drops = stages.map((s, i) => `<div class="mini-drop-zone" data-accept="${s}">${i + 1}. Узел</div>`).join('');

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="saMistakes">Ошибки: 0/3</div>`)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Узлы</div>
                        <div class="mini-checklist" id="saNodes">${cards}</div>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Маршрут трафика</div>
                        <div class="mini-checklist" id="saRoute">${drops}</div>
                    </div>
                </div>
            </div>
        `;

        this.bindDrag('#saNodes .mini-drag-card', '#saRoute .mini-drop-zone', () => {
            const filled = this.container.querySelectorAll('#saRoute .mini-drop-zone.filled').length;
            if (filled === stages.length) this.levelComplete();
        });
    }

    bindDrag(cardSelector, dropSelector, onCheck) {
        const cards = this.container.querySelectorAll(cardSelector);
        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', card.dataset.val);
                SysAdminGame.dragItem = card;
            });
        });

        this.container.querySelectorAll(dropSelector).forEach(drop => {
            drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('hovered'); });
            drop.addEventListener('dragleave', () => drop.classList.remove('hovered'));
            drop.addEventListener('drop', e => {
                e.preventDefault();
                drop.classList.remove('hovered');
                const val = SysAdminGame.dragItem ? SysAdminGame.dragItem.dataset.val : null;
                if (val === drop.dataset.accept && !drop.classList.contains('filled')) {
                    drop.classList.add('filled');
                    drop.textContent = val;
                    if (SysAdminGame.dragItem) SysAdminGame.dragItem.remove();
                    onCheck();
                } else {
                    this.mistakes += 1;
                    const pill = this.container.querySelector('#saMistakes');
                    if (pill) pill.textContent = `Ошибки: ${this.mistakes}/3`;
                    drop.classList.add('wrong');
                    setTimeout(() => drop.classList.remove('wrong'), 600);
                    if (this.mistakes >= 3) this.fail();
                }
                SysAdminGame.dragItem = null;
            });
        });
    }

    renderLevel2(level) {
        const events = [
            { text: 'CPU 95% на api-01', answer: 'Добавить инстанс' },
            { text: '429 Too Many Requests', answer: 'Включить лимиты' },
            { text: 'SSH brute force', answer: 'Заблокировать IP' },
            { text: 'Диск 95%', answer: 'Очистить логи/расширить диск' },
            { text: 'Падение БД-реплики', answer: 'Переключить трафик' }
        ];
        const buttons = ['Добавить инстанс', 'Включить лимиты', 'Заблокировать IP', 'Очистить логи/расширить диск', 'Переключить трафик'];

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="saHandled">Обработано: 0</div>`)}
                <div class="mini-card-surface">
                    <div class="mini-section-title">Алерты бегут, реагируй быстро</div>
                    <div class="mini-log" id="saStream"></div>
                    <div class="mini-options" id="saActions">
                        ${buttons.map(b => `<button class="mini-option-btn" data-action="${b}">${b}</button>`).join('')}
                    </div>
                </div>
            </div>
        `;

        const stream = this.container.querySelector('#saStream');
        const pushEvent = () => {
            const ev = events[Math.floor(Math.random() * events.length)];
            const id = `ev-${Date.now()}`;
            const row = document.createElement('div');
            row.className = 'mini-alert';
            row.dataset.answer = ev.answer;
            row.dataset.id = id;
            row.innerHTML = `<span>${ev.text}</span><span class="mini-pill">ждёт ответа</span>`;
            stream.prepend(row);
            setTimeout(() => {
                if (!row.classList.contains('handled')) {
                    this.fail();
                }
            }, 7000);
            while (stream.children.length > 5) stream.removeChild(stream.lastChild);
        };
        pushEvent();
        this.feedInterval = setInterval(pushEvent, 4000);

        this.container.querySelectorAll('#saActions .mini-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const first = stream.querySelector('.mini-alert:not(.handled)');
                if (!first) return;
                if (first.dataset.answer === action) {
                    first.classList.add('handled');
                    first.querySelector('.mini-pill').textContent = 'готово';
                    this.handled += 1;
                    const pill = this.container.querySelector('#saHandled');
                    if (pill) pill.textContent = `Обработано: ${this.handled}`;
                    if (this.handled >= 8) {
                        this.levelComplete();
                    }
                } else {
                    btn.classList.add('wrong');
                    this.fail();
                }
            });
        });
    }

    renderLevel3(level) {
        const sequence = ['scan', 'patch', 'rotate keys', 'block'];
        const labels = {
            scan: 'Скан уязвимостей',
            patch: 'Поставить патч',
            'rotate keys': 'Повернуть ключи',
            block: 'Заблокировать порт'
        };
        this.sequenceIndex = 0;
        this.mistakes = 0;

        const buttons = Object.keys(labels)
            .concat(['restart service', 'открыть 22 порт'])
            .sort(() => Math.random() - 0.5)
            .map(k => `<button class="mini-option-btn" data-cmd="${k}">${labels[k] || k}</button>`)
            .join('');

        this.container.innerHTML = `
            <div class="mini-game">
                ${this.header(level, `<div class="mini-pill" id="saSeq">Прогресс: 0/${sequence.length}</div>`)}
                <div class="mini-columns">
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Команды</div>
                        <div class="mini-options" id="saCmds">${buttons}</div>
                        <label style="margin-top:12px;">Порт SSH 22:
                            <input type="checkbox" id="saPort"> закрыть после патча
                        </label>
                    </div>
                    <div class="mini-card-surface">
                        <div class="mini-section-title">Прогресс</div>
                        <p id="saStatus">Выполни по порядку: скан → патч → rotate keys → блок.</p>
                        <div class="mini-tags" id="saProgress"></div>
                    </div>
                </div>
            </div>
        `;

        const redraw = () => {
            const holder = this.container.querySelector('#saProgress');
            holder.innerHTML = sequence.map((cmd, idx) => `
                <span class="mini-tag" style="background:${idx < this.sequenceIndex ? '#ecfdf3' : '#f1f5f9'}">${idx < this.sequenceIndex ? '✔ ' : ''}${labels[cmd]}</span>
            `).join('');
            const pill = this.container.querySelector('#saSeq');
            if (pill) pill.textContent = `Прогресс: ${this.sequenceIndex}/${sequence.length}`;
        };
        redraw();

        const portToggle = this.container.querySelector('#saPort');

        this.container.querySelectorAll('#saCmds .mini-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                if (cmd === sequence[this.sequenceIndex]) {
                    this.sequenceIndex += 1;
                    btn.classList.add('correct');
                    redraw();
                    if (this.sequenceIndex === sequence.length) {
                        const portOk = portToggle.checked;
                        if (portOk) {
                            this.levelComplete();
                        } else {
                            btn.classList.add('wrong');
                            this.fail();
                        }
                    }
                } else {
                    btn.classList.add('wrong');
                    this.fail();
                }
            });
        });
    }

    levelComplete() {
        clearInterval(this.timer);
        if (this.feedInterval) clearInterval(this.feedInterval);
        if (this.levelIndex < this.levels().length - 1) {
            this.overlay(true, 'Готово! Дальше.', 'Дальше', () => this.startLevel(this.levelIndex + 1));
        } else {
            this.overlay(true, 'SysAdmin-трек пройден: сеть, мониторинг, безопасность.', 'Вернуться к выбору', () => {
                const back = document.getElementById('backToGrid');
                back ? back.click() : window.location.reload();
            });
        }
    }

    fail() {
        clearInterval(this.timer);
        if (this.feedInterval) clearInterval(this.feedInterval);
        this.overlay(false, 'SLA просел или шаг неверный. Попробуем снова.', 'Перезапустить', () => this.startLevel(0));
    }

    overlay(success, text, btnText, action) {
        const ov = document.createElement('div');
        ov.className = 'mini-overlay';
        ov.innerHTML = `
            <div class="mini-overlay-content">
                <h3>${success ? 'Готово' : 'Не успели'}</h3>
                <p>${text}</p>
                <button class="mini-btn" id="saOverlayBtn">${btnText}</button>
            </div>
        `;
        this.container.appendChild(ov);
        ov.querySelector('#saOverlayBtn').addEventListener('click', () => {
            ov.remove();
            action();
        });
    }
}

window.SysAdminGame = SysAdminGame;
