import { interpret, Interpreter } from 'xstate';
import { Movement } from '../components/Movement';
import { IKinematicCharacter } from '../interfaces/KinematicCharacter';
import { EnemyContext, EnemyEvent } from '../states/config/EnemyStateConfig';
import { EnemyStates } from '../states/EnemyStates';
import { CharacterState, EventType } from '../states/config/States';
import { PhaserRB } from '../util';

export class Enemy
  extends Phaser.GameObjects.Rectangle
  implements IKinematicCharacter {
  body!: Phaser.Physics.Arcade.Body;
  edgeRay: Phaser.Geom.Line;

  private interpreter: Interpreter<EnemyContext, any, EnemyEvent>;
  private graphics: Phaser.GameObjects.Graphics;
  private move: Movement;
  private obstacles: Phaser.GameObjects.GameObject[];
  private obstacleIndex: PhaserRB;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ) {
    super(scene, x, y, width, height, color);
    scene.physics.add.existing(this);
    this.move = new Movement(this.body, {
      speed: 150,
      slip: 0.1,
      airMomentum: 150,
    });
    this.interpreter = interpret(EnemyStates(this.move));
    this.interpreter.start();
    this.edgeRay = new Phaser.Geom.Line(
      x + width / 2,
      y - height / 2,
      x + width / 2,
      y + height / 1.5
    );

    scene.add.existing(this);
    this.graphics = scene.add.graphics();
    this.graphics.strokeLineShape(this.edgeRay);
    this.graphics.lineStyle(2, 0x00ff00);
    this.obstacles = [];
    this.obstacleIndex = new PhaserRB();
  }

  update(): void {
    // update and draw edge detection ray
    this.edgeRay.setTo(
      this.x + (this.width / 2) * this.move.directionX,
      this.y - this.height / 2,
      this.x + (this.width / 2) * this.move.directionX,
      this.y + this.height / 1.5
    );
    this.graphics.clear();
    this.graphics.lineStyle(2, 0x00ff00);
    this.graphics.strokeLineShape(this.edgeRay);

    // handle edge detection ray leaving edge
    if (
      !this.obstacleIndex.collides({
        minX: this.edgeRay.x1,
        minY: this.edgeRay.y1,
        maxX: this.edgeRay.x2,
        maxY: this.edgeRay.y2,
      })
    ) {
      this.interpreter.send({
        type: EventType.AT_EDGE,
      });
    }
    if (
      this.body.velocity.y > 0 &&
      this.interpreter.state.value !== CharacterState.JUMPING
    ) {
      // handle falling
      this.interpreter.send({
        type: EventType.FALL,
      });
    }

    if (this.interpreter.state.value === CharacterState.FALLING) {
      this.fillColor = 0xccbbaa;
    } else {
      this.fillColor = 0xff1122;
    }
  }

  public addObstacle = (obj: Phaser.GameObjects.GameObject): void => {
    if (!this.obstacles.includes(obj)) {
      let rect = new Phaser.Geom.Rectangle();
      Phaser.Display.Bounds.GetBounds(obj, rect);
      this.obstacles.push(obj);
      this.obstacleIndex.insert(rect);
    }
  };

  public onGroundTouched = (ground: Phaser.GameObjects.GameObject): void => {
    this.addObstacle(ground);
    this.interpreter.send({
      type: EventType.TOUCH_GROUND,
    });
  };

  public onWallTouched = (wall: Phaser.GameObjects.GameObject): void => {
    this.addObstacle(wall);
    this.interpreter.send({
      type: EventType.TOUCH_WALL,
    });
  };
}
