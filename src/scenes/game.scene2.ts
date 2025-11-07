import { sizes, speedDown } from '../consts/game.consts';

export class GameScene extends Phaser.Scene {
  private bgMusic!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerSpeed: number = speedDown;

  constructor() {
    super('scene-game');
  }

  preload() {
    this.load.image('bg', 'assets/bg.png');
    this.load.audio('bgMusic', 'assets/bgMusic.mp3');

    this.load.image('player', 'assets/basket.png');
  }

  create() {
    this.add.image(0, 0, 'bg').setOrigin(0, 0);
    this.bgMusic = this.sound.add('bgMusic');

    this.player = this.physics.add.image(0, sizes.height - 100, 'player').setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;

    this.cursor = this.input.keyboard?.createCursorKeys()!;
    // this.bgMusic.play();
  }

  update() {
    const { left, right } = this.cursor;
    if (left.isDown) {
      console.log('ESQUERDA!');
    } else if (right.isDown) {
      console.log('DIREITA!');
    }
  }
}
