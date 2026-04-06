/**
 * Tests for src/charts.js.
 *
 * Chart.js is mocked via vi.mock so no real canvas/2D context is needed.
 * The mock records constructor calls and provides the same interface
 * (data, options, destroy, resize, update) that updateChartsTheme() uses.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted Chart.js mock – must be declared with vi.hoisted so the factory
// below can reference it before ES imports are resolved.
// ---------------------------------------------------------------------------
const MockChart = vi.hoisted(() => {
  const Ctor = vi.fn().mockImplementation(function (_canvas, config) {
    this.data = config.data;
    this.options = config.options;
    this.destroy = vi.fn();
    this.resize = vi.fn();
    this.update = vi.fn();
  });
  Ctor.register = vi.fn();
  return Ctor;
});

vi.mock("chart.js", () => ({
  Chart: MockChart,
  LineController: {},
  LineElement: {},
  PointElement: {},
  LinearScale: {},
  Filler: {},
  Tooltip: {},
  Legend: {},
}));

import {
  renderTotalChart,
  renderPartialsChart,
  destroyCharts,
  resizeCharts,
  updateChartsTheme,
} from "../src/charts.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const messages = {
  substitution_minute: "Min",
  contribution: "Contrib",
  p1_contrib: "P1",
  p2_contrib: "P2",
};

// Minimal plot data: [[minute, value], ...]
const sampleData = [
  [1, 5.0],
  [6, 4.9],
  [46, 4.7],
  [89, 4.5],
];

function makeContainer() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ---------------------------------------------------------------------------
// No-chart state tests (run before any render)
// ---------------------------------------------------------------------------

describe("destroyCharts – no charts rendered", () => {
  it("does not throw", () => {
    expect(() => destroyCharts()).not.toThrow();
  });
});

describe("resizeCharts – no charts rendered", () => {
  it("does not throw", () => {
    expect(() => resizeCharts()).not.toThrow();
  });
});

describe("updateChartsTheme – no charts rendered", () => {
  it("returns early without throwing", () => {
    expect(() => updateChartsTheme()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// renderTotalChart
// ---------------------------------------------------------------------------

describe("renderTotalChart", () => {
  let container;

  beforeEach(() => {
    MockChart.mockClear();
    destroyCharts();
    container = makeContainer();
  });

  afterEach(() => {
    destroyCharts();
    container.parentElement?.removeChild(container);
  });

  it("creates exactly one Chart instance", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    expect(MockChart).toHaveBeenCalledOnce();
  });

  it("injects a <canvas> element into the container", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("sets chart type to 'line'", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    expect(MockChart.mock.calls[0][1].type).toBe("line");
  });

  it("converts [[x,y]] pairs to {x,y} objects", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const dataset = MockChart.mock.calls[0][1].data.datasets[0];
    expect(dataset.data[0]).toEqual({ x: 1, y: 5.0 });
    expect(dataset.data[3]).toEqual({ x: 89, y: 4.5 });
  });

  it("has exactly one dataset", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    expect(MockChart.mock.calls[0][1].data.datasets).toHaveLength(1);
  });

  it("applies yMin/yMax to the y scale", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const yScale = MockChart.mock.calls[0][1].options.scales.y;
    expect(yScale.min).toBeCloseTo(4.4 * 0.99, 5);
    expect(yScale.max).toBeCloseTo(5.0 * 1.01, 5);
  });

  it("hides the legend (display: false)", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const legend = MockChart.mock.calls[0][1].options.plugins.legend;
    expect(legend.display).toBe(false);
  });

  it("destroys the previous total chart when called again", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const firstInstance = MockChart.mock.instances[0];

    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    expect(firstInstance.destroy).toHaveBeenCalledOnce();
    expect(MockChart).toHaveBeenCalledTimes(2);
  });

  it("tooltip title callback uses messages.substitution_minute", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const titleFn = MockChart.mock.calls[0][1].options.plugins.tooltip.callbacks.title;
    const result = titleFn([{ parsed: { x: 42 } }]);
    expect(result).toContain("Min");
    expect(result).toContain("42");
  });

  it("tooltip label callback uses messages.contribution", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const labelFn = MockChart.mock.calls[0][1].options.plugins.tooltip.callbacks.label;
    const result = labelFn({ parsed: { y: 4.75 } });
    expect(result).toContain("Contrib");
    expect(result).toContain("4.75");
  });

  it("afterBuildTicks callback replaces axis.ticks with MINUTE_TICKS objects", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const afterBuildTicks = MockChart.mock.calls[0][1].options.scales.x.afterBuildTicks;
    const axis = { ticks: [] };
    afterBuildTicks(axis);
    // Should replace ticks with objects derived from MINUTE_TICKS
    expect(axis.ticks).toBeInstanceOf(Array);
    expect(axis.ticks.length).toBeGreaterThan(0);
    expect(axis.ticks[0]).toHaveProperty("value");
    // First MINUTE_TICK is 1
    expect(axis.ticks[0].value).toBe(1);
  });

  it("y.ticks.callback formats a value to 2 decimal places", () => {
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    const callback = MockChart.mock.calls[0][1].options.scales.y.ticks.callback;
    expect(callback(4.5)).toBe("4.50");
    expect(callback(10)).toBe("10.00");
  });
});

// ---------------------------------------------------------------------------
// renderPartialsChart
// ---------------------------------------------------------------------------

describe("renderPartialsChart", () => {
  let container;

  beforeEach(() => {
    MockChart.mockClear();
    destroyCharts();
    container = makeContainer();
  });

  afterEach(() => {
    destroyCharts();
    container.parentElement?.removeChild(container);
  });

  it("creates exactly one Chart instance", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    expect(MockChart).toHaveBeenCalledOnce();
  });

  it("produces two datasets", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    expect(MockChart.mock.calls[0][1].data.datasets).toHaveLength(2);
  });

  it("labels the datasets correctly", () => {
    renderPartialsChart(container, sampleData, sampleData, "Starter", "Sub", messages);
    const { datasets } = MockChart.mock.calls[0][1].data;
    expect(datasets[0].label).toBe("Starter");
    expect(datasets[1].label).toBe("Sub");
  });

  it("converts plot data to {x,y} objects for both datasets", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    const { datasets } = MockChart.mock.calls[0][1].data;
    expect(datasets[0].data[0]).toEqual({ x: 1, y: 5.0 });
    expect(datasets[1].data[0]).toEqual({ x: 1, y: 5.0 });
  });

  it("tooltip title callback uses messages.substitution_minute", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    const titleFn = MockChart.mock.calls[0][1].options.plugins.tooltip.callbacks.title;
    const result = titleFn([{ parsed: { x: 55 } }]);
    expect(result).toContain("55");
  });

  it("afterBuildTicks callback replaces axis.ticks with MINUTE_TICKS objects", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    const afterBuildTicks = MockChart.mock.calls[0][1].options.scales.x.afterBuildTicks;
    const axis = { ticks: [] };
    afterBuildTicks(axis);
    expect(axis.ticks[0]).toHaveProperty("value", 1);
  });

  it("y.ticks.callback formats values to 2 decimal places", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    const callback = MockChart.mock.calls[0][1].options.scales.y.ticks.callback;
    expect(callback(7.5)).toBe("7.50");
  });

  it("destroys the previous partials chart when called again", () => {
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    const firstInstance = MockChart.mock.instances[0];

    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
    expect(firstInstance.destroy).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// destroyCharts – after rendering both charts
// ---------------------------------------------------------------------------

describe("destroyCharts – charts rendered", () => {
  let container;

  beforeEach(() => {
    MockChart.mockClear();
    container = makeContainer();
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
  });

  afterEach(() => {
    container.parentElement?.removeChild(container);
  });

  it("calls destroy() on the total chart instance", () => {
    const [total] = MockChart.mock.instances;
    destroyCharts();
    expect(total.destroy).toHaveBeenCalledOnce();
  });

  it("calls destroy() on the partials chart instance", () => {
    const [, partial] = MockChart.mock.instances;
    destroyCharts();
    expect(partial.destroy).toHaveBeenCalledOnce();
  });

  it("resizeCharts becomes a no-op after destroy", () => {
    destroyCharts();
    expect(() => resizeCharts()).not.toThrow();
  });

  it("updateChartsTheme becomes a no-op after destroy", () => {
    destroyCharts();
    expect(() => updateChartsTheme()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// resizeCharts – charts rendered
// ---------------------------------------------------------------------------

describe("resizeCharts – charts rendered", () => {
  let container;

  beforeEach(() => {
    MockChart.mockClear();
    container = makeContainer();
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
  });

  afterEach(() => {
    destroyCharts();
    container.parentElement?.removeChild(container);
  });

  it("calls resize() on both chart instances", () => {
    const [total, partial] = MockChart.mock.instances;
    resizeCharts();
    expect(total.resize).toHaveBeenCalledOnce();
    expect(partial.resize).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// updateChartsTheme – charts rendered
// ---------------------------------------------------------------------------

describe("updateChartsTheme – charts rendered", () => {
  let container;

  beforeEach(() => {
    MockChart.mockClear();
    container = makeContainer();
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    renderPartialsChart(container, sampleData, sampleData, "P1", "P2", messages);
  });

  afterEach(() => {
    destroyCharts();
    container.parentElement?.removeChild(container);
  });

  it("does not throw", () => {
    expect(() => updateChartsTheme()).not.toThrow();
  });

  it("calls update() on the total chart", () => {
    const [total] = MockChart.mock.instances;
    updateChartsTheme();
    expect(total.update).toHaveBeenCalledOnce();
  });

  it("calls update() on the partials chart", () => {
    const [, partial] = MockChart.mock.instances;
    updateChartsTheme();
    expect(partial.update).toHaveBeenCalledOnce();
  });

  it("mutates dataset borderColor on the total chart", () => {
    const [total] = MockChart.mock.instances;
    updateChartsTheme();
    // After update, borderColor is set from CSS var (empty string in jsdom,
    // but it has been written).
    expect(total.data.datasets[0]).toHaveProperty("borderColor");
  });

  it("mutates both dataset borderColors on the partials chart", () => {
    const [, partial] = MockChart.mock.instances;
    updateChartsTheme();
    expect(partial.data.datasets[0]).toHaveProperty("borderColor");
    expect(partial.data.datasets[1]).toHaveProperty("borderColor");
  });

  it("updates tooltip background on both charts", () => {
    const [total, partial] = MockChart.mock.instances;
    updateChartsTheme();
    // The function writes to opts.plugins.tooltip.backgroundColor
    expect(total.options.plugins.tooltip).toHaveProperty("backgroundColor");
    expect(partial.options.plugins.tooltip).toHaveProperty("backgroundColor");
  });

  it("updates legend label color for chartPartials (display not false)", () => {
    // chartPartials has legend.display undefined (not false), so the
    // opts.plugins.legend.labels.color branch inside updateChartsTheme executes.
    const [, partial] = MockChart.mock.instances;
    const originalColor = partial.options.plugins.legend.labels.color;
    updateChartsTheme();
    // The property is written (even if CSS var returns '' in jsdom)
    expect(partial.options.plugins.legend.labels).toHaveProperty("color");
    // chartTotal has display:false so that branch is NOT taken for it
    const [total] = MockChart.mock.instances;
    expect(total.options.plugins.legend.display).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateChartsTheme – only totalChart rendered (partials null)
// ---------------------------------------------------------------------------

describe("updateChartsTheme – only totalChart rendered", () => {
  let container;

  beforeEach(() => {
    MockChart.mockClear();
    destroyCharts();
    container = makeContainer();
    renderTotalChart(container, sampleData, 4.4, 5.0, messages);
    // Note: renderPartialsChart is NOT called here
  });

  afterEach(() => {
    destroyCharts();
    container.parentElement?.removeChild(container);
  });

  it("does not throw when partials chart is null", () => {
    expect(() => updateChartsTheme()).not.toThrow();
  });

  it("still calls update() on the total chart", () => {
    const [total] = MockChart.mock.instances;
    updateChartsTheme();
    expect(total.update).toHaveBeenCalledOnce();
  });
});
