import Phaser from 'phaser';
import { Player } from './entities/Player';
import { Ground } from './entities/Ground';

class GameScene extends Phaser.Scene {
  player?: Player;
  ground?: Ground;

  create(): void {
    var rect = new Phaser.Geom.Rectangle(250, 250, 250, 250);
    var graphics = this.add.graphics({ fillStyle: { color: 0xff69b4 } });
    graphics.fillRectShape(rect);
    this.player = new Player(this, 50, 100, 50, 50, 0x002fa7);
    this.ground = new Ground(this, 512, 512, 1024, 100, 0xeeae11);
    this.physics.add.collider(
      this.player,
      this.ground,
      this.player.onGroundTouched,
    );
  }

  update(_time: number, delta: number): void {
    this.player?.update(_time, delta);
  }
}

const config = {
  width: 1024,
  height: 768,
  type: Phaser.AUTO,
  scene: [GameScene],
  useTicker: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 3000 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
