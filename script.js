// app.renderer.backgroundColor = 0x061639;
// app.renderer.view.style.position = "absolute";
// app.renderer.view.style.display = "block";
// app.renderer.autoResize = true;
// app.renderer.resize(window.innerWidth, window.innerHeight);

var car;
var app;

let upKey = keyboard("w");
let downKey = keyboard("s");
let leftKey = keyboard("a");
let rightKey = keyboard("d");

function preload() {
  PIXI.loader
    .add("carImage", "car.png")
    .on("progress", loadProgressHandler)
    .load(setup);
}

function loadProgressHandler(loader, resource) {
  //Display the file `url` currently being loaded
  console.log("loading: " + resource.url);

  //Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%");

  //If you gave your files names as the first argument
  //of the `add` method, you can access them like this
  //console.log("loading: " + resource.name);
}

function setup() {
  car = new Car(PIXI.loader.resources.carImage.texture);
  app = new PIXI.Application({
    width: 800,
    height: 600,
    transparent: false,
  });
  document.body.appendChild(app.view);

  app.stage.addChild(car.sprite);

  window.requestAnimationFrame(loop);
}

function update(elapsed) {
  car.update();
  if (upKey.isDown) {
    car.accelerate(1);
  }
  if (downKey.isDown) {
    car.decelerate(1);
  }
  if (leftKey.isDown) {
    car.turn(-0.1);
  }
  if (rightKey.isDown) {
    car.turn(0.1);
  }
}

function draw() {}

var lastRender = 0;
function loop(timestamp) {
  var progress = timestamp - lastRender;

  update(progress);
  draw();

  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}

window.onload = () => {
  preload();
};
