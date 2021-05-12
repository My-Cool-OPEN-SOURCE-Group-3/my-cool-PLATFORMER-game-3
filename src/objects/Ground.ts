export class Ground extends Phaser.GameObjects.Rectangle {
  body!: Phaser.Physics.Arcade.Body;

  private currentScene: Phaser.Scene;

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
    this.scene.physics.add.existing(this, true);
    this.scene.add.existing(this);
  }
}
