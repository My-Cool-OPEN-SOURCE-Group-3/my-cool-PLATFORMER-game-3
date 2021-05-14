import { State, StateMachine } from 'xstate';
import { Direction, Movement } from '../components/Movement';
import { PlayerContext, PlayerEvent } from '../states/config/PlayerStateConfig';
import { PlayerStates } from '../states/PlayerStates';

export class Player extends Phaser.GameObjects.Rectangle {
  body!: Phaser.Physics.Arcade.Body;

  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private states: StateMachine<PlayerContext, any, PlayerEvent>;
  private currentState: State<PlayerContext, PlayerEvent>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ) {
    super(scene, x, y, width, height, color);

    scene.physics.add.existing(this); // sets body
    this.states = PlayerStates(
      new Movement(this.body, {
        speed: 300,
        slip: 0.2,
        airMomentum: 200,
        jumpForce: 900,
        isJumping: false,
      })
    );
    this.currentState = this.states.initialState;

    scene.add.existing(this);
    this.keys = this.scene.input.keyboard.createCursorKeys();
  }

  update(_time: number, delta: number): void {
    // handle moving
    let dirX = 0;
    if (this.keys.left.isDown) {
      dirX += Direction.LEFT;
    }
    if (this.keys.right.isDown) {
      dirX += Direction.RIGHT;
    }
    if (dirX === 0) {
      this.currentState = this.states.transition(this.currentState, {
        type: 'STOP',
        delta,
      });
    } else {
      this.currentState = this.states.transition(this.currentState, {
        type: 'WALK',
        direction: dirX,
      });
    }
    if (this.keys.up.isDown) {
      this.currentState = this.states.transition(this.currentState, {
        type: 'JUMP',
      });
    }

    // handle falling
    if (this.body.velocity.y > 0 && this.currentState.value !== 'jumping') {
      this.currentState = this.states.transition(this.currentState, {
        type: 'FALL',
      });
    }

    if (this.currentState.value === 'falling') {
      this.fillColor = 0xaabbcc;
    } else if (this.currentState.value === 'jumping') {
      this.fillColor = 0x00afcc;
    } else {
      this.fillColor = 0x002fa7;
    }
  }

  public onGroundTouched = (): void => {
    this.currentState = this.states.transition(this.currentState, {
      type: 'TOUCH_GROUND',
    });
  };
}
