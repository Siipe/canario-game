import Phaser from 'phaser';

import { sizes, speedDown } from '../consts/game.consts';
import { GameScene as GameScene3 } from '../scenes/game.scene3';
import { GameScene } from '../scenes/game.scene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: document.querySelector<HTMLCanvasElement>('#gameCanvas')!,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: speedDown, x: 0 },
      debug: true,
    },
  },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  backgroundColor: '#000000',
};

export const config2: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  scene: [GameScene3],
  canvas: document.querySelector<HTMLCanvasElement>('#gameCanvas')!,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: false,
    },
  },
};
