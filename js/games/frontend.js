class FrontendGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentLevelIndex = 0;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.isGameActive = false;
        
        // Game State for Style Level
        this.styleLevelState = {
            bg: 'white',
            radius: '0px',
            shadow: 'none',
            textColor: 'black',
            border: 'none',
            align: 'left',
            icon: 'none',
            padding: '20px'
        };
        
        // Game State for Responsive Level
        this.responsiveState = {
            fontSize: 10,
            imgWidth: 150,
            lineHeight: 1.0,
            letterSpacing: -2,
            borderRadius: 0,
            paddingFixed: false,
            btnFixed: false,
            gridFixed: false,
            contrastFixed: false
        };

        this.levels = [
            {
                type: 'layout',
                name: "Архитектор",
                description: "Собери структуру лендинга. Сопоставь элементы с зонами на макете.",
                time: 30,
                layout: ['header', 'hero', 'text', 'button', 'footer'],
                zoneHints: [
                    "Навигация (Верх)",
                    "Главный баннер",
                    "Описание",
                    "Призыв к действию",
                    "Контакты (Низ)"
                ],
                elements: [
                    { type: 'header', label: 'Шапка', icon: 'fa-window-maximize' },
                    { type: 'hero', label: 'Фото', icon: 'fa-image' },
                    { type: 'text', label: 'Текст', icon: 'fa-align-left' },
                    { type: 'button', label: 'Кнопка', icon: 'fa-square-check' },
                    { type: 'footer', label: 'Футер', icon: 'fa-copyright' },
                    { type: 'grid', label: 'Сетка', icon: 'fa-border-all' }, // Distraction
                    { type: 'reviews', label: 'Отзывы', icon: 'fa-comments' } // Distraction
                ]
            },
            {
                type: 'style',
                name: "Стилист",
                description: "Клиент прислал сложный макет. Настрой все 8 параметров карточки, чтобы она выглядела точь-в-точь!",
                time: 60,
                target: {
                    bg: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                    radius: '20px',
                    shadow: '0 10px 20px rgba(0,0,0,0.2)',
                    textColor: 'white',
                    border: '4px solid white',
                    align: 'center',
                    icon: 'star',
                    padding: '40px'
                }
            },
            {
                type: 'responsive',
                name: "Мастер Адаптива",
                description: "Настрой параметры сайта: используй слайдеры для тонкой настройки и кнопки для быстрых исправлений.",
                time: 90,
                targets: {
                    fontSize: { min: 14, max: 18 },
                    imgWidth: { min: 90, max: 100 },
                    lineHeight: { min: 1.4, max: 1.8 },
                    letterSpacing: { min: 0, max: 1 },
                    borderRadius: { min: 8, max: 20 },
                    paddingFixed: true,
                    btnFixed: true,
                    gridFixed: true,
                    contrastFixed: true
                }
            }
        ];

        this.init();
    }

    init() {
        this.renderIntro();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderIntro() {
        this.container.innerHTML = `
            <div class="frontend-game-container">
                <div class="game-overlay">
                    <h2>FrontEnd: Путь Разработчика</h2>
                    <p>Тебе предстоит пройти 3 этапа создания интерфейса:<br>
                    1. <strong>Архитектор</strong>: Собери макет.<br>
                    2. <strong>Стилист</strong>: Настрой сложный дизайн.<br>
                    3. <strong>Мастер Адаптива</strong>: Настрой верстку слайдерами.</p>
                    <button class="btn-game-start" id="startGameBtn">Начать карьеру</button>
                </div>
            </div>
        `;
        
        document.getElementById('startGameBtn').addEventListener('click', () => this.startLevel(0));
    }

    renderLevelHeader(level) {
        const stepsHtml = this.levels.map((_, idx) => {
            let status = '';
            if (idx < this.currentLevelIndex) status = 'completed';
            if (idx === this.currentLevelIndex) status = 'active';
            return `
                <div class="level-step ${status}">${idx + 1}</div>
                ${idx < this.levels.length - 1 ? `<div class="level-line ${idx < this.currentLevelIndex ? 'active' : ''}"></div>` : ''}
            `;
        }).join('');

        return `
            <div class="level-indicator">
                ${stepsHtml}
            </div>
            <div class="level-title">${level.name}</div>
            <div class="level-desc">${level.description}</div>
        `;
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = levelIndex;
        const level = this.levels[levelIndex];
        
        this.isGameActive = true;
        this.timeLeft = level.time;
        
        if (level.type === 'layout') {
            this.currentLayout = new Array(level.layout.length).fill(null);
            this.renderLayoutLevel(level);
        } else if (level.type === 'style') {
            this.styleLevelState = { 
                bg: 'white', radius: '0px', shadow: 'none', 
                textColor: 'black', border: 'none', align: 'left', icon: 'none', padding: '20px'
            };
            this.renderStyleLevel(level);
        } else if (level.type === 'responsive') {
            this.responsiveState = { 
                fontSize: 10, imgWidth: 150, lineHeight: 1.0, letterSpacing: -2, borderRadius: 0,
                paddingFixed: false, btnFixed: false, gridFixed: false, contrastFixed: false
            };
            this.renderResponsiveLevel(level);
        }
        
        this.startTimer();
    }



    // --- LEVEL 1: LAYOUT ---
    renderLayoutLevel(level) {
        const shuffledElements = this.shuffleArray([...level.elements]);
        
        const toolboxHtml = shuffledElements.map(el => `
            <div class="draggable-item" draggable="true" data-type="${el.type}">
                <i class="fa-solid ${el.icon}"></i> ${el.label}
            </div>
        `).join('');

        const dropZonesHtml = level.layout.map((type, index) => {
            const hint = level.zoneHints ? level.zoneHints[index] : `Блок ${index + 1}`;
            return `<div class="drop-zone" data-index="${index}" data-accept="${type}">${hint}</div>`;
        }).join('');

        this.container.innerHTML = `
            <div class="frontend-game-container">
                <div class="game-timer" id="gameTimer">00:${this.timeLeft}</div>
                <div style="padding: 20px;">
                    ${this.renderLevelHeader(level)}
                    <div class="game-workspace">
                        <div class="toolbox">
                            <h3>Элементы</h3>
                            ${toolboxHtml}
                        </div>
                        <div class="preview-area">
                            <div class="device-mockup">
                                ${dropZonesHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupLayoutDragAndDrop();
    }

    setupLayoutDragAndDrop() {
        const draggables = this.container.querySelectorAll('.draggable-item');
        const dropZones = this.container.querySelectorAll('.drop-zone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', draggable.dataset.type);
                draggable.classList.add('dragging');
            });
            draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!zone.classList.contains('filled')) zone.classList.add('highlight');
            });
            zone.addEventListener('dragleave', () => zone.classList.remove('highlight'));
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('highlight');
                if (zone.classList.contains('filled')) return;

                const type = e.dataTransfer.getData('text/plain');
                const index = parseInt(zone.dataset.index);
                const expectedType = zone.dataset.accept;

                if (type === expectedType) {
                    this.placeLayoutElement(zone, type, index);
                } else {
                    zone.style.borderColor = '#d63031';
                    setTimeout(() => zone.style.borderColor = '', 500);
                }
            });
        });
    }

    placeLayoutElement(zone, type, index) {
        this.currentLayout[index] = type;
        zone.classList.add('filled');
        
        let content = '';
        switch(type) {
            case 'header': content = '<div class="placed-element el-header"><div class="logo"></div><div class="nav"></div></div>'; break;
            case 'hero': content = '<div class="placed-element el-hero"></div>'; break;
            case 'text': content = '<div class="placed-element el-text"><div class="line"></div><div class="line"></div></div>'; break;
            case 'button': content = '<div class="placed-element el-button">Кнопка</div>'; break;
            case 'footer': content = '<div class="placed-element el-footer">Footer</div>'; break;
        }
        
        zone.innerHTML = content;
        
        if (this.currentLayout.every(item => item !== null)) {
            this.levelComplete();
        }
    }

    // --- LEVEL 2: STYLE (VISUAL) ---
    renderStyleLevel(level) {
        this.container.innerHTML = `
            <div class="frontend-game-container">
                <div class="game-timer" id="gameTimer">00:${this.timeLeft}</div>
                <div style="padding: 20px; height: 100%;">
                    ${this.renderLevelHeader(level)}
                    <div class="style-game-workspace">
                        <div class="style-preview-container">
                            <div class="style-card-wrapper">
                                <span class="style-card-label">Твой результат</span>
                                <div class="style-user-card" id="userCard">
                                    <div class="card-icon-placeholder"></div>
                                    <div class="card-text-placeholder"></div>
                                    <div class="card-text-placeholder" style="width: 70%"></div>
                                    <div class="card-btn-placeholder"></div>
                                </div>
                            </div>
                            <div class="style-card-wrapper">
                                <span class="style-card-label">Цель (Макет)</span>
                                <div class="style-target-card" id="targetCard">
                                    <div class="card-icon-placeholder"></div>
                                    <div class="card-text-placeholder"></div>
                                    <div class="card-text-placeholder" style="width: 70%"></div>
                                    <div class="card-btn-placeholder"></div>
                                </div>
                            </div>
                        </div>

                        <div class="style-controls">
                            <div class="control-group full-width">
                                <h4>Фон карточки</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="bg" data-val="white" style="background: white"></button>
                                    <button class="style-btn" data-prop="bg" data-val="#2d3436" style="background: #2d3436"></button>
                                    <button class="style-btn" data-prop="bg" data-val="#C805B7" style="background: #C805B7"></button>
                                    <button class="style-btn" data-prop="bg" data-val="linear-gradient(135deg, #6c5ce7, #a29bfe)" style="background: linear-gradient(135deg, #6c5ce7, #a29bfe)"></button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Скругление</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="radius" data-val="0px"><i class="fa-regular fa-square"></i></button>
                                    <button class="style-btn" data-prop="radius" data-val="10px">10</button>
                                    <button class="style-btn" data-prop="radius" data-val="20px">20</button>
                                    <button class="style-btn" data-prop="radius" data-val="50px">50</button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Тень</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="shadow" data-val="none"><i class="fa-solid fa-ban"></i></button>
                                    <button class="style-btn" data-prop="shadow" data-val="0 10px 20px rgba(0,0,0,0.2)"><i class="fa-solid fa-cloud"></i></button>
                                    <button class="style-btn" data-prop="shadow" data-val="0 20px 40px rgba(0,0,0,0.4)"><i class="fa-solid fa-cloud-showers-heavy"></i></button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Цвет текста</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="textColor" data-val="black" style="background: black; color: white">A</button>
                                    <button class="style-btn" data-prop="textColor" data-val="white" style="background: white; color: black">A</button>
                                    <button class="style-btn" data-prop="textColor" data-val="#C805B7" style="background: #C805B7; color: white">A</button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Граница</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="border" data-val="none"><i class="fa-solid fa-border-none"></i></button>
                                    <button class="style-btn" data-prop="border" data-val="2px solid #dfe6e9" style="border: 2px solid #dfe6e9"></button>
                                    <button class="style-btn" data-prop="border" data-val="4px solid white" style="border: 4px solid white; background: #ccc"></button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Выравнивание</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="align" data-val="left"><i class="fa-solid fa-align-left"></i></button>
                                    <button class="style-btn" data-prop="align" data-val="center"><i class="fa-solid fa-align-center"></i></button>
                                    <button class="style-btn" data-prop="align" data-val="right"><i class="fa-solid fa-align-right"></i></button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Иконка</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="icon" data-val="none"><i class="fa-solid fa-ban"></i></button>
                                    <button class="style-btn" data-prop="icon" data-val="user"><i class="fa-solid fa-user"></i></button>
                                    <button class="style-btn" data-prop="icon" data-val="star"><i class="fa-solid fa-star"></i></button>
                                    <button class="style-btn" data-prop="icon" data-val="heart"><i class="fa-solid fa-heart"></i></button>
                                </div>
                            </div>
                            <div class="control-group">
                                <h4>Отступы</h4>
                                <div class="control-options">
                                    <button class="style-btn" data-prop="padding" data-val="10px">S</button>
                                    <button class="style-btn" data-prop="padding" data-val="20px">M</button>
                                    <button class="style-btn" data-prop="padding" data-val="40px">L</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.applyTargetStyles(level.target);
        this.updateUserCard();

        this.container.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prop = btn.dataset.prop;
                const val = btn.dataset.val;
                
                this.styleLevelState[prop] = val;

                this.container.querySelectorAll(`.style-btn[data-prop="${prop}"]`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.updateUserCard();
                this.checkStyleWin(level);
            });
        });
    }

    applyTargetStyles(target) {
        const card = document.getElementById('targetCard');
        this.applyStylesToCard(card, target);
    }

    updateUserCard() {
        const card = document.getElementById('userCard');
        this.applyStylesToCard(card, this.styleLevelState);
    }

    applyStylesToCard(card, state) {
        card.style.background = state.bg;
        card.style.borderRadius = state.radius;
        card.style.boxShadow = state.shadow;
        card.style.border = state.border;
        card.style.padding = state.padding;
        card.style.alignItems = state.align === 'center' ? 'center' : (state.align === 'right' ? 'flex-end' : 'flex-start');
        
        // Icon
        const iconPlace = card.querySelector('.card-icon-placeholder');
        iconPlace.innerHTML = '';
        iconPlace.style.display = state.icon === 'none' ? 'none' : 'flex';
        if (state.icon !== 'none') {
            iconPlace.innerHTML = `<i class="fa-solid fa-${state.icon}" style="font-size: 24px; color: ${state.textColor}"></i>`;
        }
        
        // Text placeholders
        const placeholders = card.querySelectorAll('.card-text-placeholder');
        placeholders.forEach(p => p.style.background = state.textColor === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)');
        
        // Button placeholder
        const btn = card.querySelector('.card-btn-placeholder');
        btn.style.background = state.textColor === 'white' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)';
    }

    checkStyleWin(level) {
        const s = this.styleLevelState;
        const t = level.target;
        
        if (s.bg === t.bg && s.radius === t.radius && s.shadow === t.shadow &&
            s.textColor === t.textColor && s.border === t.border && 
            s.align === t.align && s.icon === t.icon && s.padding === t.padding) {
            setTimeout(() => this.levelComplete(), 500);
        }
    }

    // --- LEVEL 3: RESPONSIVE (SLIDERS) ---
    renderResponsiveLevel(level) {
        this.container.innerHTML = `
            <div class="frontend-game-container">
                <div class="game-timer" id="gameTimer">00:${this.timeLeft}</div>
                <div style="padding: 20px; height: 100%;">
                    ${this.renderLevelHeader(level)}
                    <div class="responsive-game-workspace">
                        <!-- 1. Phone Preview -->
                        <div class="phone-frame">
                            <div class="phone-content broken-padding broken-btn broken-grid broken-contrast" id="phoneContent">
                                <div class="phone-header">
                                    <div class="phone-logo">LOGO</div>
                                    <div class="phone-nav">
                                        <span>Меню</span>
                                    </div>
                                </div>
                                <img src="./assets/images/bg.png" class="content-img" alt="Hero">
                                <h3>Заголовок</h3>
                                <p class="content-text">
                                    Настройте размер шрифта, ширину картинки и отступы, чтобы этот текст легко читался.
                                </p>
                                
                                <div class="phone-grid">
                                    <div class="grid-item">Блок 1</div>
                                    <div class="grid-item">Блок 2</div>
                                    <div class="grid-item">Блок 3</div>
                                </div>

                                <button class="phone-btn">Кнопка</button>
                            </div>
                        </div>

                        <!-- 2. Controls (Center) -->
                        <div class="fix-controls">
                            <div class="controls-header">
                                <h3><i class="fa-solid fa-sliders"></i> Панель отладки</h3>
                                <p>Используй инструменты ниже</p>
                            </div>
                            <!-- Sliders -->
                            ${this.renderSliderControl('fontSize', 'Размер шрифта', '10px', 8, 24, 10, 'px', [12, 16, 20])}
                            ${this.renderSliderControl('imgWidth', 'Ширина картинки', '150%', 50, 150, 150, '%', [80, 100, 120])}
                            ${this.renderSliderControl('lineHeight', 'Межстрочный', '1.0', 0.8, 2.5, 1.0, '', [1.2, 1.5, 1.8], 0.1)}
                            ${this.renderSliderControl('letterSpacing', 'Трекинг', '-2px', -3, 5, -2, 'px', [0, 2, 4])}
                            ${this.renderSliderControl('borderRadius', 'Скругление', '0px', 0, 30, 0, 'px', [5, 10, 20])}

                            <!-- Buttons -->
                            <button class="fix-btn" id="btn-fix-padding">
                                <div class="fix-btn-header"><i class="fa-solid fa-compress"></i> Исправить отступы</div>
                                <div class="fix-btn-desc">Текст прилип к краям</div>
                            </button>

                            <button class="fix-btn" id="btn-fix-btn">
                                <div class="fix-btn-header"><i class="fa-solid fa-mobile-screen-button"></i> Исправить кнопку</div>
                                <div class="fix-btn-desc">Слишком маленькая</div>
                            </button>

                            <button class="fix-btn" id="btn-fix-grid">
                                <div class="fix-btn-header"><i class="fa-solid fa-table-cells"></i> Исправить сетку</div>
                                <div class="fix-btn-desc">Блоки слишком узкие</div>
                            </button>

                            <button class="fix-btn" id="btn-fix-contrast">
                                <div class="fix-btn-header"><i class="fa-solid fa-eye"></i> Исправить контраст</div>
                                <div class="fix-btn-desc">Текст плохо видно</div>
                            </button>
                        </div>

                        <!-- 3. TZ Panel (Right) -->
                        <div class="tz-panel">
                            <div class="tz-title">ТЗ от заказчика</div>
                            <div class="tz-item" id="tz-fontSize"><i class="fa-regular fa-circle"></i> Читаемый шрифт (14-18px)</div>
                            <div class="tz-item" id="tz-imgWidth"><i class="fa-regular fa-circle"></i> Картинка (90-100%)</div>
                            <div class="tz-item" id="tz-padding"><i class="fa-regular fa-circle"></i> Отступы от краев</div>
                            <div class="tz-item" id="tz-btn"><i class="fa-regular fa-circle"></i> Кнопка во всю ширину</div>
                            <div class="tz-item" id="tz-grid"><i class="fa-regular fa-circle"></i> Сетка в 1 колонку</div>
                            <div class="tz-item" id="tz-contrast"><i class="fa-regular fa-circle"></i> Контрастный текст</div>
                            <div class="tz-item" id="tz-lineHeight"><i class="fa-regular fa-circle"></i> Интервал строк (1.4-1.8)</div>
                            <div class="tz-item" id="tz-letterSpacing"><i class="fa-regular fa-circle"></i> Трекинг (0-1px)</div>
                            <div class="tz-item" id="tz-borderRadius"><i class="fa-regular fa-circle"></i> Скругление (8-20px)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup Sliders
        this.setupSlider('fontSize', 'px', (val) => {
            document.querySelector('.content-text').style.fontSize = val + 'px';
            document.querySelector('h3').style.fontSize = (parseInt(val) + 4) + 'px';
        });

        this.setupSlider('imgWidth', '%', (val) => {
            document.querySelector('.content-img').style.width = val + '%';
        });

        this.setupSlider('lineHeight', '', (val) => {
            document.querySelector('.content-text').style.lineHeight = val;
        }, true); // isFloat

        this.setupSlider('letterSpacing', 'px', (val) => {
            document.querySelector('.content-text').style.letterSpacing = val + 'px';
            document.querySelector('h3').style.letterSpacing = val + 'px';
        });

        this.setupSlider('borderRadius', 'px', (val) => {
            document.querySelector('.content-img').style.borderRadius = val + 'px';
            document.querySelectorAll('.grid-item').forEach(el => el.style.borderRadius = val + 'px');
            document.querySelector('.phone-btn').style.borderRadius = val + 'px';
        });

        // Setup Buttons
        const setupBtn = (id, prop) => {
            document.getElementById(id).addEventListener('click', () => {
                this.responsiveState[prop] = true;
                this.updateResponsivePreview();
                this.checkResponsiveWin();
            });
        };

        setupBtn('btn-fix-padding', 'paddingFixed');
        setupBtn('btn-fix-btn', 'btnFixed');
        setupBtn('btn-fix-grid', 'gridFixed');
        setupBtn('btn-fix-contrast', 'contrastFixed');
        
        // Initial apply
        this.updateResponsivePreview();
    }

    renderSliderControl(prop, label, displayVal, min, max, val, unit, presets, step = 1) {
        const presetsHtml = presets.map(p => 
            `<button class="preset-btn" data-for="${prop}" data-val="${p}">${p}${unit}</button>`
        ).join('');

        return `
            <div class="slider-control">
                <div class="slider-header">
                    <span>${label}</span>
                    <span class="slider-value" id="val-${prop}">${displayVal}</span>
                </div>
                <input type="range" id="input-${prop}" min="${min}" max="${max}" step="${step}" value="${val}">
                <div class="slider-ticks">
                    ${Array(5).fill(0).map(() => '<div class="tick"></div>').join('')}
                </div>
                <div class="slider-presets">
                    ${presetsHtml}
                </div>
            </div>
        `;
    }

    setupSlider(prop, unit, applyFn, isFloat = false) {
        const input = document.getElementById(`input-${prop}`);
        const display = document.getElementById(`val-${prop}`);
        
        // Input change
        input.addEventListener('input', (e) => {
            const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value);
            this.responsiveState[prop] = val;
            display.textContent = val + unit;
            applyFn(val);
            this.checkResponsiveWin();
        });

        // Presets
        document.querySelectorAll(`.preset-btn[data-for="${prop}"]`).forEach(btn => {
            btn.addEventListener('click', () => {
                const val = isFloat ? parseFloat(btn.dataset.val) : parseInt(btn.dataset.val);
                input.value = val;
                // Trigger input event manually
                input.dispatchEvent(new Event('input'));
            });
        });
    }

    updateResponsivePreview() {
        const s = this.responsiveState;
        
        // Sliders
        document.querySelector('.content-text').style.fontSize = s.fontSize + 'px';
        document.querySelector('h3').style.fontSize = (s.fontSize + 4) + 'px';
        document.querySelector('.content-img').style.width = s.imgWidth + '%';
        document.querySelector('.content-text').style.lineHeight = s.lineHeight;
        document.querySelector('.content-text').style.letterSpacing = s.letterSpacing + 'px';
        document.querySelector('h3').style.letterSpacing = s.letterSpacing + 'px';
        
        const radius = s.borderRadius + 'px';
        document.querySelector('.content-img').style.borderRadius = radius;
        document.querySelectorAll('.grid-item').forEach(el => el.style.borderRadius = radius);
        document.querySelector('.phone-btn').style.borderRadius = radius;
        
        // Buttons (Classes)
        const content = document.getElementById('phoneContent');
        
        const updateBtnState = (prop, id, brokenClass) => {
            if (s[prop]) {
                content.classList.remove(brokenClass);
                const btn = document.getElementById(id);
                btn.classList.add('fixed');
                btn.innerHTML = '<div class="fix-btn-header"><i class="fa-solid fa-check"></i> Исправлено</div>';
            } else {
                content.classList.add(brokenClass);
            }
        };

        updateBtnState('paddingFixed', 'btn-fix-padding', 'broken-padding');
        updateBtnState('btnFixed', 'btn-fix-btn', 'broken-btn');
        updateBtnState('gridFixed', 'btn-fix-grid', 'broken-grid');
        updateBtnState('contrastFixed', 'btn-fix-contrast', 'broken-contrast');
    }

    checkResponsiveWin() {
        const s = this.responsiveState;
        const t = this.levels[2].targets;
        
        const isCorrect = (val, target) => val >= target.min && val <= target.max;

        const fOk = isCorrect(s.fontSize, t.fontSize);
        const iOk = isCorrect(s.imgWidth, t.imgWidth);
        const lOk = isCorrect(s.lineHeight, t.lineHeight);
        const lsOk = isCorrect(s.letterSpacing, t.letterSpacing);
        const brOk = isCorrect(s.borderRadius, t.borderRadius);
        
        const pOk = s.paddingFixed === t.paddingFixed;
        const bOk = s.btnFixed === t.btnFixed;
        const gOk = s.gridFixed === t.gridFixed;
        const cOk = s.contrastFixed === t.contrastFixed;

        // Visual feedback for sliders
        document.getElementById('input-fontSize').classList.toggle('correct', fOk);
        document.getElementById('input-imgWidth').classList.toggle('correct', iOk);
        document.getElementById('input-lineHeight').classList.toggle('correct', lOk);
        document.getElementById('input-letterSpacing').classList.toggle('correct', lsOk);
        document.getElementById('input-borderRadius').classList.toggle('correct', brOk);

        // Update TZ Panel
        const updateTz = (id, ok) => {
            const el = document.getElementById('tz-' + id);
            if (ok) {
                el.classList.add('done');
                el.querySelector('i').className = 'fa-solid fa-circle-check';
            } else {
                el.classList.remove('done');
                el.querySelector('i').className = 'fa-regular fa-circle';
            }
        };

        updateTz('fontSize', fOk);
        updateTz('imgWidth', iOk);
        updateTz('padding', pOk);
        updateTz('btn', bOk);
        updateTz('grid', gOk);
        updateTz('contrast', cOk);
        updateTz('lineHeight', lOk);
        updateTz('letterSpacing', lsOk);
        updateTz('borderRadius', brOk);

        if (fOk && iOk && lOk && lsOk && brOk && pOk && bOk && gOk && cOk) {
            setTimeout(() => this.levelComplete(), 1000);
        }
    }


    // --- COMMON ---
    startTimer() {
        const timerEl = document.getElementById('gameTimer');
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            if (timerEl) timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timeLeft <= 5 && timerEl) timerEl.classList.add('warning');

            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    levelComplete() {
        clearInterval(this.timerInterval);
        
        if (this.currentLevelIndex < this.levels.length - 1) {
            const overlay = document.createElement('div');
            overlay.className = 'game-overlay';
            overlay.innerHTML = `
                <h2>Уровень пройден! 🚀</h2>
                <p>Отлично справляешься! Переходим к следующему этапу.</p>
                <button class="btn-game-start" id="nextLevelBtn">Далее</button>
            `;
            this.container.querySelector('.frontend-game-container').appendChild(overlay);
            document.getElementById('nextLevelBtn').addEventListener('click', () => {
                this.startLevel(this.currentLevelIndex + 1);
            });
        } else {
            this.endGame(true);
        }
    }

    endGame(success) {
        clearInterval(this.timerInterval);
        this.isGameActive = false;

        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        
        if (success) {
            overlay.innerHTML = `
                <h2>Ты прошел игру! 🏆</h2>
                <p>Поздравляем! Ты освоил базу фронтенда: структуру, стили и адаптив.<br>
                Это было круто!</p>
                <button class="btn-game-restart" id="backToGamesBtn">К играм</button>
            `;
        } else {
            overlay.innerHTML = `
                <h2>Время вышло! ⏰</h2>
                <p>Ничего страшного, попробуй еще раз.</p>
                <button class="btn-game-restart" id="restartGameBtn">Попробовать снова</button>
            `;
        }

        this.container.querySelector('.frontend-game-container').appendChild(overlay);
        
        if (success) {
            const btn = overlay.querySelector('#backToGamesBtn');
            if (btn) {
                btn.addEventListener('click', () => {
                    const backBtn = document.getElementById('backToGrid');
                    if (backBtn) {
                        backBtn.click();
                    } else {
                        window.location.reload();
                    }
                });
            }
        } else {
            const btn = overlay.querySelector('#restartGameBtn');
            if (btn) {
                btn.addEventListener('click', () => this.startLevel(0));
            }
        }
    }
}

window.FrontendGame = FrontendGame;
