const DRAG = 0.95;
const ANGLE_DRAG = 0.9;
const TURN_SPEED = 0.1;

class Car {
  constructor(texture, config) {
    this.topSpeed = config.topSpeed;
    this.driveMode = config.driveMode;
    this.acc = 0;
    this.vel = { x: 0, y: 0 };
    this.angleVel = 0;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.rotation = 0;
    this.sprite.scale.set(0.02);
  }
  render(app) {
    app.stage.addChild(this.sprite);
  }
  moveTo(x, y) {
    this.sprite.position.set(x, y);
  }
  reset() {
    this.acc = 0;
    this.vel = { x: 0, y: 0 };
    this.steering = 0;
    this.sprite.rotation = 0;
  }
  update() {
    if (this.driveMode == "drift") {
      this.sprite.x += this.vel.x;
      this.sprite.y += this.vel.y;
      this.vel.x += this.acc * Math.cos(this.sprite.rotation);
      this.vel.y += this.acc * Math.sin(this.sprite.rotation);
    } else {
      this.vel.x += this.acc;
      this.vel.y += this.acc;
      let vel = Math.sqrt(Math.pow(this.vel.x, 2), Math.pow(this.vel.y, 2));
      this.sprite.x += vel * Math.cos(this.sprite.rotation);
      this.sprite.y += vel * Math.sin(this.sprite.rotation);
    }
    this.vel.x *= DRAG;
    this.vel.y *= DRAG;
    this.sprite.rotation += this.angleVel * TURN_SPEED;

    this.angleVel *= ANGLE_DRAG;

    this.vel.x = this.clamp(this.vel.x, -this.topSpeed, this.topSpeed);
    this.vel.y = this.clamp(this.vel.y, -this.topSpeed, this.topSpeed);

    this.acc = 0;
    this.angleVel = 0;
  }
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  turn(angle) {
    this.angleVel = angle;
  }
  accelerate(value) {
    this.acc = value;
  }
  decelerate(value) {
    this.acc = -value;
  }
  getLines() {
    // get top
    let lines = [];
    this.sprite.calculateVertices();
    for (let i = 0; i < this.sprite.vertexData.length - 3; i += 2) {
      lines.push({
        x1: this.sprite.vertexData[i],
        y1: this.sprite.vertexData[i + 1],
        x2: this.sprite.vertexData[i + 2],
        y2: this.sprite.vertexData[i + 3],
      });
    }
    lines.push({
      x1: this.sprite.vertexData[this.sprite.vertexData.length - 2],
      y1: this.sprite.vertexData[this.sprite.vertexData.length - 1],
      x2: this.sprite.vertexData[0],
      y2: this.sprite.vertexData[1],
    });
    return lines;
  }
  collidesWithLines(lines) {
    for (let carLine of this.getLines()) {
      for (let mapLine of lines) {
        if (line_intersection(carLine, mapLine)) {
          return true;
        }
      }
    }
    return false;
  }
}
