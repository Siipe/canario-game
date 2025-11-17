enum PlayerState {
  Vulnerable,
  InvincibleBomb,
  InvinciblePowerUp,
  Dead,
}

export class GameScene extends Phaser.Scene {
  private bgMusic!: Phaser.Sound.BaseSound;
  private starSound!: Phaser.Sound.BaseSound;
  private bombSound!: Phaser.Sound.BaseSound;
  private gameoverSound!: Phaser.Sound.BaseSound;
  private invincibleSound!: Phaser.Sound.BaseSound;
  private powerUpSound!: Phaser.Sound.BaseSound;
  private bombDisappearSound!: Phaser.Sound.BaseSound;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private stars!: Phaser.Physics.Arcade.Group;
  private bombs!: Phaser.Physics.Arcade.Group;
  private powerUp!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private blinkEvent?: Phaser.Time.TimerEvent;
  private score = 0;
  private lives = 5;
  private playerState = PlayerState.Vulnerable;

  constructor() {
    super('scene-game');
  }

  preload() {
    this.load.audio('bgMusic', 'assets2/bgMusic.mp3');
    this.load.audio('starSound', 'assets2/coin.mp3');
    this.load.audio('bombSound', 'assets2/loss.mp3');
    this.load.audio('gameoverSound', 'assets2/gameover.mp3');
    this.load.audio('invincibleSound', 'assets2/invincible.mp3');
    this.load.audio('powerUpSound', 'assets2/powerUp.mp3');
    this.load.audio('bombDisappearSound', 'assets2/buiu.mp3');

    this.load.image('sky', 'assets2/sky.png');
    this.load.image('ground', 'assets2/platform.png');
    this.load.image('star', 'assets2/star.png');
    this.load.image('bomb', 'assets2/bomb.png');
    this.load.spritesheet('dude', 'assets2/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.bgMusic = this.sound.add('bgMusic');
    this.starSound = this.sound.add('starSound');
    this.bombSound = this.sound.add('bombSound');
    this.gameoverSound = this.sound.add('gameoverSound');
    this.invincibleSound = this.sound.add('invincibleSound');
    this.powerUpSound = this.sound.add('powerUpSound');
    this.bombDisappearSound = this.sound.add('bombDisappearSound');

    this.bgMusic.play({ loop: true });

    this.add.image(0, 0, 'sky').setOrigin(0, 0);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(300);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard?.createCursorKeys()!;

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 5,
      setXY: { x: 12, y: 0, stepX: 150 },
    });

    this.stars.children.iterate((child) => {
      const childImage = child as Phaser.Physics.Arcade.Image;
      childImage.setBounce(0.8).setVelocity(70, 70).setCollideWorldBounds(true);
      return null;
    });

    this.powerUp = this.physics.add
      .image(0, 0, 'star')
      .setOrigin(0, 0)
      .setTint(0x00ff00)
      .setCollideWorldBounds(true)
      .disableBody(true, true);

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
    this.physics.add.overlap(this.player, this.powerUp, this.hitPowerUp, undefined, this);

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);

    this.physics.add.collider(this.powerUp, this.platforms);

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });
    this.livesText = this.add.text(16, 55, '❤️ '.repeat(this.lives), {
      fontSize: '18px',
      color: '#000',
    });
  }

  update() {
    if (this.playerState === PlayerState.Dead) {
      return;
    }

    const { left, right, space } = this.cursors;

    if (left.isDown) {
      this.player.setVelocityX(-300);

      this.player.anims.play('left', true);
    } else if (right.isDown) {
      this.player.setVelocityX(400);

      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-480);
    }
  }

  private collectStar(
    _: unknown,
    star:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ) {
    this.starSound.play();
    (star as Phaser.Physics.Arcade.Image).disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.stars.countActive(true) === 0) {
      let starX = 12;
      this.stars.children.iterate((child) => {
        const childImage = child as Phaser.Physics.Arcade.Image;
        childImage
          .enableBody(true, starX, 0, true, true)
          .setBounce(0.8)
          .setVelocity(70, 70)
          .setCollideWorldBounds(true);

        if (this.stars.children.size <= 2) {
          childImage.body!.checkCollision.none = true;

          this.time.delayedCall(1_000, () => {
            childImage.body!.checkCollision.none = false;
          });
        }

        starX += 150;

        return null;
      });

      const x = this.player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 80);

      if (this.bombs.countActive(true) >= 2 && !this.powerUp.body.enable) {
        this.powerUp
          .enableBody(true, Math.floor(Math.random() * (800 - 20)), 0, true, true)
          .setBounce(1)
          .setVelocity(100, 100);
      }
    }
  }

  private hitPowerUp() {
    if (this.playerState === PlayerState.InvinciblePowerUp) {
      return;
    }

    this.powerUp.disableBody(true, true);
    this.powerUpSound.play();
    this.makeInvinciblePowerUp();
  }

  private hitBomb(
    _: unknown,
    bomb:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ) {
    if (this.playerState === PlayerState.InvincibleBomb) {
      return;
    }

    if (this.playerState === PlayerState.InvinciblePowerUp) {
      (bomb as Phaser.Physics.Arcade.Image).destroy();
      this.bombDisappearSound.play();
      return;
    }

    this.makeInvincibleBomb();
    this.cameras.main.shake(100, 0.01);
    this.lives--;
    this.livesText.setText('❤️ '.repeat(this.lives));
    this.player.setTint(0xff0000);

    if (this.lives <= 0) {
      this.bgMusic.stop();
      this.gameoverSound.play();
      this.physics.pause();
      this.player.anims.play('turn');
      this.stopBlinking();
      this.playerState = PlayerState.Dead;
    } else {
      this.bombSound.play();
      this.time.delayedCall(500, () => this.player.clearTint());
    }
  }

  private startBlinking() {
    this.blinkEvent = this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        this.player.alpha = this.player.alpha === 1 ? 0.3 : 1;
      },
    });
  }

  private stopBlinking() {
    if (this.blinkEvent) {
      this.blinkEvent.remove();
      this.blinkEvent = undefined;
    }

    this.player.setAlpha(1);
  }

  private makeInvinciblePowerUp() {
    if (this.playerState === PlayerState.InvinciblePowerUp) {
      return;
    }

    this.playerState = PlayerState.InvinciblePowerUp;
    this.startBlinking();
    this.bgMusic.pause();
    this.invincibleSound.play();

    this.time.delayedCall(5_000, () => {
      this.playerState = PlayerState.Vulnerable;
      this.stopBlinking();
      this.invincibleSound.stop();
      this.bgMusic.play({ loop: true });
    });
  }

  private makeInvincibleBomb() {
    if (this.playerState === PlayerState.InvincibleBomb) {
      return;
    }

    this.playerState = PlayerState.InvincibleBomb;
    this.startBlinking();

    this.time.delayedCall(1_000, () => {
      this.playerState = PlayerState.Vulnerable;
      this.stopBlinking();
    });
  }
}
