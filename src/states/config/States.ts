export enum EventType {
  WALK  = 'WALK',
  RUN   = 'RUN',
  JUMP  = 'JUMP',
  FALL  = 'FALL',
  STOP  = 'STOP',
  TOUCH_GROUND = 'TOUCH_GROUND',
}

export enum CharacterState {
  IDLE    = 'idle',
  WALKING = 'walking',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling'
}

export enum Actions {
  WALK  = 'walk',
  RUN   = 'run',
  JUMP  = 'jump',
  LAND  = 'land',
  APPLY_DRAG = 'applyDrag',
  APPLY_FRICTION = 'applyFriction'
}