// chart js
var performanceChart;

function setupController() {
  speedSlider.oninput = onSpeedSliderChanged;
  showVisionPointsButton.onclick = onShowVisionPointsButtonClicked;
  showRewardLinesButton.onclick = onShowRewardLinesButtonClicked;
  pauseButton.onclick = onPauseButtonClicked;
  saveModelButton.onclick = onSaveModelButtonClicked;
  loadModelButton.onclick = onLoadModelButtonClicked;
  trainTestButton.onclick = onTrainTestButtonClicked;

  // chart js
  performanceChart = new PerformanceChart(performanceChartContext);
}

function onSpeedSliderChanged() {
  updateRate = getSpeedSliderValue() * 0.02;
  setSpeedSliderLabel(updateRate.toFixed(2) + "x");
}

function onShowVisionPointsButtonClicked() {
  env.car.setShowVisionPoints(!env.car.showVisionPoints);
  setShowVisionPointsLabel(
    env.car.showVisionPoints ? "Hide Vision Points" : "Show Vision Points"
  );
}

function onShowRewardLinesButtonClicked() {
  env.rewards.setShowRewardLines(!env.rewards.showRewardLines);
  setShowRewardLinesLabel(
    env.rewards.showRewardLines ? "Hide Reward Lines" : "Show Reward Lines"
  );
}

function onPauseButtonClicked() {
  paused = !paused;
  setPauseLabel(paused ? "Start" : "Pause");
}

async function onSaveModelButtonClicked() {
  let saveSuccess = await agent.saveModels();
  setSaveModelButton(saveSuccess ? "Save Success!" : "Save Failed");
  setTimeout(() => {
    setSaveModelButton("Save Model");
  }, 1500);
}

async function onLoadModelButtonClicked() {
  const loadSuccess = await agent.loadModels();
  reset();
  setLoadModelButton(saveSuccess ? "Load Success!" : "Load Failed");
  setTimeout(() => {
    setLoadModelButton("Load Model");
  }, 1500);
}

function onTrainTestButtonClicked() {
  training = !training;
  fullReset();
  setTrainTestButton(training ? "Test!" : "Train!");
}
