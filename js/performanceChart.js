class PerformanceChart {
  constructor(chartContext) {
    this.config = {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Previous Score",
            backgroundColor: "rgba(0, 0, 125, 0.5)",
            borderColor: "rgb(0, 0, 125)",
            fill: false,
            data: [],
          },
          {
            label: "Best Score",
            backgroundColor: "rgba(125, 0, 0, 0.5)",
            borderColor: "rgb(125, 0, 0)",
            fill: false,
            data: [],
          },
          {
            label: "Average Score",
            backgroundColor: "rgba(0, 125, 0, 0.5)",
            borderColor: "rgb(0, 125, 0)",
            fill: false,
            data: [],
          },
        ],
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: "Performance over Generations",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Generation",
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Score",
              },
            },
          ],
        },
      },
    };
    this.chartContext = chartContext;
    this.chart = new Chart(chartContext, this.config);
  }
  addData(prevScore, bestScore, averageScore, timeStamp) {
    this.config.data.labels.push(timeStamp);
    for (let i = 0; i < 3; ++i) {
      let score;
      switch (i) {
        case 0:
          score = prevScore;
          break;
        case 1:
          score = bestScore;
          break;
        case 2:
          score = averageScore;
          break;
      }
      this.config.data.datasets[i].data.push({
        x: timeStamp,
        y: score,
      });
    }
    if (this.config.data.labels.length > 100) {
      this.config.data.labels.splice(0, 1);
      for (let dataset of this.config.data.datasets) {
        dataset.data.splice(0, 1);
      }
    }
    this.chart.update();
  }
  loadData(values) {}
}
