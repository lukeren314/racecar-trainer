class Environment {
  constructor(config) {
    this.config = config;
    this.map = new MapData(config.mapData);
    this.car = new Car(
      this.map,
      config.carTexture,
      this.map.spawnPoint,
      config.numVisionPoints
    );
    this.rewards = new Rewards(this.map, config.rewards);
    this.done = false;
    this.inputSize = config.inputSize;
    this.outputSize = config.outputSize;
    this.firstFrame = true;
    this.actions = this.createActions();
    this.observation = new Array(this.inputSize);
    this.aliveCounter = 0;
  }
  getNumActions() {
    return this.actions.length;
  }
  createActions() {
    return [
      this.car.accelerate,
      // this.car.accelerateLeft,
      // this.car.accelerateRight,
      this.car.turnLeft,
      this.car.turnRight,
      this.car.decelerate,
      // this.car.decelerateLeft,
      // this.car.decelerateRight,
      // this.car.doNothing,
    ];
  }
  action(action) {
    let f = this.actions[action];
    f = f.bind(this.car);
    f();
  }
  update() {
    this.car.update();
    ++this.aliveCounter;
    // for some reason, pixi js can't update the scale
    // of the car fast enough for the first frame to have
    // the correct collision lines
    if (this.car.collidesWithLines()) {
      this.done = true;
    }
  }
  step() {
    let reward = this.rewards.getReward(this.car);
    if (reward < this.config.rewards.rewardLineReward) {
      ++this.aliveCounter;
    }
    if (this.aliveCounter > this.config.idleTimeMax) {
      this.done = true;
      reward -= this.config.rewards.idleTimeOutPenalty;
    }
    return [this.getObservation(), reward, this.done];
  }
  getObservation() {
    let obsIndex = 0;
    let visionDistances = this.car.getVisionDistances();
    for (obsIndex = 0; obsIndex < visionDistances.length; ++obsIndex) {
      this.observation[obsIndex] = visionDistances[obsIndex] / VISION_DISTANCE;
    }
    this.observation[obsIndex++] = this.car.vel.x / SPEED_LIMIT;
    this.observation[obsIndex++] = this.car.vel.y / SPEED_LIMIT;
    this.observation[obsIndex++] = this.car.acc / ACCELERATION_FORCE;
    this.observation[obsIndex++] = this.car.rotation / Math.PI / 2;
    this.observation[obsIndex++] = this.car.angleVel / ACCELERATION_TURN_FORCE;

    return this.observation;
  }
  render(stage) {
    this.car.render(stage);
    this.map.render(stage);
    this.rewards.render(stage);
  }
  reset() {
    this.car.moveTo(this.map.spawnPoint);
    this.car.rotateTo(-Math.PI / 2);
    this.car.stop();
    this.aliveCounter = 0;
    this.done = false;
    this.rewards.reset();
  }
}
