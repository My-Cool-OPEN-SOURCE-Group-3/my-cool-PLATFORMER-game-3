import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Rectangle {
  body!: Phaser.Physics.Arcade.Body;

  private currentScene: Phaser.Scene;
  private speed = 300;
  private slip = 0.5;
  private airMomentum = 200;
  private jump_force = 900;
  private isJumping = false;

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
    this.currentScene = scene;
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.keys = this.scene.input.keyboard.createCursorKeys();
  }

  update(_time: number, delta: number): void {
    if (this.keys.left.isDown) {
      this.body.setVelocityX(-this.speed);
    } else if (this.keys.right.isDown) {
      this.body.setVelocityX(this.speed);
    } else {
      let vx = this.body.velocity.x;
      if (this.isJumping) {
        this.body.setVelocityX(
          Math.abs(vx) > 0.01
            ? this.body.velocity.x / (1 + delta * (1 / this.airMomentum))
            : 0,
        );
      } else {
        this.body.setVelocityX(
          Math.abs(vx) > 0.01
            ? this.body.velocity.x / (1 + 1 / (delta * this.slip))
            : 0,
        );
      }
    }
    if (this.keys.up.isDown && !this.isJumping) {
      this.body.setVelocityY(-this.jump_force);
      this.isJumping = true;
    } else if (this.keys.down.isDown) {
      this.body.setVelocityY(this.speed);
    }
  }

  public onGroundTouched = (): void => {
    this.isJumping = false;
  };
}
