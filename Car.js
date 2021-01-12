const SPEED_LIMIT = 10;

class Car {
  constructor(texture) {
    this.acc = 0;
    this.vel = 0;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = 170;
    this.sprite.y = 170;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.rotation = 0;
    this.sprite.scale.set(0.01);
    // this.rectangle = new PIXI.Graphics();
    // this.rectangle.lineStyle(4, 0xff3300, 1);
    // this.rectangle.beginFill(0x66ccff);
    // this.rectangle.drawRect(0, 0, 36, 32);
    // this.rectangle.endFill();
    // this.rectangle.position.x = 170;
    // this.rectangle.position.y = 170;
    // this.rectangle.pivot.x = 18;
    // this.rectangle.pivot.y = 16;
    // this.rectangle.rotation = 0;
  }
  update() {
    this.vel += this.acc;
    this.vel = this.clamp(this.vel, -SPEED_LIMIT, SPEED_LIMIT);
    this.sprite.x += this.vel * Math.cos(this.sprite.rotation);
    this.sprite.y += this.vel * Math.sin(this.sprite.rotation);
    this.vel *= 0.95;
    this.acc = 0;
  }
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  turn(angle) {
    this.sprite.rotation += angle;
  }
  accelerate(value) {
    this.acc = value;
  }
  decelerate(value) {
    this.acc = -value;
  }
}
