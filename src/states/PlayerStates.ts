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
      },
      on: {
        STOP: {
          actions: choose([
            {
              cond: 'midair',
              actions: [Actions.APPLY_DRAG],
            },
            {
              actions: [Actions.APPLY_FRICTION],
            },
          ]),
        },
        WALK: {
          actions: [Actions.WALK],
        },
        JUMP: {
          target: CharacterState.JUMPING,
          cond: 'canJump',
        },
        FALL: {
          target: CharacterState.FALLING,
        },
      },
      states: {
        idle: {
          on: {
            WALK: {
              target: CharacterState.WALKING,
            },
          },
        },
        walking: {
          on: {
            STOP: {
              target: CharacterState.IDLE,
            },
          },
        },
        jumping: {
          entry: [Actions.JUMP],
          on: {
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
              cond: 'midair',
              actions: [Actions.LAND],
            },
          },
        },
        falling: {
          on: {
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
              actions: [Actions.LAND],
            },
          },
        },
      },
    },
    {
      guards: {
        canJump: (_ctx, _ev, meta) => {
          return meta.state.value !== CharacterState.JUMPING;
        },
        midair: (_ctx, _ev, meta) => {
          return (
            meta.state.value === CharacterState.JUMPING || meta.state.value === CharacterState.FALLING
          );
        },
      },
      actions: {
        walk: assign<PlayerContext, PlayerEvent>({
          move: (ctx, ev) => {
            if (ev.type !== EventType.WALK) {
              return ctx.move;
            }
            ctx.move.body.setVelocityX(ctx.move.speed * ev.direction);
            return ctx.move;
          },
        }),
        jump: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.body.setVelocityY(-ctx.move.jumpForce);
            ctx.move.isMidair = true;
            ctx.move.isJumping = true;
            return ctx.move;
          },
        }),
        land: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            if (ctx.move.isJumping || ctx.move.isMidair) {
              ctx.move.isMidair = false;
              ctx.move.isJumping = false;
            }
            return ctx.move;
          },
        }),
        applyFriction: assign<PlayerContext, PlayerEvent>({
          move: (ctx, ev) => {
            if (ev.type !== EventType.STOP) {
              return ctx.move;
            }
            let mov = ctx.move;
            let vx = mov.body.velocity.x;
            mov.body.setVelocityX(
              Math.abs(vx) > 0.01
                ? mov.body.velocity.x / (1 + 1 / (ev.delta * mov.slip))
                : 0
            );
            return ctx.move;
          },
        }),
        applyDrag: assign<PlayerContext, PlayerEvent>({
          move: (ctx, ev) => {
            if (ev.type !== EventType.STOP) {
              return ctx.move;
            }
            let mov = ctx.move;
            let vx = mov.body.velocity.x;
            mov.body.setVelocityX(
              Math.abs(vx) > 0.01
                ? mov.body.velocity.x / (1 + ev.delta * (1 / mov.airMomentum))
                : 0
            );
            return ctx.move;
          },
        }),
      },
    }
  );
