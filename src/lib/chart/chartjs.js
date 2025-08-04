// src/lib/chartjs.js
import { Chart } from 'chart.js';

const colors = [
  '#00ff00',
  '#ffff00',
  '#ff0000',
  '#00ffff',
  '#3333ff',
  '#FF9F40', // Orange
  '#00BFFF', // Deep Sky Blue
  '#7CFC00', // Lawn Green
  '#FF4500', // Red-Orange
  '#FFE4C4', // Bisque
  '#008080', // Teal2
  '#FF8C00', // Dark Orange
  '#F08080', // Light Coral
  '#87CEEB', // Sky Blue
  '#FFE4B5', // Papaya Whip
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#ADD8E6', // Light Blue
  '#FF6384', // Red
  '#6495ED', // Cornflower Blue
  '#4BC0C0', // Teal
  '#FF9F40', // Orange
  '#00FF7F', // Spring Green
  '#FF6347', // Tomato
  '#1E90FF', // Dodger Blue
  '#FFD700', // Gold
  '#FF0000', // Red
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FFA500', // Orange
];

class Chartjs {
  chart;
  labelColors = {};
  type;
  constructor(ref, dataset) {
    this.type = dataset.type || 'bar';
    this.makeChart(ref);
    this.loadDataset(ref, dataset);
  }

  loadDataset(ref, dataset) {
    if (dataset.type && dataset.type != this.type) {
      this.type = dataset.type;
      this.makeChart(ref);
    }
    const extra = [];
    const length = dataset.data?.length;
    const { keepColor } = dataset;

    let usedColors = colors.slice(0, length);
    if (keepColor) {
      usedColors = dataset.labels?.map((label) => {
        if (colors.length <= Object.keys(this.labelColors).length) {
          colors.push(...colors);
        }
        this.labelColors[label] =
          this.labelColors[label] || colors[Object.keys(this.labelColors).length];
        return this.labelColors[label];
      });
    }

    if (dataset.type && dataset.type == 'bar') {
      extra.push('#00000000');
      dataset.labels?.unshift('');
      dataset.labels?.push('');
      dataset.data?.unshift(0);
      dataset.data?.push(0);
    }
    this.chart.data = {
      labels: dataset.labels, // ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.backgroundColor || [
            ...extra,
            ...usedColors.map((c) => c + '33'),
            ...extra,
          ],
          borderColor: dataset.borderColor || [
            ...extra,
            ...usedColors.map((c) => c + 'ff'),
            ...extra,
          ],
          borderWidth: 1,
        },
      ],
    };
    const ctx2 = ref.current.getContext('2d');
    this.chart.ctx = ctx2;
    try {
      this.chart.update();
    } catch {
      /* empty */
    }
  }

  makeChart(ref) {
    if (!ref.current) {
      return;
    }
    const ctx2 = ref.current.getContext('2d');
    if (!ctx2) {
      return;
    }
    this.destroyChart();
    this.chart = new Chart(ctx2, {
      type: this.type,
      options: {
        responsive: true,
        height: 100,
        scales: {
          yAxes: [
            {
              beginAtZero: true,
              gridLines: {
                color: 'rgba(255,255,255,0.2)',
              },
              ticks: {
                fontColor: 'lightGrey',
                beginAtZero: true,
              },
            },
          ],
          xAxes: [
            {
              display: this.type == 'bar',
              ticks: {
                fontColor: 'white',
              },
            },
          ],
        },
        legend: {
          display: this.type != 'bar',
          labels: {
            fontColor: 'white',
          },
        },
        maintainAspectRatio: false,
      },
    });
  }
  hideXAxisTicks() {
    this.chart.options.scales.xAxes[0].ticks.position = 'right';
    this.chart.update();
  }
  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

export default Chartjs;
