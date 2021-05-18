import { KinematicCharacterContext } from '../../interfaces/KinematicCharacter';

export interface EnemyContext extends KinematicCharacterContext {}

export type EnemyEvent =
  | { type: 'UPDATE'; delta?: number; directionX?: number }
  | { type: 'ROAM' }
  | { type: 'FALL' }
  | { type: 'TOUCH_GROUND' }
  | { type: 'AT_EDGE' }
  | { type: 'STOP' };
