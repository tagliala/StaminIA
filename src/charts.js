// Chart.js module — tree-shaken, Bootstrap-themed, dark/light aware
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Filler, Tooltip, Legend);

const MINUTE_TICKS = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 89];

let chartTotal = null;
let chartPartials = null;

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function themeColors() {
  return {
    blue: getCssVar("--bs-primary"),
    blueRgb: getCssVar("--bs-primary-rgb"),
    red: getCssVar("--bs-danger"),
    redRgb: getCssVar("--bs-danger-rgb"),
    green: getCssVar("--bs-success"),
    greenRgb: getCssVar("--bs-success-rgb"),
    grid: getCssVar("--bs-border-color"),
    tick: getCssVar("--bs-secondary-color"),
    tooltipBg: getCssVar("--bs-tertiary-bg"),
    tooltipColor: getCssVar("--bs-body-color"),
    tooltipBorder: getCssVar("--bs-border-color"),
  };
}

function baseScales(c) {
  return {
    x: {
      type: "linear",
      border: { color: c.grid },
      grid: { color: `rgba(${getCssVar("--bs-secondary-color-rgb") || "128,128,128"}, 0.15)` },
      ticks: { color: c.tick },
      afterBuildTicks: (axis) => {
        axis.ticks = MINUTE_TICKS.map((v) => ({ value: v }));
      },
    },
    y: {
      border: { color: c.grid },
      grid: { color: `rgba(${getCssVar("--bs-secondary-color-rgb") || "128,128,128"}, 0.15)` },
      ticks: {
        color: c.tick,
        callback: (val) => val.toFixed(2),
      },
    },
  };
}

function tooltipPlugin(c, messages) {
  return {
    tooltip: {
      backgroundColor: c.tooltipBg,
      titleColor: c.tooltipColor,
      bodyColor: c.tooltipColor,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      padding: 6,
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        title: (items) => `${messages.substitution_minute}: ${items[0].parsed.x}`,
        label: (item) => `${messages.contribution}: ${item.parsed.y.toFixed(2)}`,
      },
    },
  };
}

function ensureCanvas(container) {
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  return canvas;
}

function toXY(pairs) {
  return pairs.map(([x, y]) => ({ x, y }));
}

export function renderTotalChart(containerEl, plotData, yMin, yMax, messages) {
  if (chartTotal) chartTotal.destroy();
  const c = themeColors();
  const canvas = ensureCanvas(containerEl);

  chartTotal = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [{
        data: toXY(plotData),
        borderColor: c.blue,
        backgroundColor: `rgba(${c.blueRgb}, 0.12)`,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 8,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: c.blue,
        fill: true,
        tension: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        ...baseScales(c),
        y: {
          ...baseScales(c).y,
          min: Number(yMin * 0.99),
          max: Number(yMax * 1.01),
        },
      },
      plugins: {
        legend: { display: false },
        ...tooltipPlugin(c, messages),
      },
    },
  });
}

export function renderPartialsChart(containerEl, p1Data, p2Data, p1Label, p2Label, messages) {
  if (chartPartials) chartPartials.destroy();
  const c = themeColors();
  const canvas = ensureCanvas(containerEl);

  chartPartials = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: p1Label,
          data: toXY(p1Data),
          borderColor: c.red,
          backgroundColor: `rgba(${c.redRgb}, 0.12)`,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 8,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: c.red,
          fill: true,
          tension: 0,
        },
        {
          label: p2Label,
          data: toXY(p2Data),
          borderColor: c.green,
          backgroundColor: `rgba(${c.greenRgb}, 0.12)`,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 8,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: c.green,
          fill: true,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: baseScales(c),
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: c.tick,
            usePointStyle: true,
            pointStyle: "rectRounded",
            padding: 16,
          },
        },
        tooltip: {
          ...tooltipPlugin(c, messages).tooltip,
          displayColors: true,
          callbacks: {
            title: (items) => `${messages.substitution_minute}: ${items[0].parsed.x}`,
            label: (item) => ` ${item.dataset.label}: ${item.parsed.y.toFixed(2)}`,
          },
        },
      },
    },
  });
}

export function destroyCharts() {
  if (chartTotal) { chartTotal.destroy(); chartTotal = null; }
  if (chartPartials) { chartPartials.destroy(); chartPartials = null; }
}

export function resizeCharts() {
  if (chartTotal) chartTotal.resize();
  if (chartPartials) chartPartials.resize();
}

export function updateChartsTheme() {
  if (!chartTotal && !chartPartials) return;
  const c = themeColors();

  for (const chart of [chartTotal, chartPartials]) {
    if (!chart) continue;
    const opts = chart.options;

    // Update scales
    for (const axis of ["x", "y"]) {
      opts.scales[axis].border.color = c.grid;
      opts.scales[axis].grid.color = `rgba(${getCssVar("--bs-secondary-color-rgb") || "128,128,128"}, 0.15)`;
      opts.scales[axis].ticks.color = c.tick;
    }

    // Update tooltip
    opts.plugins.tooltip.backgroundColor = c.tooltipBg;
    opts.plugins.tooltip.titleColor = c.tooltipColor;
    opts.plugins.tooltip.bodyColor = c.tooltipColor;
    opts.plugins.tooltip.borderColor = c.tooltipBorder;

    // Update legend
    if (opts.plugins.legend.display !== false) {
      opts.plugins.legend.labels.color = c.tick;
    }
  }

  // Update dataset colors
  if (chartTotal) {
    chartTotal.data.datasets[0].borderColor = c.blue;
    chartTotal.data.datasets[0].backgroundColor = `rgba(${c.blueRgb}, 0.12)`;
    chartTotal.data.datasets[0].pointHoverBackgroundColor = c.blue;
    chartTotal.update();
  }

  if (chartPartials) {
    const ds = chartPartials.data.datasets;
    ds[0].borderColor = c.red;
    ds[0].backgroundColor = `rgba(${c.redRgb}, 0.12)`;
    ds[0].pointHoverBackgroundColor = c.red;
    ds[1].borderColor = c.green;
    ds[1].backgroundColor = `rgba(${c.greenRgb}, 0.12)`;
    ds[1].pointHoverBackgroundColor = c.green;
    chartPartials.update();
  }
}
