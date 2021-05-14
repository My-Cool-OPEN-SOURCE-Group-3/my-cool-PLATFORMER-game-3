// TODO: consider if it's worth capturing gravity in this

import { assign, createMachine } from 'xstate';
import { choose } from 'xstate/lib/actions';
import { Movement } from '../components/Movement';
import { EnemyContext, EnemyEvent } from './config/EnemyStateConfig';

export const EnemyStates = (move: Movement) =>
  createMachine<EnemyContext, EnemyEvent>(
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
        midair: (_ctx, _ev, meta) => {
          return meta.state.value === 'falling';
        },
      },
      actions: {
        walk: assign<EnemyContext, EnemyEvent>({
          move: (ctx, ev) => {
            if (ev.type !== 'WALK') {
              return ctx.move;
            }
            ctx.move.body.setVelocityX(ctx.move.speed * ev.direction);
            return ctx.move;
          },
        }),
        land: assign<EnemyContext, EnemyEvent>({
          move: (ctx, _) => {
            if (ctx.move.isMidair) {
              ctx.move.isMidair = false;
            }
            return ctx.move;
          },
        }),
        applyFriction: assign<EnemyContext, EnemyEvent>({
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
        applyDrag: assign<EnemyContext, EnemyEvent>({
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
