import { KinematicCharacterContext } from '../../interfaces/KinematicCharacter';
import { EventType } from './States';

export interface PlayerContext extends KinematicCharacterContext {}

export type PlayerEvent =
  | { type: EventType.UPDATE; delta?: number; directionX?: number }
  | { type: EventType.WALK }
  | { type: EventType.RUN }
  | { type: EventType.JUMP }
  | { type: EventType.FALL }
  | { type: EventType.TOUCH_GROUND }
  | { type: EventType.TOUCH_WALL }
  | { type: EventType.STOP };
