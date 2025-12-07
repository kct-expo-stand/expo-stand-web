class BackendGame {
    constructor() {
        this.currentLevel = 1;
        this.container = null;
        this.simulationInterval = null;
        this.level3Attempts = 3;
    }

    start(container) {
        this.level3Attempts = 3;
        this.container = container;
        this.container.innerHTML = '';
        this.container.className = 'backend-game-container';
        this.renderIntro();
    }

    renderIntro() {
        const overlay = document.createElement('div');
        overlay.className = 'backend-overlay';
        overlay.innerHTML = `
            <h2>Backend Разработка</h2>
            <p>Добро пожаловать на "Тёмную сторону" веба!</p>
            <div class="intro-levels">
                <div class="intro-level-item"><span class="level-badge">1</span> Маршруты — соедини запросы с нужными функциями</div>
                <div class="intro-level-item"><span class="level-badge">2</span> Логика — собери правильную цепочку действий</div>
                <div class="intro-level-item"><span class="level-badge">3</span> Нагрузка — управляй сервером в реальном времени</div>
            </div>
            <button class="btn-backend-start">Запустить Терминал</button>
        `;

        overlay.querySelector('button').addEventListener('click', () => {
            overlay.remove();
            this.startLevel(1);
        });

        this.container.appendChild(overlay);
    }

    startLevel(level) {
        this.currentLevel = level;
        this.container.innerHTML = `
            <div class="backend-header">
                <div class="terminal-title">
                    <div class="terminal-dots">
                        <div class="dot red"></div>
                        <div class="dot yellow"></div>
                        <div class="dot green"></div>
                    </div>
                    <span>root@server:~/level-${level}</span>
                </div>
                <div class="backend-timer" id="levelTitle">Загрузка...</div>
            </div>
            <div class="game-content" id="gameContent"></div>
        `;

        const content = this.container.querySelector('#gameContent');
        const title = this.container.querySelector('#levelTitle');
        
        if (level === 1) {
            title.textContent = 'Уровень 1: Маршруты';
            this.renderLevel1(content);
        }
        else if (level === 2) {
            title.textContent = 'Уровень 2: Логика';
            this.renderLevel2(content);
        }
        else if (level === 3) {
            title.textContent = 'Уровень 3: Нагрузка';
            this.renderLevel3(content);
        }
    }

    // ================= LEVEL 1: ROUTING (SIMPLIFIED) =================
    renderLevel1(content) {
        content.innerHTML = `
            <div class="level-tutorial">
                <div class="tutorial-icon">🔌</div>
                <div class="tutorial-text">
                    <strong>Что такое маршрутизация?</strong>
                    <p>Когда ты нажимаешь кнопку на сайте — браузер отправляет <em>запрос</em>. Сервер должен понять, какая <em>функция</em> обработает этот запрос.</p>
                    <p><strong>Твоя задача:</strong> Соедини каждый запрос слева с правильной функцией справа. Просто перетащи!</p>
                </div>
            </div>
            <div class="routing-workspace">
                <div class="requests-column" id="requestsList">
                    <div class="column-title">📥 Запросы</div>
                    <!-- Draggable Items -->
                </div>
                <div class="arrow-hint">➜</div>
                <div class="handlers-column" id="handlersList">
                    <div class="column-title">⚙️ Функции</div>
                    <!-- Drop Targets -->
                </div>
            </div>
            <div class="level-progress" id="levelProgress">Соединено: 0 / 4</div>
        `;

        const requests = [
            { id: 'r1', method: 'GET', path: '/users', label: 'Список людей', target: 'h1' },
            { id: 'r2', method: 'POST', path: '/login', label: 'Вход в аккаунт', target: 'h2' },
            { id: 'r3', method: 'DELETE', path: '/item/5', label: 'Удалить товар', target: 'h3' },
            { id: 'r4', method: 'GET', path: '/status', label: 'Проверка связи', target: 'h4' }
        ];

        const handlers = [
            { id: 'h2', name: 'Войти()', desc: 'Проверить пароль и пустить' },
            { id: 'h4', name: 'Статус()', desc: 'Сказать "Я работаю!"' },
            { id: 'h1', name: 'НайтиВсех()', desc: 'Достать список из Базы' },
            { id: 'h3', name: 'Удалить()', desc: 'Стереть данные навсегда' }
        ];

        const reqList = content.querySelector('#requestsList');
        const handList = content.querySelector('#handlersList');

        requests.forEach(req => {
            const el = document.createElement('div');
            el.className = 'request-node';
            el.draggable = true;
            el.id = req.id;
            el.dataset.target = req.target;
            // Simplified view
            el.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="method ${req.method}">${req.method}</span> 
                        <span style="font-size:12px; color:#aaa;">${req.path}</span>
                    </div>
                    <div style="font-size:14px; color:#fff;">${req.label}</div>
                </div>
            `;
            
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', req.id);
                e.target.classList.add('dragging');
            });
            
            el.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });

            reqList.appendChild(el);
        });

        handlers.forEach(h => {
            const el = document.createElement('div');
            el.className = 'handler-node';
            el.id = h.id;
            el.innerHTML = `<strong style="font-size:16px; color:#569cd6;">${h.name}</strong><br><small style="color:#888;">${h.desc}</small>`;
            
            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                el.classList.add('highlight');
            });

            el.addEventListener('dragleave', () => {
                el.classList.remove('highlight');
            });

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                el.classList.remove('highlight');
                const reqId = e.dataTransfer.getData('text/plain');
                const reqEl = document.getElementById(reqId);
                
                if (reqEl && reqEl.dataset.target === h.id) {
                    // Correct match
                    el.classList.add('filled');
                    el.innerHTML = '';
                    el.appendChild(reqEl);
                    reqEl.draggable = false;
                    reqEl.style.cursor = 'default';
                    reqEl.style.border = 'none';
                    reqEl.style.background = 'transparent';
                    this.checkLevel1();
                } else {
                    // Visual feedback for wrong drop could be added here
                    const originalColor = el.style.borderColor;
                    el.style.borderColor = '#f44336';
                    setTimeout(() => el.style.borderColor = '', 500);
                }
            });

            handList.appendChild(el);
        });
    }

    checkLevel1() {
        const filled = this.container.querySelectorAll('.handler-node.filled').length;
        const progressEl = this.container.querySelector('#levelProgress');
        if (progressEl) progressEl.textContent = `Соединено: ${filled} / 4`;
        
        if (filled === 4) {
            setTimeout(() => {
                this.showLevelComplete('Маршрутизация настроена!', 'Теперь каждый запрос знает, куда идти.', 2);
            }, 200);
        }
    }

    showLevelComplete(title, desc, nextLevel) {
        const overlay = document.createElement('div');
        overlay.className = 'backend-overlay level-complete';
        overlay.innerHTML = `
            <div class="complete-icon">✓</div>
            <h2>${title}</h2>
            <p>${desc}</p>
            <button class="btn-backend-start">Следующий уровень</button>
        `;
        overlay.querySelector('button').addEventListener('click', () => {
            overlay.remove();
            this.startLevel(nextLevel);
        });
        this.container.appendChild(overlay);
    }

    // ================= LEVEL 2: LOGIC CHAINS (SIMPLIFIED) =================
    renderLevel2(content) {
        content.innerHTML = `
            <div class="level-tutorial">
                <div class="tutorial-icon">🧩</div>
                <div class="tutorial-text">
                    <strong>Что такое логика сервера?</strong>
                    <p>Когда пользователь регистрируется, сервер выполняет действия <em>по порядку</em>: сначала проверяет данные, потом шифрует пароль, и т.д.</p>
                    <p><strong>Твоя задача:</strong> Перетащи блоки в слоты в правильном порядке. Подсказка: подумай, что нужно сделать ДО сохранения в базу?</p>
                </div>
            </div>
            <div class="logic-workspace">
                <div class="task-description">
                    <span class="task-icon">📝</span>
                    <span><strong>Сценарий:</strong> Пользователь нажал "Зарегистрироваться". Что сервер делает?</span>
                </div>
                
                <div class="chain-container" id="chainDropZone">
                    <div class="chain-slot" data-index="0">
                        <span class="slot-number">1</span>
                        <span class="slot-hint">Сначала проверяем...</span>
                    </div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-slot" data-index="1">
                        <span class="slot-number">2</span>
                        <span class="slot-hint">Потом защищаем...</span>
                    </div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-slot" data-index="2">
                        <span class="slot-number">3</span>
                        <span class="slot-hint">Затем сохраняем...</span>
                    </div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-slot" data-index="3">
                        <span class="slot-number">4</span>
                        <span class="slot-hint">В конце отвечаем!</span>
                    </div>
                </div>

                <div class="blocks-section">
                    <div class="blocks-title">Доступные действия (перетащи в слоты):</div>
                    <div class="logic-blocks-pool" id="blockPool"></div>
                </div>
            </div>
        `;

        const blocks = [
            { id: 'b1', text: 'Проверить Email', type: 'logic' },
            { id: 'b2', text: 'Зашифровать пароль', type: 'security' },
            { id: 'b3', text: 'Записать в Базу Данных', type: 'db' },
            { id: 'b4', text: 'Сказать "Успешно"', type: 'response' },
            { id: 'b5', text: 'Удалить аккаунт', type: 'error' }, // Distractor
            { id: 'b6', text: 'Выдать ошибку', type: 'error' }, // Distractor
        ];

        // Correct Order: b1, b2, b3, b4

        const pool = content.querySelector('#blockPool');
        const slots = content.querySelectorAll('.chain-slot');

        blocks.forEach(b => {
            const el = document.createElement('div');
            el.className = 'logic-block';
            el.draggable = true;
            el.id = b.id;
            el.textContent = b.text;
            
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', b.id);
            });

            pool.appendChild(el);
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                const el = document.getElementById(id);
                
                if (el) {
                    if (slot.children.length > 0) {
                        pool.appendChild(slot.children[0]);
                    }
                    slot.textContent = '';
                    slot.appendChild(el);
                    this.checkLevel2();
                }
            });
            
            slot.addEventListener('click', () => {
                if (slot.children.length > 0) {
                    const el = slot.children[0];
                    pool.appendChild(el);
                    // Restore placeholder text based on index
                    const titles = ['1. Проверка', '2. Защита', '3. Сохранение', '4. Ответ'];
                    slot.textContent = titles[slot.dataset.index];
                    this.checkLevel2();
                }
            });
        });
    }

    checkLevel2() {
        const slots = this.container.querySelectorAll('.chain-slot');
        const currentChain = Array.from(slots).map(s => s.children.length > 0 ? s.children[0].id : null);
        
        const target = ['b1', 'b2', 'b3', 'b4'];
        const isMatch = currentChain.every((val, index) => val === target[index]);

        if (isMatch) {
            setTimeout(() => {
                this.showLevelComplete('Логика выстроена!', 'Теперь регистрация работает безопасно и правильно.', 3);
            }, 200);
        }
    }

    // ================= LEVEL 3: SERVER TUNING (ADVANCED) =================
    renderLevel3(content) {
        content.innerHTML = `
            <div class="level3-layout">
                <!-- Left: Resource Cards -->
                <div class="resources-panel">
                    <div class="panel-header">
                        <span>⚙️ Ресурсы сервера</span>
                        <span class="attempts-badge">Попыток: ${this.level3Attempts}</span>
                    </div>
                    
                    <!-- CPU Card -->
                    <div class="resource-card" id="cardCpu">
                        <div class="resource-header">
                            <span class="resource-icon">🔥</span>
                            <span class="resource-name">Процессор (CPU)</span>
                        </div>
                        <div class="resource-meters">
                            <div class="meter-row">
                                <span class="meter-label">Нагрузка:</span>
                                <div class="meter-bar-bg">
                                    <div class="meter-bar-fill" id="meterCpuLoad"></div>
                                </div>
                                <span class="meter-value" id="valCpuLoad">0%</span>
                            </div>
                            <div class="meter-row">
                                <span class="meter-label">Мощность:</span>
                                <input type="range" min="0" max="150" value="50" class="resource-slider" id="sliderCpu">
                                <span class="meter-value power" id="valCpu">50%</span>
                            </div>
                        </div>
                        <div class="resource-status" id="statusCpu">✓ Норма</div>
                    </div>

                    <!-- DB Card -->
                    <div class="resource-card" id="cardPool">
                        <div class="resource-header">
                            <span class="resource-icon">🗄️</span>
                            <span class="resource-name">База данных</span>
                        </div>
                        <div class="resource-meters">
                            <div class="meter-row">
                                <span class="meter-label">Нагрузка:</span>
                                <div class="meter-bar-bg">
                                    <div class="meter-bar-fill" id="meterPoolLoad"></div>
                                </div>
                                <span class="meter-value" id="valPoolLoad">0%</span>
                            </div>
                            <div class="meter-row">
                                <span class="meter-label">Мощность:</span>
                                <input type="range" min="0" max="150" value="50" class="resource-slider" id="sliderPool">
                                <span class="meter-value power" id="valPool">50%</span>
                            </div>
                        </div>
                        <div class="resource-status" id="statusPool">✓ Норма</div>
                    </div>

                    <!-- Cache Card -->
                    <div class="resource-card" id="cardCache">
                        <div class="resource-header">
                            <span class="resource-icon">💾</span>
                            <span class="resource-name">Кэш (снижает нагрузку на БД)</span>
                        </div>
                        <div class="resource-meters">
                            <div class="meter-row">
                                <span class="meter-label">Размер:</span>
                                <input type="range" min="0" max="150" value="50" class="resource-slider" id="sliderCache">
                                <span class="meter-value power" id="valCache">50%</span>
                            </div>
                        </div>
                        <div class="resource-hint">↑ Больше кэш = меньше нагрузки на БД</div>
                    </div>
                </div>

                <!-- Center: Monitor -->
                <div class="server-monitor-center">
                    <div class="monitor-top">
                        <div class="timer-display">
                            <span class="timer-label">Осталось:</span>
                            <span class="timer-value" id="survivalTimer">60</span>
                            <span class="timer-unit">сек</span>
                        </div>
                        <div class="energy-display">
                            <span class="energy-icon">⚡</span>
                            <span class="energy-label">Энергия:</span>
                            <div class="energy-bar-bg">
                                <div class="energy-bar-fill" id="energyBar"></div>
                            </div>
                            <span class="energy-value" id="energyValue">0%</span>
                        </div>
                    </div>

                    <div class="alert-box hidden" id="alertBox"></div>

                    <div class="console-window" id="logScreen">
                        <div class="console-header">📟 Консоль сервера</div>
                        <div class="console-content">
                            <div class="log-line success">[OK] Сервер запущен</div>
                            <div class="log-line hint">[?] Если нагрузка > мощности — ошибки!</div>
                            <div class="log-line hint">[?] Следи за событиями в оповещениях</div>
                        </div>
                    </div>

                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <div class="stat-label">Трафик</div>
                                <div class="stat-value" id="statRps">20%</div>
                            </div>
                        </div>
                        <div class="stat-box bad-indicator">
                            <div class="stat-icon">❌</div>
                            <div class="stat-info">
                                <div class="stat-label">Ошибки</div>
                                <div class="stat-value" id="statErrors">0%</div>
                            </div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-icon">💸</div>
                            <div class="stat-info">
                                <div class="stat-label">Потери</div>
                                <div class="stat-value money" id="statMoney">$0</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Modules -->
                <div class="modules-panel">
                    <div class="panel-header">🔌 Модули</div>
                    
                    <div class="module-card" id="moduleFirewall">
                        <div class="module-header">
                            <span class="module-icon">🛡️</span>
                            <span class="module-name">Firewall</span>
                            <label class="module-toggle">
                                <input type="checkbox" id="toggleFirewall">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="module-desc">Защита от хакерских атак</div>
                        <div class="module-cost">+10% энергии</div>
                    </div>

                    <div class="module-card" id="moduleCompress">
                        <div class="module-header">
                            <span class="module-icon">📦</span>
                            <span class="module-name">Сжатие</span>
                            <label class="module-toggle">
                                <input type="checkbox" id="toggleCompress">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="module-desc">Экономит трафик</div>
                        <div class="module-cost">+5% энергии</div>
                    </div>

                    <button class="gc-button" id="btnGc">
                        <span class="gc-icon">🧹</span>
                        <span class="gc-text">Очистить память</span>
                    </button>

                    <div class="rules-box">
                        <div class="rules-title">📋 Правила:</div>
                        <ul>
                            <li>Мощность ≥ Нагрузка = ✓</li>
                            <li>Энергия > 100% = ошибки!</li>
                            <li>Потери > $15000 = проигрыш</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        this.startSimulation();
    }

    startSimulation() {
        // Get Elements
        const sPool = document.getElementById('sliderPool');
        const sCache = document.getElementById('sliderCache');
        const sCpu = document.getElementById('sliderCpu');
        const tFirewall = document.getElementById('toggleFirewall');
        const tCompress = document.getElementById('toggleCompress');
        const btnGc = document.getElementById('btnGc');
        
        const elRps = document.getElementById('statRps');
        const elErrors = document.getElementById('statErrors');
        const elMoney = document.getElementById('statMoney');
        const elTimer = document.getElementById('survivalTimer');
        const elLog = document.querySelector('.console-content');
        const elAlert = document.getElementById('alertBox');
        
        // New meter elements
        const meterCpuLoad = document.getElementById('meterCpuLoad');
        const meterPoolLoad = document.getElementById('meterPoolLoad');
        const valCpuLoad = document.getElementById('valCpuLoad');
        const valPoolLoad = document.getElementById('valPoolLoad');
        const statusCpu = document.getElementById('statusCpu');
        const statusPool = document.getElementById('statusPool');
        const cardCpu = document.getElementById('cardCpu');
        const cardPool = document.getElementById('cardPool');
        
        const elEnergyBar = document.getElementById('energyBar');
        const elEnergyVal = document.getElementById('energyValue');

        // State
        let timeLeft = 60;
        let moneyLost = 0;
        let traffic = 20; // Base traffic %
        let memoryLeak = 0;
        let isHackerAttack = false;
        let isTrafficSpike = false;
        
        // Update Labels
        const updateLabels = () => {
            document.getElementById('valPool').textContent = sPool.value + '%';
            document.getElementById('valCache').textContent = sCache.value + '%';
            document.getElementById('valCpu').textContent = sCpu.value + '%';
            
            // Visual feedback for overclocking
            [sPool, sCache, sCpu].forEach(el => {
                const val = parseInt(el.value);
                const display = document.getElementById(el.id.replace('slider', 'val'));
                if (val > 100) display.style.color = '#ffbd2e'; // Warning color
                else display.style.color = '#4caf50';
            });
        };
        [sPool, sCache, sCpu].forEach(el => el.addEventListener('input', updateLabels));
        updateLabels(); // Initial update

        // GC Button
        btnGc.addEventListener('click', () => {
            memoryLeak = 0;
            this.log(elLog, '[OK] Память очищена!', 'success');
            btnGc.disabled = true;
            btnGc.classList.add('cooldown');
            setTimeout(() => {
                btnGc.disabled = false;
                btnGc.classList.remove('cooldown');
            }, 3000);
        });

        // Game Loop
        this.simulationInterval = setInterval(() => {
            timeLeft -= 0.5;
            elTimer.textContent = Math.ceil(timeLeft);

            if (timeLeft <= 0) {
                this.winGame();
                return;
            }

            // --- EVENTS ---
            // 45s: Traffic Spike (Requires > 100% CPU)
            if (timeLeft === 45) {
                isTrafficSpike = true;
                this.showAlert(elAlert, '⚠️ ПИКОВАЯ НАГРУЗКА!<br><span style="font-size:12px; color:#fff;">Много пользователей! Увеличь CPU и БД!</span><br><span style="font-size:11px; color:#aaa;">Подвинь ползунки вправо, пока "Нагрузка" не станет зелёной</span>');
                this.log(elLog, '[WARN] Много посетителей на сайте!', 'warn');
            }
            // 30s: Hacker Attack
            if (timeLeft === 30) {
                isHackerAttack = true;
                isTrafficSpike = false; 
                this.showAlert(elAlert, '☠️ ХАКЕРСКАЯ АТАКА!<br><span style="font-size:12px; color:#fff;">Включи переключатель "Firewall" справа!</span><br><span style="font-size:11px; color:#aaa;">Это защитит сервер от взлома</span>');
                this.log(elLog, '[CRITICAL] Хакеры атакуют сервер!', 'error');
            }
            // 15s: Memory Leak
            if (timeLeft === 15) {
                isHackerAttack = false;
                this.showAlert(elAlert, '💾 ПАМЯТЬ ЗАПОЛНЕНА!<br><span style="font-size:12px; color:#fff;">Нажми кнопку "Очистить память"!</span><br><span style="font-size:11px; color:#aaa;">Жёлтая кнопка внизу справа</span>');
                this.log(elLog, '[WARN] Память сервера заполнена!', 'warn');
            }
            
            if (timeLeft === 40 || timeLeft === 25 || timeLeft === 10) {
                 this.hideAlert(elAlert);
            }

            // --- INPUTS ---
            const pool = parseInt(sPool.value);
            const cache = parseInt(sCache.value);
            const cpu = parseInt(sCpu.value);
            const firewall = tFirewall.checked;
            const compress = tCompress.checked;

            // --- TRAFFIC LOGIC ---
            // Traffic is now in % relative to standard capacity
            let currentLoad = traffic;
            if (isTrafficSpike) currentLoad = 130; // Needs overclocking
            if (isHackerAttack) currentLoad = 80; // Attack itself isn't high load, but needs firewall
            if (!isTrafficSpike && !isHackerAttack) currentLoad += 0.5; // Organic growth

            // --- ENERGY CALCULATION ---
            // Base: 5%
            // CPU: 0.3 per point (0-100), 0.6 per point (100-150)
            // DB: 0.2 per point (0-100), 0.5 per point (100-150)
            // Cache: 0.1 per point
            // Firewall: 10%
            // Compress: 5%
            
            let energy = 5;
            
            // CPU Energy
            if (cpu <= 100) energy += cpu * 0.3;
            else energy += (100 * 0.3) + ((cpu - 100) * 0.6);

            // DB Energy
            if (pool <= 100) energy += pool * 0.2;
            else energy += (100 * 0.2) + ((pool - 100) * 0.5);

            // Cache Energy
            energy += cache * 0.1;

            if (firewall) energy += 10;
            if (compress) energy += 5;

            // Update Energy UI
            elEnergyVal.textContent = Math.floor(energy) + '%';
            elEnergyBar.style.width = Math.min(energy, 100) + '%';
            
            if (energy > 100) {
                elEnergyBar.style.backgroundColor = '#f44336'; // Red
                elEnergyVal.style.color = '#f44336';
            } else if (energy > 80) {
                elEnergyBar.style.backgroundColor = '#ffbd2e'; // Yellow
                elEnergyVal.style.color = '#ffbd2e';
            } else {
                elEnergyBar.style.backgroundColor = '#4caf50'; // Green
                elEnergyVal.style.color = '#4caf50';
            }

            // --- ERROR CALCULATION ---
            let errors = 0;

            // 1. Power Overload
            if (energy > 100) {
                errors += (energy - 100) * 2; // Heavy penalty for overload
                if (Math.random() > 0.7) this.log(elLog, '[POWER] ПЕРЕГРУЗКА СЕТИ!', 'error');
            }

            // 2. CPU Load
            // Load is direct % requirement. 
            // Firewall adds CPU load too.
            let requiredCpu = currentLoad;
            if (firewall) requiredCpu += 20;
            if (compress) requiredCpu += 10;

            // Update CPU meter
            const cpuLoadPercent = Math.min((requiredCpu / 150) * 100, 100);
            meterCpuLoad.style.width = cpuLoadPercent + '%';
            valCpuLoad.textContent = Math.floor(requiredCpu) + '%';
            
            if (requiredCpu > cpu) {
                meterCpuLoad.style.backgroundColor = '#f44336';
                valCpuLoad.style.color = '#f44336';
                statusCpu.textContent = '✗ Перегрузка!';
                statusCpu.className = 'resource-status bad';
                cardCpu.classList.add('warning');
                errors += (requiredCpu - cpu) / 2;
                if (Math.random() > 0.8) this.log(elLog, '[CPU] Не хватает мощности!', 'error');
            } else {
                meterCpuLoad.style.backgroundColor = '#4caf50';
                valCpuLoad.style.color = '#4caf50';
                statusCpu.textContent = '✓ Норма';
                statusCpu.className = 'resource-status good';
                cardCpu.classList.remove('warning');
            }

            // 3. DB Load
            // Cache reduces DB load.
            // Cache 100% -> reduces load by 50%.
            let cacheFactor = 1 - (cache / 200); 
            let requiredPool = currentLoad * cacheFactor;
            
            // Update DB meter
            const poolLoadPercent = Math.min((requiredPool / 150) * 100, 100);
            meterPoolLoad.style.width = poolLoadPercent + '%';
            valPoolLoad.textContent = Math.floor(requiredPool) + '%';
            
            if (requiredPool > pool) {
                meterPoolLoad.style.backgroundColor = '#f44336';
                valPoolLoad.style.color = '#f44336';
                statusPool.textContent = '✗ Перегрузка!';
                statusPool.className = 'resource-status bad';
                cardPool.classList.add('warning');
                errors += (requiredPool - pool);
                if (Math.random() > 0.8) this.log(elLog, '[БД] Очередь переполнена!', 'error');
            } else {
                meterPoolLoad.style.backgroundColor = '#4caf50';
                valPoolLoad.style.color = '#4caf50';
                statusPool.textContent = '✓ Норма';
                statusPool.className = 'resource-status good';
                cardPool.classList.remove('warning');
            }

            // 4. Hacker Attack
            if (isHackerAttack && !firewall) {
                errors += 50;
                this.log(elLog, '[SEC] НУЖЕН FIREWALL!', 'error');
            }

            // 5. Memory Leak
            if (timeLeft < 15 && timeLeft > 0) memoryLeak += 5;
            if (memoryLeak > 50) {
                errors += 20;
                this.log(elLog, '[MEM] Память забита!', 'error');
            }

            // Cap errors
            if (errors > 100) errors = 100;
            errors = Math.floor(errors);

            // Money Loss
            if (errors > 0) {
                moneyLost += errors * 10;
            }

            // --- UI UPDATE ---
            elRps.textContent = Math.floor(currentLoad) + '%';
            elErrors.textContent = errors + '%';
            elMoney.textContent = '-$' + moneyLost;
            
            elErrors.className = 'stat-value ' + (errors > 10 ? 'bad' : 'good');
            if (errors > 0) elMoney.classList.add('bad');

            // Fail Condition
            if (moneyLost > 15000) {
                this.failGame(moneyLost);
            }

        }, 500);
    }

    log(container, msg, type) {
        const div = document.createElement('div');
        div.className = `log-line ${type}`;
        div.textContent = msg;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        if (container.children.length > 15) container.removeChild(container.children[0]);
    }

    showAlert(el, msg) {
        el.innerHTML = msg;
        el.classList.remove('hidden');
        el.classList.add('pulse');
    }
    
    hideAlert(el) {
        el.classList.add('hidden');
        el.classList.remove('pulse');
    }

    failGame(money) {
        clearInterval(this.simulationInterval);
        this.level3Attempts--;

        const overlay = document.createElement('div');
        overlay.className = 'backend-overlay fail';
        
        if (this.level3Attempts > 0) {
            overlay.innerHTML = `
                <h2 style="color: #f44336;">СБОЙ СИСТЕМЫ!</h2>
                <p>Бизнес потерял <strong>$${money}</strong>.</p>
                <p>Осталось попыток: ${this.level3Attempts}</p>
                <button class="btn-backend-start" id="retryBtn">Попробовать снова</button>
            `;
            this.container.appendChild(overlay);
            overlay.querySelector('#retryBtn').addEventListener('click', () => {
                this.startLevel(3);
            });
        } else {
            overlay.innerHTML = `
                <h2 style="color: #f44336;">GAME OVER</h2>
                <p>Вы исчерпали все попытки восстановления.</p>
                <p>Компания обанкротилась.</p>
                <button class="btn-backend-start" id="restartBtn">Начать сначала</button>
            `;
            this.container.appendChild(overlay);
            overlay.querySelector('#restartBtn').addEventListener('click', () => {
                this.start(this.container);
            });
        }
    }

    winGame() {
        clearInterval(this.simulationInterval);
        const overlay = document.createElement('div');
        overlay.className = 'backend-overlay';
        overlay.innerHTML = `
            <h2 style="color: #4caf50;">СИСТЕМА СТАБИЛЬНА!</h2>
            <p>Ты успешно отразил все атаки и справился с нагрузкой.</p>
            <p>Сервер работает идеально. Ты настоящий Senior Backend Developer!</p>
            <button class="btn-backend-start" id="finishBtn">Вернуться в меню</button>
        `;
        this.container.appendChild(overlay);
        
        overlay.querySelector('#finishBtn').addEventListener('click', () => {
            // Close game logic here, e.g. reload page or trigger back button
            document.getElementById('backToGrid').click();
        });
    }
}
