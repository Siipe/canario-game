import Phaser from 'phaser';

import { sizes, speedDown } from '../consts/game.consts';
import { GameScene } from '../scenes/game.scene2';

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
