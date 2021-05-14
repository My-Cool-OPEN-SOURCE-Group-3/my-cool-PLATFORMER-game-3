export class Movement {
  public speed = 300;
  public slip = 0.5;
  public airMomentum = 200;
  public jump_force = 900;
  public isJumping = false;

  constructor(init?: Partial<Movement>) {
    Object.assign(this, init);
  }

  public shouldFlipCharacter(character: Phaser.Physics.Arcade.Sprite): void {
    if (character.body.velocity.x < 0) {
      character.scaleX = 1;
    } else {
      character.scaleX = -1;
    }
  }
}
