import Phaser from 'phaser';
import { Player } from './objects/Player';
import { Ground } from './objects/Ground';

import './global.ts';
import { Enemy } from './objects/Enemy';

class GameScene extends Phaser.Scene {
  player?: Player;
  ground?: Ground;
  ground2?: Ground;
  enemy?: Enemy;

  create(): void {
    var rect = new Phaser.Geom.Rectangle(250, 250, 250, 250);
    var graphics = this.add.graphics({ fillStyle: { color: 0xff69b4 } });
    graphics.fillRectShape(rect);
    this.player = new Player(this, 50, 100, 50, 50, 0x002fa7);
    this.ground = new Ground(this, 512, 512, 1024, 100, 0xeeae11);
    this.ground2 = new Ground(this, 600, 400, 60, 100, 0xffee33);
    this.enemy = new Enemy(this, 700, 100, 40, 80, 0xff1122);
    var characters = this.add.group([this.player, this.enemy]);
    this.physics.add.collider(characters, this.ground, (obj) => {
      if (obj instanceof Player || obj instanceof Enemy) {
        obj.onGroundTouched();
      }
    });
    this.physics.add.collider(
      characters,
      this.ground2,
      this.player.onGroundTouched
    );
  }

  update(_time: number, delta: number): void {
    this.player?.update(_time, delta);
    this.enemy?.update(_time, delta);
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
