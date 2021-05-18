import RBush from 'rbush';

// Unoverlaps obj1 from obj2
export const fixOverlap = (
  obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
) => {
  let push =
    obj1.body.x > obj2.body.x
      ? obj2.body.x + obj2.body.width - obj1.body.x
      : -(obj1.body.x + obj1.body.width - obj2.body.x);
  obj1.body.x += push;
};

export class PhaserRB extends RBush<Phaser.Geom.Rectangle> {
  toBBox(item: Phaser.Geom.Rectangle) {
    return {
      minX: item.left,
      minY: item.top,
      maxX: item.right,
      maxY: item.bottom,
    };
  }
  compareMinX(a: Phaser.Geom.Rectangle, b: Phaser.Geom.Rectangle) {
    return a.x - b.x;
  }
  compareMinY(a: Phaser.Geom.Rectangle, b: Phaser.Geom.Rectangle) {
    return a.y - b.y;
  }
}
