// app.renderer.backgroundColor = 0x061639;
// app.renderer.view.style.position = "absolute";
// app.renderer.view.style.display = "block";
// app.renderer.autoResize = true;
// app.renderer.resize(window.innerWidth, window.innerHeight);
const SPEED_LIMIT = 10;

var car;
var app;

let upKey = keyboard("w");
let downKey = keyboard("s");
let leftKey = keyboard("a");
let rightKey = keyboard("d");

function preload() {
  PIXI.loader
    .add("carImage", "images/car.png")
    .on("progress", loadProgressHandler)
    .load(setup);
}

function loadProgressHandler(loader, resource) {
  console.log("loading: " + resource.url);

  console.log("progress: " + loader.progress + "%");

  // console.log("loading: " + resource.name);
}

function setup() {
  let carConfig = {
    topSpeed: SPEED_LIMIT,
  };
  car = new Car(PIXI.loader.resources.carImage.texture, carConfig);
  app = new PIXI.Application({
    width: 1600,
    height: 900,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
  });
  document.getElementById("main").appendChild(app.view);

  app.stage.addChild(car.sprite);
  app.ticker.add(update);
  start();
}

function start() {
  car.moveTo(170, 170);
}

function update(delta) {
  car.update();
  if (upKey.isDown) {
    car.accelerate(0.5);
  }
  if (downKey.isDown) {
    car.decelerate(0.5);
  }
  if (leftKey.isDown) {
    car.turn(-0.1);
  }
  if (rightKey.isDown) {
    car.turn(0.1);
  }
}

window.onload = () => {
  preload();
};
