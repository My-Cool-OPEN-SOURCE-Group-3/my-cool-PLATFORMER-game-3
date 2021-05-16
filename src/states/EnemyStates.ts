// TODO: consider if it's worth capturing gravity in this

import { assign, createMachine } from 'xstate';
import { choose } from 'xstate/lib/actions';
import { Movement } from '../components/Movement';
import { EnemyContext, EnemyEvent } from './config/EnemyStateConfig';
import { Actions, CharacterState, EventType } from './config/States';

export const EnemyStates = (move: Movement) =>
  createMachine<EnemyContext, EnemyEvent>(
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
        midair: (_ctx, _ev, meta) => {
          return meta.state.value === CharacterState.FALLING;
        },
      },
      actions: {
        walk: assign<EnemyContext, EnemyEvent>({
          move: (ctx, ev) => {
            if (ev.type !== EventType.WALK) {
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
        applyDrag: assign<EnemyContext, EnemyEvent>({
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
