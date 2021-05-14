import { Movement } from '../components/Movement';

export class Player extends Phaser.Physics.Arcade.Sprite {
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
    texture: string,
  ) {
    super(scene, x, y, texture);
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.keys = this.scene.input.keyboard.createCursorKeys();
    this.initAnim();
  }

  private initAnim(): void {
    const sceneAnims = this.scene.anims;
    sceneAnims.create({
      key: 'idle',
      frames: sceneAnims.generateFrameNames('a-player', { prefix: 'idle_', start: 1, end: 3 }),
      frameRate: 8,
    });
    sceneAnims.create({
      key: 'run',
      frames: sceneAnims.generateFrameNames('a-player', { prefix: 'run_', start: 1, end: 4 }),
    });
  }

  update(_time: number, delta: number): void {
    if (this.keys.left.isDown) {
      !this.anims.isPlaying && this.anims.play('run');
      this.body.setVelocityX(-this.move.speed);
      this.move.shouldFlipCharacter(this);
    } else if (this.keys.right.isDown) {
      !this.anims.isPlaying && this.anims.play('run');
      this.body.setVelocityX(this.move.speed);
      this.move.shouldFlipCharacter(this);
    } else {
      let vx = this.body.velocity.x;
      if (this.move.isJumping) {
        this.body.setVelocityX(
          Math.abs(vx) > 0.01
            ? this.body.velocity.x / (1 + delta * (1 / this.move.airMomentum))
            : 0,
        );
      } else {
        !this.anims.isPlaying && this.anims.play('idle');
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
