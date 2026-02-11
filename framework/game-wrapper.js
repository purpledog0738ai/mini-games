/**
 * 미니게임 공통 프레임워크
 * 전체화면 오버레이 + 썸네일 지원
 */

class GameWrapper {
    constructor() {
        this.state = 'ready'; // ready, playing, dead
        this.game = null;
        this.overlay = null;
        this.init();
    }

    init() {
        this.createOverlay();
        this.waitForGame();
    }

    createOverlay() {
        const style = document.createElement('style');
        style.textContent = `
            .game-overlay-ui {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                cursor: pointer;
                opacity: 1;
                transition: opacity 0.3s;
                font-family: 'Segoe UI', -apple-system, sans-serif;
                -webkit-tap-highlight-color: transparent;
            }
            .game-overlay-ui.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .overlay-thumbnail {
                width: 120px;
                height: 120px;
                border-radius: 24px;
                background: rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 60px;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            .overlay-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .overlay-title {
                font-size: 28px;
                font-weight: bold;
                color: #fff;
                margin-bottom: 15px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            }
            .overlay-text {
                font-size: 20px;
                color: rgba(255, 255, 255, 0.9);
                text-align: center;
                animation: pulse 2s ease-in-out infinite;
            }
            .overlay-text.retry {
                color: #ff6b6b;
            }
            .overlay-score {
                font-size: 48px;
                font-weight: bold;
                color: #00d4ff;
                margin: 20px 0;
                text-shadow: 0 0 20px rgba(0,212,255,0.5);
            }
            .overlay-hint {
                position: absolute;
                bottom: 40px;
                font-size: 14px;
                color: rgba(255,255,255,0.4);
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);

        this.overlay = document.createElement('div');
        this.overlay.className = 'game-overlay-ui';
        this.overlay.innerHTML = `
            <div class="overlay-thumbnail" id="overlayThumb">🎮</div>
            <div class="overlay-title" id="overlayTitle">로딩중...</div>
            <div class="overlay-score hidden" id="overlayScore"></div>
            <div class="overlay-text" id="overlayText">터치하여 시작</div>
        `;
        document.body.appendChild(this.overlay);

        // 전체 오버레이 클릭/터치
        this.overlay.addEventListener('click', () => this.handleAction());
        this.overlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleAction();
        });
    }

    waitForGame() {
        const check = () => {
            if (window.GAME) {
                this.game = window.GAME;
                // 게임 정보로 오버레이 업데이트
                const thumbEl = document.getElementById('overlayThumb');
                if (this.game.image) {
                    thumbEl.innerHTML = `<img src="${this.game.image}" alt="${this.game.name}">`;
                } else {
                    thumbEl.textContent = this.game.emoji || '🎮';
                }
                document.getElementById('overlayTitle').textContent = this.game.name || '게임';
                console.log('🎮 게임 등록됨:', this.game.name);
            } else {
                requestAnimationFrame(check);
            }
        };
        check();
    }

    handleAction() {
        if (this.state === 'ready' || this.state === 'dead') {
            this.state = 'playing';
            this.overlay.classList.add('hidden');
            
            if (this.game) {
                if (this.game.reset) this.game.reset();
                if (this.game.start) this.game.start();
            }
        }
    }

    gameOver(score) {
        this.state = 'dead';
        
        const titleEl = document.getElementById('overlayTitle');
        const textEl = document.getElementById('overlayText');
        const scoreEl = document.getElementById('overlayScore');
        
        titleEl.textContent = 'Game Over';
        textEl.textContent = '터치하여 다시 시도';
        textEl.classList.add('retry');
        
        if (score !== undefined) {
            scoreEl.textContent = score;
            scoreEl.classList.remove('hidden');
        }
        
        this.overlay.classList.remove('hidden');
    }

    reset() {
        this.state = 'ready';
        const titleEl = document.getElementById('overlayTitle');
        const textEl = document.getElementById('overlayText');
        const scoreEl = document.getElementById('overlayScore');
        
        titleEl.textContent = this.game?.name || '게임';
        textEl.textContent = '터치하여 시작';
        textEl.classList.remove('retry');
        scoreEl.classList.add('hidden');
        
        this.overlay.classList.remove('hidden');
    }
}

window.gameWrapper = new GameWrapper();
window.gameOver = (score) => window.gameWrapper.gameOver(score);
