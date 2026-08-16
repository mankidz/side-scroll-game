// キャンバスと2Dコンテキスト
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲーム状態
const game = {
    isRunning: true,
    score: 0,
    life: 3,
    level: 1,
    frameCount: 0
};

// プレイヤー
const player = {
    x: 50,
    y: 250,
    width: 30,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    speed: 5,
    jumpPower: 15,
    isJumping: false,
    color: '#FF6B6B'
};

// 物理定数
const GRAVITY = 0.6;
const GROUND_LEVEL = 320;

// キー入力状態
const keys = {
    left: false,
    right: false,
    space: false
};

// 敵配列
let enemies = [];
let platforms = [];
let coins = [];

// イベントリスナー
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ') {
        keys.space = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === ' ') keys.space = false;
});

// プレイヤーの更新
function updatePlayer() {
    // 横移動
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;

    // 画面端の制限
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // ジャンプ
    if (keys.space && !player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }

    // 重力適用
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // 地面判定
    if (player.y + player.height >= GROUND_LEVEL) {
        player.y = GROUND_LEVEL - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
}

// 敵の生成
function spawnEnemy() {
    if (game.frameCount % 100 === 0) {
        enemies.push({
            x: canvas.width,
            y: GROUND_LEVEL - 30,
            width: 30,
            height: 30,
            speed: 3,
            color: '#4ECDC4'
        });
    }
}

// 敵の更新
function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.x -= enemy.speed;
        return enemy.x + enemy.width > 0;
    });
}

// コインの生成
function spawnCoin() {
    if (game.frameCount % 120 === 0) {
        coins.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (GROUND_LEVEL - 100) + 50,
            width: 15,
            height: 15,
            radius: 7.5,
            color: '#FFD93D'
        });
    }
}

// コインの更新
function updateCoins() {
    coins = coins.filter(coin => {
        // プレイヤーとの衝突判定
        if (isColliding(player, coin)) {
            game.score += 10;
            return false;
        }
        return true;
    });
}

// 衝突判定
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 敵との衝突判定
function checkEnemyCollisions() {
    enemies.forEach(enemy => {
        if (isColliding(player, enemy)) {
            game.life--;
            game.score = Math.max(0, game.score - 50);
            
            // プレイヤーをリセット
            player.x = 50;
            player.y = GROUND_LEVEL - player.height;
            player.velocityY = 0;
            
            if (game.life <= 0) {
                endGame(false);
            }
        }
    });
}

// ゴール判定（右端に到達）
function checkGoal() {
    if (player.x + player.width >= canvas.width - 20 && game.frameCount > 60) {
        game.score += 500;
        endGame(true);
    }
}

// ゲーム終了
function endGame(isWin) {
    game.isRunning = false;
    const modal = document.getElementById('gameOverScreen');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');

    if (isWin) {
        title.textContent = '🎉 ステージクリア!';
        message.textContent = `スコア: ${game.score}`;
    } else {
        title.textContent = '💀 ゲームオーバー';
        message.textContent = `スコア: ${game.score}`;
    }

    modal.classList.remove('hidden');
}

// 描画関数
function draw() {
    // 背景クリア
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地面
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, GROUND_LEVEL, canvas.width, canvas.height - GROUND_LEVEL);

    // プレイヤー描画
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 目を描画
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 8, player.y + 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // 敵描画
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // コイン描画
    coins.forEach(coin => {
        ctx.fillStyle = coin.color;
        ctx.beginPath();
        ctx.arc(coin.x + coin.radius, coin.y + coin.radius, coin.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // ゴール（右端の目印）
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(canvas.width - 20, GROUND_LEVEL - 50, 20, 50);
}

// UIの更新
function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('life').textContent = game.life;
}

// メインゲームループ
function gameLoop() {
    if (!game.isRunning) return;

    game.frameCount++;

    updatePlayer();
    spawnEnemy();
    updateEnemies();
    spawnCoin();
    updateCoins();
    checkEnemyCollisions();
    checkGoal();

    draw();
    updateUI();

    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();