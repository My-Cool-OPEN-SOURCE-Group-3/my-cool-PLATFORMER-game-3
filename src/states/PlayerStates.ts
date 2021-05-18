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
        delta: 0,
      },
      on: {
        UPDATE: {
          actions: ['update'],
        },
        STOP: {
          actions: choose([
            {
              actions: ['applyDrag'],
              cond: 'midair',
            },
            {
              actions: ['applyFriction'],
            },
          ]),
        },
        WALK: {
          actions: ['walk'],
        },
        FALL: {
          target: 'falling',
          actions: ['fall'],
        },
      },
      states: {
        idle: {
          on: {
            WALK: {
              target: 'walking',
            },
            JUMP: {
              target: 'jumping',
            },
          },
        },
        walking: {
          on: {
            STOP: {
              target: 'idle',
            },
            JUMP: {
              target: 'jumping',
            },
          },
        },
        jumping: {
          entry: ['jump'],
          on: {
            TOUCH_GROUND: {
              target: 'idle',
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
            JUMP: {
              target: 'jumping',
              cond: 'canJump',
            },
          },
        },
      },
    },
    {
      guards: {
        canJump: (ctx, _) => ctx.move.midairTime < ctx.move.coyoteTime,
        midair: (_, _ev, meta) =>
          meta.state.value === 'jumping' || meta.state.value === 'falling',
      },
      actions: {
        update: assign<PlayerContext, PlayerEvent>({
          delta: (_, ev) => (ev.type === 'UPDATE' ? ev.delta ?? 0 : 0),
          move: (ctx, ev) => {
            ctx.move.directionX = ev.type === 'UPDATE' ? ev.directionX ?? 0 : 0;
            return ctx.move;
          },
        }),
        walk: assign<PlayerContext, PlayerEvent>({
          move: (ctx, ev) => {
            if (ev.type !== 'WALK') {
              return ctx.move;
            }
            ctx.move.body.setVelocityX(ctx.move.speed * ctx.move.directionX);
            return ctx.move;
          },
        }),
        jump: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            ctx.move.body.setVelocityY(-ctx.move.jumpForce);
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
        applyFriction: assign<PlayerContext, PlayerEvent>({
          move: (ctx, _) => {
            let mov = ctx.move;
            let vx = mov.body.velocity.x;
            mov.body.setVelocityX(
              Math.abs(vx) > 0.01 ? vx / (1 + 1 / (ctx.delta * mov.slip)) : 0
            );
            if (mov.isTouchingWall) mov.body.setVelocityX(0);
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
            // TODO: see if below line is ever needed
            // if (mov.isTouchingWall) mov.body.setVelocityX(0);
            return ctx.move;
          },
        }),
      },
    }
  );
