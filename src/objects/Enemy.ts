import { State, StateMachine } from 'xstate';
import { Direction, Movement } from '../components/Movement';
import { EnemyContext, EnemyEvent } from '../states/config/EnemyStateConfig';
import { EnemyStates } from '../states/EnemyStates';

export class Enemy extends Phaser.GameObjects.Rectangle {
  body!: Phaser.Physics.Arcade.Body;
  edgeRay: Phaser.Geom.Line;

  private states: StateMachine<EnemyContext, any, EnemyEvent>;
  private currentState: State<EnemyContext, EnemyEvent>;
  private graphics: Phaser.GameObjects.Graphics;

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
    this.states = EnemyStates(
      new Movement(this.body, {
        speed: 150,
        slip: 0.1,
        airMomentum: 150,
      })
    );
    this.currentState = this.states.initialState;
    console.log(x, y, width, height);
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
    console.log(this.edgeRay);
  }

  update(_time: number, delta: number): void {
    // update and draw edge detection ray
    this.edgeRay.setTo(
      this.x + this.width / 2,
      this.y - this.height / 2,
      this.x + this.width / 2,
      this.y + this.height / 1.5
    );
    this.graphics.clear();
    this.graphics.lineStyle(2, 0x00ff00);
    this.graphics.strokeLineShape(this.edgeRay);

    // handle falling
    if (this.body.velocity.y > 0 && this.currentState.value !== 'jumping') {
      this.currentState = this.states.transition(this.currentState, {
        type: 'FALL',
      });
    }

    if (this.currentState.value === 'falling') {
      this.fillColor = 0xccbbaa;
    } else {
      this.fillColor = 0xff1122;
    }
  }

  public onGroundTouched = (): void => {
    this.currentState = this.states.transition(this.currentState, {
      type: 'TOUCH_GROUND',
    });
  };
}
