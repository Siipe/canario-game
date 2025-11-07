import { sizes, speedDown } from '../consts/game.consts';

export class GameScene extends Phaser.Scene {
  private coinSound!: Phaser.Sound.BaseSound;
  private lossSound!: Phaser.Sound.BaseSound;
  private bgMusic!: Phaser.Sound.BaseSound;
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private target!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  private textScore!: Phaser.GameObjects.Text;
  private textErrors!: Phaser.GameObjects.Text;
  private points = 0;
  private errors = 0;
  private playerSpeed = speedDown + 50;
  private isMobile = false;
  private leftPressed = false;
  private rightPressed = false;

  constructor() {
    super('scene-game');
  }

  preload() {
    this.load.image('bg', '/assets/bg.png');
    this.load.image('basket', '/assets/basket.png');
    this.load.image('apple', '/assets/apple.png');
    this.load.audio('coin', '/assets/coin.mp3');
    this.load.audio('loss', '/assets/loss.mp3');
    this.load.audio('bgMusic', '/assets/bgMusic.mp3');
  }

  create() {
    // 🎵 Sounds
    this.coinSound = this.sound.add('coin');
    this.lossSound = this.sound.add('loss');
    this.bgMusic = this.sound.add('bgMusic');
    this.bgMusic.play({ loop: true, volume: 0.4 });

    // 🖼️ Background
    this.add.image(0, 0, 'bg').setOrigin(0, 0);

    // 🧺 Player
    this.player = this.physics.add.image(0, sizes.height - 100, 'basket').setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    this.player
      .setSize(this.player.width - this.player.width / 4, this.player.height / 6)
      .setOffset(this.player.width / 10, this.player.height - this.player.height / 10);

    // 🍎 Target
    this.target = this.physics.add.image(this.getRandomX(), 0, 'apple').setOrigin(0, 0);
    this.target.setMaxVelocity(0, speedDown * 1.5);

    // ⚡ Overlap detection
    this.physics.add.overlap(this.target, this.player, this.targetHit, undefined, this);

    // 🎮 Input
    this.cursor = this.input.keyboard?.createCursorKeys()!;

    // 🧠 Mobile detection
    this.isMobile = !this.sys.game.device.os.desktop;

    // 🧱 UI
    this.textScore = this.add.text(sizes.width - 90, 10, 'Score: 0', {
      font: '20px Arial',
      color: '#000000',
    });

    this.textErrors = this.add.text(sizes.width - 90, 40, 'Lost: 0', {
      font: '20px Arial',
      color: '#000000',
    });

    // 📱 Arcade-style touch buttons
    if (this.isMobile) {
      this.createMobileControls();
    }
  }

  update() {
    if (this.errors >= 10) {
      this.sys.game.destroy(false);
      alert('Perdeu otário!');
      return;
    }

    if (this.points >= 10) {
      this.sys.game.destroy(false);
      alert('Parabéns!');
      return;
    }

    // ❌ Missed the apple
    if (this.target.y >= sizes.height) {
      this.errors++;
      this.textErrors.setText(`Lost: ${this.errors}`);
      this.lossSound.play();
      this.resetTarget();
    }

    // 🕹️ Movement
    if (!this.isMobile) {
      const { left, right } = this.cursor;
      if (left.isDown) {
        this.player.setVelocityX(-this.playerSpeed);
      } else if (right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
      } else {
        this.player.setVelocityX(0);
      }
    } else {
      if (this.leftPressed) {
        this.player.setVelocityX(-this.playerSpeed);
      } else if (this.rightPressed) {
        this.player.setVelocityX(this.playerSpeed);
      } else {
        this.player.setVelocityX(0);
      }
    }
  }

  private createMobileControls() {
    const buttonWidth = sizes.width / 2;

    // Left button
    const leftButton = this.add
      .rectangle(0, sizes.height - 100, buttonWidth, 100, 0x000000, 0.0001)
      .setOrigin(0, 0)
      .setInteractive();

    // Right button
    const rightButton = this.add
      .rectangle(buttonWidth, sizes.height - 100, buttonWidth, 100, 0x000000, 0.0001)
      .setOrigin(0, 0)
      .setInteractive();

    // Hold controls
    leftButton.on('pointerdown', () => (this.leftPressed = true));
    leftButton.on('pointerup', () => (this.leftPressed = false));
    leftButton.on('pointerout', () => (this.leftPressed = false));

    rightButton.on('pointerdown', () => (this.rightPressed = true));
    rightButton.on('pointerup', () => (this.rightPressed = false));
    rightButton.on('pointerout', () => (this.rightPressed = false));

    // Optional: show faint arrows
    const arrowStyle = { font: '40px Arial', color: '#00000055' };
    const margin = 20; // distance from each screen edge
    const y = sizes.height - 10; // a small margin from bottom

    this.add.text(margin, y, '◀', arrowStyle).setOrigin(0, 1);
    this.add.text(sizes.width - margin, y, '▶', arrowStyle).setOrigin(1, 1);
  }

  private resetTarget() {
    this.target.setY(0);
    this.target.setX(this.getRandomX());
  }

  private getRandomX() {
    return Math.floor(Math.random() * (sizes.width - 20));
  }

  private targetHit() {
    this.coinSound.play();
    this.resetTarget();
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
  }
}
