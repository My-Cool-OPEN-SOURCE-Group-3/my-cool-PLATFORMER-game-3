import { KinematicCharacterContext } from '../../interfaces/KinematicCharacter';

export interface PlayerContext extends KinematicCharacterContext {}

export type PlayerEvent =
  | { type: 'UPDATE'; delta?: number; directionX?: number }
  | { type: 'WALK' }
  | { type: 'RUN' }
  | { type: 'JUMP' }
  | { type: 'FALL' }
  | { type: 'TOUCH_GROUND' }
  | { type: 'STOP' };
