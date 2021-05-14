import { Movement, Direction } from '../../components/Movement';

export interface EnemyContext {
  move: Movement;
}

export type EnemyEvent =
  | { type: 'WALK'; direction: Direction }
  | { type: 'RUN'; direction: Direction }
  | { type: 'FALL' }
  | { type: 'TOUCH_GROUND' }
  | { type: 'AT_EDGE' }
  | { type: 'STOP'; delta: number };
