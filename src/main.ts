import Phaser from 'phaser';

import { Player } from './objects/Player';
import { Ground } from './objects/Ground';
import { Enemy } from './objects/Enemy';
import { fixOverlap } from './util';
import { isKinematicCharacter } from './interfaces/KinematicCharacter';

import './global.ts';

class GameScene extends Phaser.Scene {
  player!: Player;
  ground!: Ground;
  ground2!: Ground;
  enemy!: Enemy;

  preload(): void {
    this.load.baseURL = 'assets/';
    this.load.image('player', 'sprites/ninja_idle_1.png');
    this.load.atlas(
      'a-player',
      'sprites/ninja.png',
      'sprites/ninja_atlas.json'
    );
  }

  create(): void {
    var rect = new Phaser.Geom.Rectangle(250, 250, 250, 250);
    var graphics = this.add.graphics({ fillStyle: { color: 0xff69b4 } });
    graphics.fillRectShape(rect);

    this.ground = new Ground(this, 512, 512, 1000, 100, 0xeeae11);
    this.ground2 = new Ground(this, 600, 400, 60, 250, 0xffee33);
    var grounds = this.add.group([this.ground, this.ground2]);

    this.player = new Player(this, 50, 100, 'player');
    this.enemy = new Enemy(this, 700, 100, 40, 80, 0xff1122);
    var characters = this.add.group([this.player, this.enemy]);

    this.cameras.main.setBounds(-480, 0, 1920, 768);
    this.cameras.main.startFollow(this.player, true, 0.07, 0.07);

    this.physics.add.collider(characters, grounds, (obj, grnd) => {
      if (obj.body.touching.down && grnd.body.touching.up) {
        if (isKinematicCharacter(obj)) {
          obj.onGroundTouched(this.ground);
        }
      }
      if (obj.body.touching.left || obj.body.touching.right) {
        if (isKinematicCharacter(obj)) {
          obj.onWallTouched(this.ground);
        }
      }
    });
    this.physics.add.overlap(characters, this.ground2, (obj1, obj2) => {
      if (isKinematicCharacter(obj1)) {
        fixOverlap(obj1, obj2);
      }
    });
  }

  update(time: number, delta: number): void {
    this.player?.update(time, delta);
    this.enemy?.update();
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
game.input.mouse.disableContextMenu(); // to avoid input breaking if you move and open right click menu
