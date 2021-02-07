var speedSlider;
var speedSliderLabel;
var pauseButton;
var showVisionPointsButton;
var showRewardLinesButton;
var saveModelButton;
var loadModelButton;
var trainTestButton;
var batchGenerationButton;
// chart js
var performanceChartContext;
function setupUI() {
  speedSlider = document.getElementById("speed-slider");
  speedSliderLabel = document.getElementById("speed-slider-label");
  showVisionPointsButton = document.getElementById("show-vision-points-button");
  showRewardLinesButton = document.getElementById("show-reward-lines-button");
  pauseButton = document.getElementById("pause-button");
  saveModelButton = document.getElementById("save-model-button");
  loadModelButton = document.getElementById("load-model-button");
  trainTestButton = document.getElementById("train-test-button");
  batchGenerationButton = document.getElementById("batch-generation-button");

  performanceChartContext = document
    .getElementById("performance-chart")
    .getContext("2d");
}

function setSpeedSliderLabel(value) {
  speedSliderLabel.innerText = value;
}

function getSpeedSliderValue() {
  return parseInt(speedSlider.value);
}

function setShowVisionPointsLabel(value) {
  showVisionPointsButton.innerText = value;
}

function setShowRewardLinesLabel(value) {
  showRewardLinesButton.innerText = value;
}

function setPauseLabel(value) {
  pauseButton.innerText = value;
}

function setSaveModelButton(value) {
  saveModelButton.innerText = value;
}

function setLoadModelButton(value) {
  loadModelButton.innerText = value;
}

function setTrainTestButton(value) {
  trainTestButton.innerText = value;
}

function setBatchGenerationButton(value) {
  batchGenerationButton.innerText = value;
}