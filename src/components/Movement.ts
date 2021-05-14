export enum Direction {
  UP = -1,
  DOWN = 1,
  LEFT = -1,
  RIGHT = 1,
}
export class Movement {
  public body: Phaser.Physics.Arcade.Body;
  public speed = 300;
  public slip = 0.1;
  public airMomentum = 200;
  public jumpForce = 900;

  public isJumping = false;
  public isMidair = false;

  constructor(body: Phaser.Physics.Arcade.Body, init?: Partial<Movement>) {
    this.body = body;
    Object.assign(this, init);
  }
}
