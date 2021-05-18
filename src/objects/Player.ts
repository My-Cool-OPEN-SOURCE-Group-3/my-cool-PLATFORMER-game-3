import { State, StateMachine } from 'xstate';
import { Direction, Movement } from '../components/Movement';
import { IKinematicCharacter } from '../interfaces/KinematicCharacter';
import { PlayerContext, PlayerEvent } from '../states/config/PlayerStateConfig';
import { PlayerStates } from '../states/PlayerStates';
import { CharacterState, EventType } from '../states/config/States';

export class Player
  extends Phaser.Physics.Arcade.Sprite
  implements IKinematicCharacter {
  body!: Phaser.Physics.Arcade.Body;

  private keys: Phaser.Types.Input.Keyboard.CursorKeys;
  private states: StateMachine<PlayerContext, any, PlayerEvent>;
  private currentState: State<PlayerContext, PlayerEvent>;
  private lastAnim = CharacterState.IDLE;
  private move: Movement;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.physics.add.existing(this);
    this.move = new Movement(this.body, {
      speed: 300,
      slip: 0.2,
      airMomentum: 200,
      jumpForce: 900,
    });
    this.states = PlayerStates(this.move);
    this.currentState = this.states.initialState;
    scene.add.existing(this);
    this.keys = this.scene.input.keyboard.createCursorKeys();
    this.initAnim();
  }

  private initAnim(): void {
    const sceneAnims = this.scene.anims;
    sceneAnims.create({
      key: CharacterState.IDLE,
      frames: sceneAnims.generateFrameNames('a-player', {
        prefix: 'idle_',
        start: 1,
        end: 3,
      }),
      frameRate: 8,
    });
    sceneAnims.create({
      key: CharacterState.RUNNING,
      frames: sceneAnims.generateFrameNames('a-player', {
        prefix: 'run_',
        start: 1,
        end: 4,
      }),
    });
  }

  update(_: number, delta: number): void {
    /* TODO: see if below block is ever needed
    if (
      Math.abs(this.move.lastOverlapTime - time) >
      Movement.OVERLAP_TIME_THRESHOLD
    ) {
      this.move.isTouchingWall = false;
      this.move.isOverlapping = false;
    } */

    // handle animation
    this.move.updateFlip(this);
    let anim = CharacterState.IDLE;
    switch (this.currentState.value) {
      case CharacterState.WALKING:
        anim = CharacterState.RUNNING;
        break;
    }
    if (anim !== this.lastAnim || !this.anims.isPlaying) {
      this.anims.play(anim);
    }
    this.lastAnim = anim;

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
        type: EventType.STOP,
      });
    } else {
      this.currentState = this.states.transition(this.currentState, {
        type: EventType.WALK,
      });
    }
    if (this.keys.up.isDown) {
      this.currentState = this.states.transition(this.currentState, {
        type: EventType.JUMP,
      });
    }

    // handle falling
    if (this.body.velocity.y > 0 && this.currentState.value !== 'jumping') {
      this.currentState = this.states.transition(this.currentState, {
        type: EventType.FALL,
      });
    }

    // update state machine
    this.currentState = this.states.transition(this.currentState, {
      type: EventType.UPDATE,
      delta,
      directionX: dirX,
    });
  }

  public onGroundTouched = (): void => {
    this.currentState = this.states.transition(this.currentState, {
      type: EventType.TOUCH_GROUND,
    });
  };

  public onWallTouched = (_time: number): void => {
    this.move.isTouchingWall = true;
  };

  /*public onOverlap = (time: number): void => {
    this.move.isOverlapping = true;
    this.move.lastOverlapTime = time;
  };*/
}
