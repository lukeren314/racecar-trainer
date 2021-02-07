class Rewards {
  constructor(map, rewards) {
    this.map = map;
    this.circles = [];
    this.rewards = rewards;

    this.rewardLines = this.createRewardLines();
    this.midpoints = this.createMidpoints();
    this.rewardLineGs = this.createRewardLineGs();
    this.rewardLineIndex = 0;
    this.resetReport();
    this.setShowRewardLines(false);
  }
  reset() {
    this.rewardLineIndex = 0;
    this.resetReport();
  }
  setShowRewardLines(value) {
    for (let rl of this.rewardLineGs) {
      rl.visible = value;
    }
    this.showRewardLines = value;
  }
  getNextNMidpoints(n) {
    return this.midpoints.slice(this.rewardLineIndex, this.rewardLineIndex + n);
  }
  getReward(car) {
    let reward = 0;
    reward += this.rewards.aliveReward;
    this.rewardReport.aliveReward += this.rewards.aliveReward;
    if (this.isTouchingNextLine(car)) {
      reward += this.rewards.rewardLineReward;
      this.rewardReport.rewardLineReward += this.rewards.rewardLineReward;
    }
    reward += this.rewards.velocityReward * car.velocity();
    this.rewardReport.velocityReward +=
      this.rewards.velocityReward * car.velocity();
    reward +=
      reverseSigmoid(
        pointDistance(car.getPosition(), this.midpoints[this.rewardLineIndex]) /
          VISION_DISTANCE
      ) * this.rewards.rewardLineDistanceReward;
    this.rewardReport.rewardLineDistanceReward +=
      reverseSigmoid(
        pointDistance(car.getPosition(), this.midpoints[this.rewardLineIndex]) /
          VISION_DISTANCE
      ) * this.rewards.rewardLineDistanceReward;
    return reward;
  }
  resetReport() {
    this.rewardReport = {
      aliveReward: 0,
      rewardLineReward: 0,
      velocityReward: 0,
      rewardLineDistanceReward: 0,
    };
  }
  isTouchingNextLine(car) {
    if (car.collidesWithLine(this.rewardLines[this.rewardLineIndex])) {
      this.rewardLineIndex =
        (this.rewardLineIndex + 1) % this.rewardLines.length;
      return true;
    }
    return false;
  }
  createRewardLines() {
    return this.map.rewardLines;
  }
  createMidpoints() {
    let midpoints = new Array(this.rewardLines.length);
    for (let i = 0; i < midpoints.length; ++i) {
      midpoints[i] = {
        x: (this.rewardLines[i].x1 + this.rewardLines[i].x2) / 2,
        y: (this.rewardLines[i].y1 + this.rewardLines[i].y2) / 2,
      };
    }
    return midpoints;
  }
  createRewardLineGs() {
    let rewardLineGs = new Array(this.rewardLines.length);
    for (let i = 0; i < rewardLineGs.length; ++i) {
      rewardLineGs[i] = this.createLineG(this.rewardLines[i], 0xff0000);
    }
    return rewardLineGs;
  }
  createLineG(line, color = 0xffffff) {
    let lineG = new PIXI.Graphics();
    lineG.lineStyle(4, color, 1);
    lineG.moveTo(line.x1, line.y1);
    lineG.lineTo(line.x2, line.y2);
    return lineG;
  }
  render(stage) {
    for (let i = 0; i < this.rewardLineGs.length; ++i) {
      stage.addChild(this.rewardLineGs[i]);
    }
  }
}
