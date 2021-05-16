import { Movement, Direction } from '../../components/Movement';
import { EventType } from './States';

export interface PlayerContext {
  move: Movement;
}

export type PlayerEvent =
  | { type: EventType.WALK; direction: Direction }
  | { type: EventType.RUN; direction: Direction }
  | { type: EventType.JUMP }
  | { type: EventType.FALL }
  | { type: EventType.TOUCH_GROUND }
  | { type: EventType.STOP; delta: number };
