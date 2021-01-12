class Car {
  constructor(texture, config) {
    this.topSpeed = config.topSpeed;
    this.acc = 0;
    this.vel = 0;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.rotation = 0;

    this.sprite.scale.set(0.02);
  }
  moveTo(x, y) {
    this.sprite.position.set(x, y);
  }
  update() {
    this.vel += this.acc;
    this.vel = this.clamp(this.vel, -this.topSpeed, this.topSpeed);
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
  collidesWith(lineX1, lineY1, lineX2, lineY2) {}
}
