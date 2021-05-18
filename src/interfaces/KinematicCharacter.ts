import { Movement } from '../components/Movement';

export interface IKinematicCharacter {
  onGroundTouched: (ground: Phaser.GameObjects.GameObject) => void;
  // onOverlap: (time: number) => void;
  onWallTouched?: (time: number) => void;
}

export interface KinematicCharacterContext {
  move: Movement;
  delta: number;
}

export const isKinematicCharacter = (obj: any): obj is IKinematicCharacter => {
  return (
    typeof obj.onGroundTouched === 'function'
    // && typeof obj.onOverlap === 'function'
  );
};
