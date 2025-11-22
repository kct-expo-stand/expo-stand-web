document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero-section');
    
    function updateHeaderVisibility() {
        if (!heroSection) return;
        
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        
        if (heroBottom < 100) {
            header.classList.remove('hidden-header');
            header.classList.add('visible-header');
        } else {
            header.classList.add('hidden-header');
            header.classList.remove('visible-header');
        }
    }

    window.addEventListener('scroll', updateHeaderVisibility);
    updateHeaderVisibility();

    const customSelect = document.getElementById('customSelect');
    const customSelectTrigger = customSelect.querySelector('.custom-select-trigger');
    const customOptions = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('direction');
    const selectedText = document.getElementById('selectedOptionText');

    customSelectTrigger.addEventListener('click', function() {
        customSelect.classList.toggle('open');
    });

    customOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const title = this.querySelector('.option-title').textContent;
            
            hiddenInput.value = value;
            selectedText.textContent = title;
            
            customOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            customSelect.classList.remove('open');
        });
    });

    document.addEventListener('click', function(e) {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    const cards = document.querySelectorAll('.game-card');
    const gridView = document.getElementById('gamesGrid');
    const activeView = document.getElementById('gameActive');
    const backButton = document.getElementById('backToGrid');
    const canvas = document.getElementById('transitionCanvas');
    const ctx = canvas.getContext('2d');

    const gamesData = {
        frontend: { title: 'FrontEnd', desc: 'Создание интерфейсов', icon: '<i class="fa-brands fa-react"></i>' },
        backend: { title: 'BackEnd', desc: 'Серверная логика', icon: '<i class="fa-brands fa-node-js"></i>' },
        gamedev: { title: 'GameDev', desc: 'Разработка игр', icon: '<i class="fa-brands fa-unity"></i>' },
        uxui: { title: 'UX/UI', desc: 'Дизайн интерфейсов', icon: '<i class="fa-solid fa-pen-nib"></i>' },
        pm: { title: 'Project Manager', desc: 'Управление проектами', icon: '<i class="fa-solid fa-list-check"></i>' },
        sysadmin: { title: 'SysAdmin', desc: 'Администрирование', icon: '<i class="fa-solid fa-server"></i>' }
    };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let isAnimating = false;

    function drawRipple(x, y, color, callback) {
        let radius = 0;
        const maxRadius = Math.max(canvas.width, canvas.height) * 1.5;
        const speed = maxRadius / 30;

        function animate() {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            radius += speed;

            if (radius < maxRadius) {
                requestAnimationFrame(animate);
            } else {
                callback();
            }
        }
        animate();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (isAnimating) return;
            isAnimating = true;

            const gameKey = this.getAttribute('data-game');
            const data = gamesData[gameKey];
            const rect = this.getBoundingClientRect();
            const clickX = rect.left + rect.width / 2;
            const clickY = rect.top + rect.height / 2;

            drawRipple(clickX, clickY, '#C805B7', () => {
                gridView.classList.add('hidden');
                activeView.classList.add('active');
                
                header.style.display = 'none';

                document.getElementById('activeGameTitle').textContent = data.title;
                document.getElementById('activeGameDesc').textContent = data.desc;
                document.getElementById('activeGameIcon').innerHTML = data.icon;

                // Initialize specific game
                const frame = document.querySelector('.game-container-frame');
                // Reset content
                frame.innerHTML = '<div id="activeGameContainer" class="game-placeholder-screen"></div>';
                const gameContainer = document.getElementById('activeGameContainer');

                if (gameKey === 'frontend') {
                    gameContainer.className = 'game-container-full';
                    new FrontendGame('activeGameContainer');
                } else if (gameKey === 'backend') {
                    gameContainer.className = 'game-container-full';
                    const game = new BackendGame();
                    game.start(gameContainer);
                } else {
                    // Default placeholder for other games
                    gameContainer.innerHTML = `
                        <div class="loader"></div>
                        <span>Модуль ${data.title} в разработке...</span>
                    `;
                }

                canvas.style.transition = 'opacity 0.5s ease';
                canvas.style.opacity = '0';

                setTimeout(() => {
                    clearCanvas();
                    canvas.style.opacity = '1';
                    canvas.style.transition = 'none';
                    isAnimating = false;
                }, 500);
            });
        });
    });

    backButton.addEventListener('click', function() {
        if (isAnimating) return;
        isAnimating = true;

        activeView.classList.remove('active');
        gridView.classList.remove('hidden');
        
        header.style.display = '';

        // Reset game container
        const frame = document.querySelector('.game-container-frame');
        frame.innerHTML = `
            <div class="game-placeholder-screen">
                <div class="loader"></div>
                <span>Загрузка модуля...</span>
            </div>
        `;
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    });
});