import { KinematicCharacterContext } from '../../interfaces/KinematicCharacter';
import { EventType } from './States';

export interface EnemyContext extends KinematicCharacterContext {}

export type EnemyEvent =
  | { type: EventType.UPDATE; delta?: number; directionX?: number }
  | { type: EventType.ROAM }
  | { type: EventType.AT_EDGE }
  | { type: EventType.FALL }
  | { type: EventType.TOUCH_GROUND }
  | { type: EventType.TOUCH_WALL }
  | { type: EventType.STOP };
