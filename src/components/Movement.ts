export enum Direction {
  UP = -1,
  DOWN = 1,
  LEFT = -1,
  RIGHT = 1,
}
export class Movement {
  static OVERLAP_TIME_THRESHOLD = 100;

  body: Phaser.Physics.Arcade.Body;
  directionX = Direction.RIGHT;
  speed = 300;
  slip = 0.1;
  airMomentum = 200;
  jumpForce = 900;
  coyoteTime = 100; // extra time in ms after leaving an edge to make a jump

  //isOverlapping = false;
  isTouchingWall = false;

  midairTime = 0;
  //lastOverlapTime = 0;

  constructor(body: Phaser.Physics.Arcade.Body, init?: Partial<Movement>) {
    this.body = body;
    Object.assign(this, init);
  }

  public updateFlip(chara: Phaser.Physics.Arcade.Sprite): void {
    if (this.directionX < 0) {
      chara.flipX = false;
    } else if (this.directionX > 0) {
      chara.flipX = true;
    }
    chara.body.updateCenter();
  }
}
