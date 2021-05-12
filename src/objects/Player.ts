import { Movement } from '../components/Movement';

export class Player extends Phaser.GameObjects.Rectangle {
  body!: Phaser.Physics.Arcade.Body;

  private move = new Movement({
    speed: 300,
    slip: 0.5,
    airMomentum: 200,
    jump_force: 900,
    isJumping: false,
  });

  private keys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
  ) {
    super(scene, x, y, width, height, color);
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.keys = this.scene.input.keyboard.createCursorKeys();
  }

  update(_time: number, delta: number): void {
    if (this.keys.left.isDown) {
      this.body.setVelocityX(-this.move.speed);
    } else if (this.keys.right.isDown) {
      this.body.setVelocityX(this.move.speed);
    } else {
      let vx = this.body.velocity.x;
      if (this.move.isJumping) {
        this.body.setVelocityX(
          Math.abs(vx) > 0.01
            ? this.body.velocity.x / (1 + delta * (1 / this.move.airMomentum))
            : 0,
        );
      } else {
        this.body.setVelocityX(
          Math.abs(vx) > 0.01
            ? this.body.velocity.x / (1 + 1 / (delta * this.move.slip))
            : 0,
        );
      }
    }
    if (this.keys.up.isDown && !this.move.isJumping) {
      this.body.setVelocityY(-this.move.jump_force);
      this.move.isJumping = true;
    } else if (this.keys.down.isDown) {
      this.body.setVelocityY(this.move.speed);
    }
  }

  public onGroundTouched = (): void => {
    this.move.isJumping = false;
  };
}
