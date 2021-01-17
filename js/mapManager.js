class MapManager {
  constructor(mapData) {
    this.lines = mapData.lines;
    this.lineGs = [];
    this.loadMap();
  }
  loadMap() {
    for (let line of this.lines) {
      this.createLine(line);
    }
  }
  createLine(line) {
    let lineG = new PIXI.Graphics();
    lineG.lineStyle(4, 0xffffff, 1);
    lineG.moveTo(line.x1, line.y1);
    lineG.lineTo(line.x2, line.y2);
    this.lineGs.push(lineG);
  }
  render(app) {
    for (let lineG of this.lineGs) {
      app.stage.addChild(lineG);
    }
  }
}
