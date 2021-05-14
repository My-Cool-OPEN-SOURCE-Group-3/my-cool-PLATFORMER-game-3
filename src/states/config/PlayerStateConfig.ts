import { Movement, Direction } from '../../components/Movement';

export interface PlayerContext {
  move: Movement;
}

export type PlayerEvent =
  | { type: 'WALK'; direction: Direction }
  | { type: 'RUN'; direction: Direction }
  | { type: 'JUMP' }
  | { type: 'FALL' }
  | { type: 'TOUCH_GROUND' }
  | { type: 'STOP'; delta: number };
