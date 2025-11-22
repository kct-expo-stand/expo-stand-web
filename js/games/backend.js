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
            <p>Добро пожаловать на "Тёмную сторону" веба. Здесь нет красивых кнопок, только логика, данные и скорость.</p>
            <p>Твоя задача — настроить сервер так, чтобы всё работало и ничего не упало.</p>
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
            <div class="routing-workspace">
                <div class="requests-column" id="requestsList">
                    <div class="column-title">Запросы от пользователей</div>
                    <div style="color: #888; font-size: 12px; margin-bottom: 10px; text-align: center;">Перетащи запрос к нужной функции</div>
                    <!-- Draggable Items -->
                </div>
                <div class="handlers-column" id="handlersList">
                    <div class="column-title">Функции сервера</div>
                    <!-- Drop Targets -->
                </div>
            </div>
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
        if (filled === 4) {
            setTimeout(() => {
                alert('Отлично! Все запросы идут куда нужно. Система запущена.');
                this.startLevel(2);
            }, 200);
        }
    }

    // ================= LEVEL 2: LOGIC CHAINS (SIMPLIFIED) =================
    renderLevel2(content) {
        content.innerHTML = `
            <div class="logic-workspace">
                <div class="task-description">
                    <strong>Задание:</strong> Настрой регистрацию пользователя.
                    <br>Собери цепочку действий в правильном порядке: от получения данных до ответа.
                </div>
                
                <div class="chain-container" id="chainDropZone">
                    <div class="chain-slot" data-index="0">1. Проверка</div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-slot" data-index="1">2. Защита</div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-slot" data-index="2">3. Сохранение</div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-slot" data-index="3">4. Ответ</div>
                </div>

                <div class="logic-blocks-pool" id="blockPool">
                    <!-- Blocks go here -->
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
                alert('Логика верна! Регистрация работает безопасно.');
                this.startLevel(3);
            }, 200);
        }
    }

    // ================= LEVEL 3: SERVER TUNING (ADVANCED) =================
    renderLevel3(content) {
        content.innerHTML = `
            <div class="tuning-workspace">
                <div class="server-monitor">
                    <div class="monitor-header">
                        <div class="monitor-title">PROD-SERVER-01</div>
                        <div class="monitor-timer" id="survivalTimer">60s</div>
                    </div>
                    
                    <div class="monitor-screen" id="logScreen">
                        <div class="log-line success">[SYSTEM] Питание в норме...</div>
                        <div class="log-line">[HINT] Балансируй энергию! Не превышай 100%!</div>
                    </div>
                    
                    <!-- Energy Bar -->
                    <div class="energy-container">
                        <div class="energy-label">
                            <span>⚡ Энергопотребление</span>
                            <span id="energyValue">0%</span>
                        </div>
                        <div class="energy-bar-bg">
                            <div class="energy-bar-fill" id="energyBar"></div>
                        </div>
                    </div>

                    <div class="server-stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">Нагрузка</div>
                            <div class="stat-value" id="statRps">0%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Ошибки</div>
                            <div class="stat-value" id="statErrors">0%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Потери</div>
                            <div class="stat-value money" id="statMoney">$0</div>
                        </div>
                    </div>
                    
                    <div class="alert-box hidden" id="alertBox"></div>
                </div>

                <div class="tuning-controls">
                    <div class="control-group">
                        <div class="control-title">Ресурсы (До 150% = Разгон)</div>
                        
                        <!-- DB Control -->
                        <div class="knob-control">
                            <div class="knob-header">
                                <span>БД (Соединения)</span>
                                <span class="usage-indicator" id="usagePool">Нагрузка: 0%</span>
                            </div>
                            <input type="range" min="0" max="150" value="50" class="backend-slider" id="sliderPool">
                            <div class="knob-value-display">Мощность: <span id="valPool">50%</span></div>
                        </div>

                        <!-- Cache Control -->
                        <div class="knob-control">
                            <div class="knob-header">
                                <span>Кэш (Память)</span>
                                <span class="usage-indicator" style="color: #888;">Снижает нагрузку на БД</span>
                            </div>
                            <input type="range" min="0" max="150" value="50" class="backend-slider" id="sliderCache">
                            <div class="knob-value-display">Мощность: <span id="valCache">50%</span></div>
                        </div>
                        
                        <!-- CPU Control -->
                        <div class="knob-control">
                            <div class="knob-header">
                                <span>CPU (Ядра)</span>
                                <span class="usage-indicator" id="usageCpu">Нагрузка: 0%</span>
                            </div>
                            <input type="range" min="0" max="150" value="50" class="backend-slider" id="sliderCpu">
                            <div class="knob-value-display">Мощность: <span id="valCpu">50%</span></div>
                        </div>
                    </div>

                    <div class="control-group">
                        <div class="control-title">Модули (Потребляют энергию)</div>
                        <div class="toggles-row">
                            <label class="toggle-switch">
                                <input type="checkbox" id="toggleFirewall">
                                <span class="slider-round"></span>
                                <span class="toggle-label">Firewall</span>
                            </label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="toggleCompress">
                                <span class="slider-round"></span>
                                <span class="toggle-label">Сжатие</span>
                            </label>
                        </div>
                    </div>

                    <div class="control-group">
                        <button class="action-btn warning" id="btnGc">🧹 Очистить память (GC)</button>
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
        const elLog = document.getElementById('logScreen');
        const elAlert = document.getElementById('alertBox');
        
        const elUsageCpu = document.getElementById('usageCpu');
        const elUsagePool = document.getElementById('usagePool');
        
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
                else display.style.color = '#fff';
            });
        };
        [sPool, sCache, sCpu].forEach(el => el.addEventListener('input', updateLabels));

        // GC Button
        btnGc.addEventListener('click', () => {
            memoryLeak = 0;
            this.log(elLog, '[SYS] Память очищена', 'success');
            btnGc.disabled = true;
            setTimeout(() => btnGc.disabled = false, 3000); // Cooldown
        });

        // Game Loop
        this.simulationInterval = setInterval(() => {
            timeLeft -= 0.5;
            elTimer.textContent = Math.ceil(timeLeft) + 's';

            if (timeLeft <= 0) {
                this.winGame();
                return;
            }

            // --- EVENTS ---
            // 45s: Traffic Spike (Requires > 100% CPU)
            if (timeLeft === 45) {
                isTrafficSpike = true;
                this.showAlert(elAlert, '⚠️ ПИКОВАЯ НАГРУЗКА!<br><span style="font-size:12px; color:#fff;">Разгоняй CPU выше 100%! Следи за энергией!</span>');
                this.log(elLog, '[WARN] Трафик превышает норму!', 'warn');
            }
            // 30s: Hacker Attack
            if (timeLeft === 30) {
                isHackerAttack = true;
                isTrafficSpike = false; 
                this.showAlert(elAlert, '☠️ DDoS АТАКА!<br><span style="font-size:12px; color:#fff;">Включи FIREWALL! Отключи лишнее для экономии энергии!</span>');
                this.log(elLog, '[CRITICAL] Атака на сервер!', 'error');
            }
            // 15s: Memory Leak
            if (timeLeft === 15) {
                isHackerAttack = false;
                this.showAlert(elAlert, '💾 УТЕЧКА ПАМЯТИ!<br><span style="font-size:12px; color:#fff;">Очисти память!</span>');
                this.log(elLog, '[WARN] RAM переполнена', 'warn');
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

            elUsageCpu.textContent = `Нагрузка: ${Math.floor(requiredCpu)}%`;
            if (requiredCpu > cpu) {
                elUsageCpu.style.color = '#f44336';
                errors += (requiredCpu - cpu) / 2;
                if (Math.random() > 0.8) this.log(elLog, '[CPU] Не хватает мощности!', 'error');
            } else {
                elUsageCpu.style.color = '#4caf50';
            }

            // 3. DB Load
            // Cache reduces DB load.
            // Cache 100% -> reduces load by 50%.
            let cacheFactor = 1 - (cache / 200); 
            let requiredPool = currentLoad * cacheFactor;
            
            elUsagePool.textContent = `Нагрузка: ${Math.floor(requiredPool)}%`;
            if (requiredPool > pool) {
                elUsagePool.style.color = '#f44336';
                errors += (requiredPool - pool);
                if (Math.random() > 0.8) this.log(elLog, '[DB] Очередь переполнена!', 'error');
            } else {
                elUsagePool.style.color = '#4caf50';
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
