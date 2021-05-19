// TODO: consider if it's worth capturing gravity in this

import { assign, createMachine } from 'xstate';
import { choose } from 'xstate/lib/actions';
import { Movement } from '../components/Movement';
import { PlayerContext, PlayerEvent } from './config/PlayerStateConfig';
import { Actions, CharacterState, EventType } from './config/States';

export const PlayerStates = (move: Movement) =>
  createMachine<PlayerContext, PlayerEvent>(
    {
      id: 'player',
      initial: CharacterState.IDLE,
      context: {
        move,
        delta: 0,
      },
      on: {
        UPDATE: {
          actions: [Actions.UPDATE],
        },
        STOP: {
          actions: choose([
            {
              actions: [Actions.APPLY_DRAG],
              cond: 'midair',
            },
            {
              actions: [Actions.APPLY_FRICTION],
            },
          ]),
        },
      },
      states: {
        idle: {
          on: {
            WALK: {
              target: CharacterState.WALKING,
            },
            RUN: {
              target: CharacterState.RUNNING,
            },
            JUMP: {
              target: CharacterState.JUMPING,
              actions: [Actions.JUMP],
            },
            FALL: {
              target: CharacterState.FALLING,
              cond: 'midair',
            },
          },
        },
        walking: {
          entry: [Actions.WALK],
          on: {
            STOP: {
              target: CharacterState.IDLE,
            },
            JUMP: {
              target: CharacterState.JUMPING,
              actions: [Actions.JUMP],
            },
            RUN: {
              target: CharacterState.RUNNING,
            },
            FALL: {
              target: CharacterState.FALLING,
              cond: 'midair',
            },
          },
        },
        running: {
          entry: [Actions.RUN],
          on: {
            STOP: {
              target: CharacterState.IDLE,
            },
            JUMP: {
              target: CharacterState.JUMPING,
              actions: [Actions.JUMP],
            },
            WALK: {
              target: CharacterState.WALKING,
            },
            FALL: {
              target: CharacterState.FALLING,
              cond: 'midair',
            },
          },
        },
        jumping: {
          on: {
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
              actions: [Actions.LAND],
            },
            TOUCH_WALL: {
              target: CharacterState.WALLSLIDING,
              cond: 'movingX',
            },
          },
        },
        falling: {
          entry: [Actions.FALL],
          on: {
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
              actions: [Actions.LAND],
            },
            TOUCH_WALL: {
              target: CharacterState.WALLSLIDING,
              cond: 'movingX',
            },
            JUMP: {
              target: CharacterState.JUMPING,
              cond: 'canJump',
            },
          },
        },
        wallsliding: {
          entry: [Actions.WALLSLIDE],
          on: {
            JUMP: {
              target: CharacterState.WALLJUMPING,
              actions: [Actions.WALLJUMP],
              cond: 'crestedY',
            },
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
              actions: [Actions.LAND],
            },
            TOUCH_WALL: {
              target: CharacterState.WALLSLIDING,
              cond: 'movingX',
            },
          },
        },
        walljumping: {
          on: {
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
              actions: [Actions.LAND],
            },
            TOUCH_WALL: {
              target: CharacterState.WALLSLIDING,
              cond: 'movingX',
            },
            WALK: {
              target: CharacterState.JUMPING,
              cond: 'crestedY',
            },
            RUN: {
              target: CharacterState.JUMPING,
              cond: 'crestedY',
            },
          },
        },
      },
    },
    {
      guards: {
        canJump: (ctx, _) => ctx.move.midairTime < ctx.move.coyoteTime,
        midair: (ctx, _ev, meta) =>
          meta.state.value === CharacterState.WALLJUMPING ||
          meta.state.value === CharacterState.JUMPING ||
          meta.state.value === CharacterState.FALLING ||
          ctx.move.body.velocity.y > 0,
        movingX: (ctx, _) => ctx.move.directionX !== 0,
        stillX: (ctx, _) => ctx.move.directionX === 0,
        risingY: (ctx, _) => ctx.move.body.velocity.y < 0,
        crestedY: (ctx, _) =>
          ctx.move.body.velocity.y >= -ctx.move.jumpForce / 2,
      },
      actions: {
        update: assign<PlayerContext, PlayerEvent>({
          delta: (_, ev) => (ev.type === EventType.UPDATE ? ev.delta ?? 0 : 0),
          move: (ctx, ev, meta) => {
            ctx.move.directionX =
              ev.type === EventType.UPDATE ? ev.directionX ?? 0 : 0;
            if (
              meta.state?.value !== CharacterState.WALLJUMPING &&
              ctx.move.directionX !== 0
            ) {
              ctx.move.body.setVelocityX(ctx.move.speed * ctx.move.directionX);
            }
            return ctx.move;
          },
        }),
        walk: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.speed = ctx.move.walkSpeed;
            return ctx.move;
          },
        }),
        run: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.speed = ctx.move.runSpeed;
            return ctx.move;
          },
        }),
        jump: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _, meta) => {
            if (meta.state?.value !== CharacterState.JUMPING) {
              ctx.move.body.setVelocityY(-ctx.move.jumpForce);
            }
            return ctx.move;
          },
        }),
        land: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.midairTime = 0;
            return ctx.move;
          },
        }),
        fall: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.midairTime += ctx.delta;
            return ctx.move;
          },
        }),
        wallslide: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            let mov = ctx.move;
            let vy = mov.body.velocity.y;
            mov.lastWallDirection = mov.directionX;
            mov.body.setVelocityY(vy * 0.01);
            return ctx.move;
          },
        }),
        walljump: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.body.setVelocityX(
              (ctx.move.jumpForce / 4) * -ctx.move.lastWallDirection
            );
            ctx.move.body.setVelocityY(-ctx.move.jumpForce * 0.9);
            return ctx.move;
          },
        }),
        applyFriction: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            let mov = ctx.move;
            let vx = mov.body.velocity.x;
            mov.body.setVelocityX(
              Math.abs(vx) > 0.01 ? vx / (1 + 1 / (ctx.delta * mov.slip)) : 0
            );
            return ctx.move;
          },
        }),
        applyDrag: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            let mov = ctx.move;
            let vx = mov.body.velocity.x;
            mov.body.setVelocityX(
              Math.abs(vx) > 0.01
                ? vx / (1 + ctx.delta * (1 / mov.airMomentum))
                : 0
            );
            return ctx.move;
          },
        }),
      },
    }
  );
