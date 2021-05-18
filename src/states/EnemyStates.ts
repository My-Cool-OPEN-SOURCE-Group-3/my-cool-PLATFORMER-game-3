import { assign, createMachine } from 'xstate';
import { choose } from 'xstate/lib/actions';
import { Movement } from '../components/Movement';
import { EnemyContext, EnemyEvent } from './config/EnemyStateConfig';
import {
  Actions,
  Activities,
  CharacterState,
  EventType,
} from './config/States';

export const EnemyStates = (move: Movement) =>
  createMachine<EnemyContext, EnemyEvent>(
    {
      id: 'enemy',
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
              cond: 'midair',
              actions: [Actions.APPLY_DRAG],
            },
            {
              actions: [Actions.APPLY_FRICTION],
            },
          ]),
        },
        FALL: {
          target: CharacterState.FALLING,
        },
      },
      states: {
        idle: {
          on: {
            ROAM: {
              target: CharacterState.ROAMING,
            },
          },
          activities: [Activities.STOP],
          after: {
            IDLE_TIME: { target: CharacterState.ROAMING },
          },
        },
        roaming: {
          entry: [Actions.TURN],
          on: {
            STOP: {
              target: CharacterState.IDLE,
            },
            AT_EDGE: {
              target: CharacterState.IDLE,
            },
          },
          activities: [Activities.ROAM],
          after: {
            ROAM_TIME: { target: CharacterState.IDLE },
          },
        },
        falling: {
          on: {
            TOUCH_GROUND: {
              target: CharacterState.IDLE,
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
          return meta.state.value === CharacterState.FALLING;
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
            if (ev.type !== EventType.STOP) {
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
            if (ev.type !== EventType.STOP) {
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
            ctx.move.directionX =
              ev.type === EventType.UPDATE ? ev.directionX ?? 0 : 0;
            return ctx.move;
          },
        }),
      },
    }
  );
