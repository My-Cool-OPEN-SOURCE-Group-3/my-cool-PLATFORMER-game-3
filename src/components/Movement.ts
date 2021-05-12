export class Movement {
  public speed = 300;
  public slip = 0.5;
  public airMomentum = 200;
  public jump_force = 900;
  public isJumping = false;

  constructor(init?: Partial<Movement>) {
    Object.assign(this, init);
  }
}
