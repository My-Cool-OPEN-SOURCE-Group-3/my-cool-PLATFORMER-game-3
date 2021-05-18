export enum EventType {
  UPDATE = 'UPDATE',
  ROAM = 'ROAM',
  WALK = 'WALK',
  RUN = 'RUN',
  JUMP = 'JUMP',
  FALL = 'FALL',
  STOP = 'STOP',
  TOUCH_GROUND = 'TOUCH_GROUND',
  TOUCH_WALL = 'TOUCH_WALL',
  AT_EDGE = 'AT_EDGE',
}

export enum CharacterState {
  IDLE = 'idle',
  ROAMING = 'roaming',
  WALKING = 'walking',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling',
  WALLSLIDING = 'wallsliding',
  WALLJUMPING = 'walljumping',
}

export enum Actions {
  WALK = 'walk',
  RUN = 'run',
  JUMP = 'jump',
  LAND = 'land',
  FALL = 'fall',
  TURN = 'turn',
  WALLSLIDE = 'wallslide',
  WALLJUMP = 'walljump',
  UPDATE = 'update',
  APPLY_DRAG = 'applyDrag',
  APPLY_FRICTION = 'applyFriction',
}

export enum Activities {
  ROAM = 'roam',
  STOP = 'stop',
}
