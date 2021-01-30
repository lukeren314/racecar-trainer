// metrics

const BATCH_SIZE = 5;
const ALPHA = 0.0005;
const N_EPOCHS = 5;
const OUTPUT_SIZE = 9;
const UPDATE_RATE = 1;
const NUM_VISION_POINTS = 7;
const INPUT_DIMS = [NUM_VISION_POINTS + 5];
const LEARN_STEP_RATE = 20;
const IDLE_TIME_MAX = 3000;

const REWARDS = {
  rewardLineReward: 1, //2,
  aliveReward: 0, //0.02,
  velocityReward: 0, //0.002,
  idleTimeOutPenalty: 1,
  rewardLineDistanceReward: 0, //0.025,
};

let upKey = keyboard("w");
let downKey = keyboard("s");
let leftKey = keyboard("a");
let rightKey = keyboard("d");

function preload() {
  PIXI.loader
    .add("carImage", "images/car.png")
    .add("map0", "maps/map1.json")
    .on("progress", loadProgressHandler)
    .load(setup);
}

var env;
var app;
var agent;
var done;
var score;
var observation;
var observation_;
var scoreHistory = [];
var avgScore = 0;
var bestScore = null;
var nSteps = 0;
var learnSteps = 0;
var generation = 0;
var manual = false;
var automatic = true;
var training = true;

var updateRate = UPDATE_RATE;
var paused = true;

function setup() {
  app = new PIXI.Application({
    width: 1280,
    height: 720,
    backgroundColor: 0x1099bb,
  });
  document.getElementById("main").appendChild(app.view);
  env = new Environment({
    mapData: PIXI.loader.resources.map0.data,
    carTexture: PIXI.loader.resources.carImage.texture,
    numVisionPoints: NUM_VISION_POINTS,
    inputSize: INPUT_DIMS[0],
    outputSize: OUTPUT_SIZE,
    rewards: REWARDS,
    idleTimeMax: IDLE_TIME_MAX,
  });
  env.render(app.stage);
  agent = new Agent(
    env.getNumActions(),
    INPUT_DIMS,
    BATCH_SIZE,
    ALPHA,
    N_EPOCHS
  );

  setupUI();
  setupController();
  reset();
  app.ticker.add(update);
}

function fullReset() {
  reset();
  agent.memory.clearMemory();
}

function reset() {
  env.reset();
  observation = env.getObservation();
  done = false;
  score = 0;
}

var rewardReports = [];
var counter = 0;
function update(delta) {
  if (!paused) {
    counter += updateRate;
    while (counter > 0) {
      if (manual) {
        if (upKey.isDown) {
          env.car.accelerate();
        }
        if (downKey.isDown) {
          env.car.decelerate();
        }
        if (leftKey.isDown) {
          env.car.turnLeft();
        }
        if (rightKey.isDown) {
          env.car.turnRight();
        }
        if (
          !upKey.isDown &&
          !downKey.isDown &&
          !leftKey.isDown &&
          !rightKey.isDown
        ) {
          env.car.doNothing();
        }
      }
      [action, prob, val] = agent.chooseAction(observation);
      if (automatic) {
        env.action(action);
      }
      env.update();
      [observation_, reward, done] = env.step();
      ++nSteps;
      score += reward;
      agent.remember(observation, action, prob, val, reward, done);
      if (nSteps % LEARN_STEP_RATE == 0) {
        if (automatic && training) {
          agent.learn();
        } else {
          agent.memory.clearMemory();
        }
        ++learnSteps;
      }
      observation = observation_;

      if (env.done) {
        scoreHistory.push(score);
        let pastScores = scoreHistory.slice(scoreHistory.length - 100);
        avgScore = pastScores.reduce((a, b) => a + b, 0) / pastScores.length;
        if (bestScore == null || score > bestScore) {
          bestScore = score;
        }
        rewardReports.push(env.rewards.rewardReport);
        // console.log(env.car.getPosition());
        env.rewards.resetReport();
        // plot the curve
        performanceChart.addData(score, bestScore, avgScore, generation);
        // console.log(
        //   `score: ${score} avgScore: ${avgScore} timeSteps: ${nSteps} agentSteps: ${learnSteps}`
        // );
        ++generation;
        reset();
      }
      --counter;
    }
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
