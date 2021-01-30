const DRAG = 0.925;
const ANGLE_DRAG = 0.9;
const ACCELERATION_FORCE = 0.3;
const ACCELERATION_TURN_FORCE = 0.5;
const TURN_SPEED = 0.2;
const TURN_FORCE = 0.2;
const VISION_DISTANCE = 1000;
const BRAKE_FORCE = 0.05;
const SPEED_LIMIT = 20;

class Car {
  constructor(map, texture, spawnPoint, numVisionPoints) {
    this.map = map;
    this.topSpeed = SPEED_LIMIT;
    this.position = { x: spawnPoint.x, y: spawnPoint.y };
    this.rotation = -Math.PI / 2;
    this.acc = 0;
    this.vel = { x: 0, y: 0 };
    this.angleVel = 0;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = spawnPoint.x;
    this.sprite.y = spawnPoint.y;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.rotation = this.rotation;
    this.sprite.scale.set(0.02);
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;

    this.visionPoints = this.createVisionPoints(numVisionPoints);
    this.distances = this.createDistances();
    this.createLines();
    this.updateVision();
    this.setShowVisionPoints(false);
  }
  setShowVisionPoints(value) {
    for (let vp of this.visionPoints) {
      vp.visible = value;
    }
    this.showVisionPoints = value;
  }
  velocity() {
    return pointMagnitude(this.vel);
  }
  getPosition() {
    return this.position;
  }
  createVisionPoints(numPoints) {
    let visionPoints = new Array(numPoints);
    for (let i = 0; i < visionPoints.length; ++i) {
      visionPoints[i] = new PIXI.Graphics();
      visionPoints[i].beginFill(0xffffff);
      visionPoints[i].drawCircle(0, 0, 5);
      visionPoints[i].endFill();
    }
    return visionPoints;
  }
  createDistances() {
    let distances = new Array(this.visionPoints.length);
    for (let i = 0; i < distances.length; ++i) {
      distances[i] = 0;
    }
    return distances;
  }
  createLines() {
    this.lines = new Array(4);
    this.vertices = new Array(8);
    this.calculateVertices();
    this.updateLines();
  }
  calculateVertices() {
    this.vertices[0] = -this.halfWidth;
    this.vertices[1] = -this.halfHeight;
    this.vertices[2] = this.halfWidth;
    this.vertices[3] = -this.halfHeight;
    this.vertices[4] = this.halfWidth;
    this.vertices[5] = this.halfHeight;
    this.vertices[6] = -this.halfWidth;
    this.vertices[7] = this.halfHeight;
    let cosT = Math.cos(this.rotation);
    let sinT = Math.sin(this.rotation);
    for (let i = 0; i < this.vertices.length; i += 2) {
      let x = this.vertices[i];
      let y = this.vertices[i + 1];
      this.vertices[i] = this.position.x + x * cosT - y * sinT;
      this.vertices[i + 1] = this.position.y + x * sinT + y * cosT;
    }
  }
  render(stage) {
    stage.addChild(this.sprite);
    for (let i = 0; i < this.visionPoints.length; ++i) {
      stage.addChild(this.visionPoints[i]);
    }
  }
  moveTo(point) {
    this.position.x = point.x;
    this.position.y = point.y;
  }
  rotateTo(angle) {
    this.rotation = angle;
  }
  stop() {
    this.acc = 0;
    this.vel.x = 0;
    this.vel.y = 0;
    this.angleVel = 0;
  }
  update() {
    this.position.x += this.vel.x;
    this.position.y += this.vel.y;
    this.vel.x += this.acc * Math.cos(this.rotation);
    this.vel.y += this.acc * Math.sin(this.rotation);
    this.vel.x *= DRAG;
    this.vel.y *= DRAG;
    this.vel.x = this.clamp(this.vel.x, -this.topSpeed, this.topSpeed);
    this.vel.y = this.clamp(this.vel.y, -this.topSpeed, this.topSpeed);

    this.rotation += this.angleVel * TURN_SPEED;
    this.angleVel *= ANGLE_DRAG;

    this.calculateVertices();
    this.updateLines();
    this.updateVision();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    this.sprite.rotation = this.rotation;
  }
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  decelerateLeft() {
    this.turnLeft();
    this.decelerate();
  }
  decelerateRight() {
    this.turnRight();
    this.decelerate();
  }
  accelerateLeft() {
    this.turnLeft();
    this.accelerate();
  }
  accelerateRight() {
    this.turnRight();
    this.accelerate();
  }
  turnRight() {
    this.angleVel = TURN_FORCE;
  }
  turnLeft() {
    this.angleVel = -TURN_FORCE;
  }
  accelerate() {
    this.acc = ACCELERATION_FORCE;
  }
  decelerate() {
    this.acc = -BRAKE_FORCE;
  }
  doNothing() {
    this.acc = 0;
    this.angleVel = 0;
  }
  updateLines() {
    for (let lineNum = 0; lineNum < 4; ++lineNum) {
      let i = lineNum * 2;
      this.lines[lineNum] = {
        x1: this.vertices[i],
        y1: this.vertices[i + 1],
        x2: this.vertices[(i + 2) % this.vertices.length],
        y2: this.vertices[(i + 3) % this.vertices.length],
      };
    }
  }
  collidesWithLine(targetLine) {
    for (let carLine of this.lines) {
      if (intersectionLineLine(carLine, targetLine)) {
        return true;
      }
    }
    return false;
  }
  collidesWithLines() {
    for (let targetLine of this.map.lines) {
      if (this.collidesWithLine(targetLine)) {
        return true;
      }
    }
    return false;
  }
  updateVision() {
    for (let i = 0; i < this.visionPoints.length; ++i) {
      let angle = (i * 2 * Math.PI) / this.visionPoints.length + this.rotation;
      let point, distance;
      [point, distance] = raycast(
        this.position,
        angle,
        VISION_DISTANCE,
        this.map.lines
      );
      this.visionPoints[i].x = point.x;
      this.visionPoints[i].y = point.y;
      this.distances[i] = distance;
    }
  }
  getVisionDistances() {
    return this.distances;
  }
}
