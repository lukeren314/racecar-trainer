class MapData {
  constructor(mapData) {
    this.lines = mapData.lines;
    this.rewardLines = mapData.rewardLines;
    this.spawnPoint = {
      x: 170,
      y: 300,
    };
    this.lineGs = this.createLineGs();
  }
  spawnPoint() {
    return this.spawnPoint;
  }
  createLineGs() {
    let lineGs = new Array(this.lines.length);
    for (let i = 0; i < lineGs.length; ++i) {
      lineGs[i] = this.createLineG(this.lines[i]);
    }
    return lineGs;
  }
  createLineG(line, color = 0xffffff) {
    let lineG = new PIXI.Graphics();
    lineG.lineStyle(4, color, 1);
    lineG.moveTo(line.x1, line.y1);
    lineG.lineTo(line.x2, line.y2);
    return lineG;
  }
  render(stage) {
    for (let i = 0; i < this.lineGs.length; ++i) {
      stage.addChild(this.lineGs[i]);
    }
  }
}
