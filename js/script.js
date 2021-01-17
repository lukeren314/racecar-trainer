// app.renderer.backgroundColor = 0x061639;
// app.renderer.view.style.position = "absolute";
// app.renderer.view.style.display = "block";
// app.renderer.autoResize = true;
// app.renderer.resize(window.innerWidth, window.innerHeight);
const SPEED_LIMIT = 10;

var app;
var map;
var car;

let upKey = keyboard("w");
let downKey = keyboard("s");
let leftKey = keyboard("a");
let rightKey = keyboard("d");

function preload() {
  PIXI.loader
    .add("carImage", "images/car.png")
    .add("map0", "maps/map.json")
    .on("progress", loadProgressHandler)
    .load(setup);
}

function setup() {
  let carConfig = {
    topSpeed: SPEED_LIMIT,
    driftMode: "drift",
  };
  car = new Car(PIXI.loader.resources.carImage.texture, carConfig);
  map = new MapManager(PIXI.loader.resources.map0.data);
  app = new PIXI.Application({
    width: 1280,
    height: 720,
    backgroundColor: 0x1099bb,
  });
  document.getElementById("main").appendChild(app.view);
  car.render(app);
  map.render(app);
  app.ticker.add(update);
  start();
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
    car.turn(-1);
  }
  if (rightKey.isDown) {
    car.turn(1);
  }
  if (car.collidesWithLines(map.lines)) {
    // start();
  }
}

window.onload = () => {
  preload();
};

function loadProgressHandler(loader, resource) {
  console.log("loading: " + resource.url);
  console.log("progress: " + loader.progress + "%");

  // console.log("loading: " + resource.name);
}

function start() {
  car.moveTo(170, 170);
  car.reset();
}
