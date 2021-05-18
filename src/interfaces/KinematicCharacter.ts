import { Movement } from '../components/Movement';

export interface IKinematicCharacter {
  onGroundTouched: (ground: Phaser.GameObjects.GameObject) => void;
  onWallTouched: (wall: Phaser.GameObjects.GameObject) => void;
}

export interface KinematicCharacterContext {
  move: Movement;
  delta: number;
}

export const isKinematicCharacter = (obj: any): obj is IKinematicCharacter => {
  return typeof obj.onGroundTouched === 'function';
};
