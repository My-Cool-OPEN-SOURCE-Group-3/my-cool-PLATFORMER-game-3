import { assign, createMachine } from 'xstate';
import { choose } from 'xstate/lib/actions';
import { Movement } from '../components/Movement';
import { EnemyContext, EnemyEvent } from './config/EnemyStateConfig';

export const EnemyStates = (move: Movement) =>
  createMachine<EnemyContext, EnemyEvent>(
    {
      id: 'enemy',
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
              cond: 'midair',
              actions: ['applyDrag'],
            },
            {
              actions: ['applyFriction'],
            },
          ]),
        },
        FALL: {
          target: 'falling',
        },
      },
      states: {
        idle: {
          on: {
            ROAM: {
              target: 'roaming',
            },
          },
          activities: ['stop'],
          after: {
            IDLE_TIME: { target: 'roaming' },
          },
        },
        roaming: {
          entry: ['turn'],
          on: {
            STOP: {
              target: 'idle',
            },
            AT_EDGE: {
              target: 'idle',
            },
          },
          activities: ['roam'],
          after: {
            ROAM_TIME: { target: 'idle' },
          },
        },
        falling: {
          on: {
            TOUCH_GROUND: {
              target: 'idle',
            },
          },
        },
      },
    },
    {
      delays: {
        IDLE_TIME: 1000,
        ROAM_TIME: 3000,
      },
      guards: {
        midair: (_ctx, _ev, meta) => {
          return meta.state.value === 'falling';
        },
      },
      activities: {
        roam: (ctx, _ev) => {
          const interval = setInterval(() => {
            ctx.move.body.setVelocityX(ctx.move.speed * ctx.move.directionX);
          });
          return () => clearInterval(interval);
        },
        stop: (ctx, _ev) => {
          const interval = setInterval(() => {
            let mov = ctx.move;
            let vx = mov.body.velocity.x;
            mov.body.setVelocityX(
              Math.abs(vx) > 0.01
                ? mov.body.velocity.x / (1 + 1 / (ctx.delta * mov.slip))
                : 0
            );
          });
          return () => clearInterval(interval);
        },
      },
      actions: {
        halt: assign<EnemyContext, EnemyEvent>({
          move: (ctx, _ev) => {
            ctx.move.body.setVelocityX(0);
            return ctx.move;
          },
        }),
        turn: assign<EnemyContext, EnemyEvent>({
          move: (ctx, _ev) => {
            ctx.move.directionX *= -1;
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
                ? mov.body.velocity.x / (1 + 1 / (ctx.delta * mov.slip))
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
                ? mov.body.velocity.x / (1 + ctx.delta * (1 / mov.airMomentum))
                : 0
            );
            return ctx.move;
          },
        }),
        update: assign<EnemyContext, EnemyEvent>({
          move: (ctx, ev) => {
            ctx.move.directionX = ev.type === 'UPDATE' ? ev.directionX ?? 0 : 0;
            return ctx.move;
          },
        }),
      },
    }
  );
