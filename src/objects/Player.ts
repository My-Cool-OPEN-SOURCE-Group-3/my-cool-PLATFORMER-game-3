import { State, StateMachine } from 'xstate';
import { Direction, Movement } from '../components/Movement';
import { PlayerContext, PlayerEvent } from '../states/config/PlayerStateConfig';
import { PlayerStates } from '../states/PlayerStates';
import { CharacterState, EventType } from '../states/config/States';

export class Player extends Phaser.Physics.Arcade.Sprite {
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
      isJumping: false,
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
        type: EventType.STOP,
        delta,
      });
    } else {
      this.currentState = this.states.transition(this.currentState, {
        type: EventType.WALK,
        direction: dirX,
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

    this.move.updateFlip(this, dirX);
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
  }

  public onGroundTouched = (): void => {
    this.currentState = this.states.transition(this.currentState, {
      type: EventType.TOUCH_GROUND,
    });
  };
}
