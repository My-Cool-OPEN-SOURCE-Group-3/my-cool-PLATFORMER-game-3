// TODO: consider if it's worth capturing gravity in this

import { assign, createMachine } from 'xstate';
import { choose } from 'xstate/lib/actions';
import { Movement } from '../components/Movement';
import { PlayerContext, PlayerEvent } from './config/PlayerStateConfig';

export const PlayerStates = (move: Movement) =>
  createMachine<PlayerContext, PlayerEvent>(
    {
      id: 'player',
      initial: 'idle',
      context: {
        move,
      },
      on: {
        STOP: {
          actions: choose([
            {
              cond: 'midair',
              actions: ['applyDrag'],
            },
            {
              actions: ['applyFriction'],
            },
          ]),
        },
        WALK: {
          actions: ['walk'],
        },
        JUMP: {
          target: 'jumping',
          cond: 'canJump',
        },
        FALL: {
          target: 'falling',
        },
      },
      states: {
        idle: {
          on: {
            WALK: {
              target: 'walking',
            },
          },
        },
        walking: {
          on: {
            STOP: {
              target: 'idle',
            },
          },
        },
        jumping: {
          entry: ['jump'],
          on: {
            TOUCH_GROUND: {
              target: 'idle',
              cond: 'midair',
              actions: ['land'],
            },
          },
        },
        falling: {
          on: {
            TOUCH_GROUND: {
              target: 'idle',
              actions: ['land'],
            },
          },
        },
      },
    },
    {
      guards: {
        canJump: (_ctx, _ev, meta) => {
          return meta.state.value !== 'jumping';
        },
        midair: (_ctx, _ev, meta) => {
          return (
            meta.state.value === 'jumping' || meta.state.value === 'falling'
          );
        },
      },
      actions: {
        walk: assign<PlayerContext, PlayerEvent>({
          move: (ctx, ev) => {
            if (ev.type !== 'WALK') {
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
            if (ev.type !== 'STOP') {
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
            if (ev.type !== 'STOP') {
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
