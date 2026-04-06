/**
 * Tests for src/plugins.js (copyToClipboard) and src/icons.js.
 *
 * Both modules extend the Staminia namespace object, so we set up the
 * required stubs before importing and then drive the exported functions.
 */

import { vi, describe, it, expect, beforeAll, afterEach } from "vitest";
import Staminia from "../src/staminia.js";

// Sets Staminia.icons (required by copyToClipboard's .then() callback)
import "../src/icons.js";

// Sets Staminia.copyToClipboard
import "../src/plugins.js";

// ---------------------------------------------------------------------------
// Global stubs expected by copyToClipboard
// ---------------------------------------------------------------------------

beforeAll(() => {
  Staminia.CONFIG = Staminia.CONFIG || { DEBUG: false };
  Staminia.messages = Staminia.messages || {};
  Staminia.messages.copied_to_clipboard = "Copied!";
  Staminia.messages.copy_to_clipboard = "Copy to clipboard";

  // Default bootstrap stub (no active tooltip)
  window.bootstrap = {
    Tooltip: { getInstance: vi.fn(() => null) },
  };
});

// Reset clipboard mock between tests to avoid state leakage
afterEach(() => {
  vi.restoreAllMocks();
  window.bootstrap.Tooltip.getInstance = vi.fn(() => null);
});

// ---------------------------------------------------------------------------
// icons.js – verifies the module populates Staminia.icons
// ---------------------------------------------------------------------------

describe("icons.js", () => {
  it("populates Staminia.icons with the expected keys", () => {
    expect(Staminia.icons).toBeDefined();
    for (const key of ["clipboard", "check", "xmark", "triangle-exclamation", "clock"]) {
      expect(Staminia.icons).toHaveProperty(key);
    }
  });

  it("each icon value is a non-empty string containing an <svg> element", () => {
    for (const [key, value] of Object.entries(Staminia.icons)) {
      expect(typeof value, `icon '${key}' should be a string`).toBe("string");
      expect(value, `icon '${key}' should contain <svg`).toContain("<svg");
    }
  });
});

// ---------------------------------------------------------------------------
// plugins.js – copyToClipboard
// ---------------------------------------------------------------------------

describe("copyToClipboard – clipboard unavailable", () => {
  it("is a function on the Staminia namespace", () => {
    expect(typeof Staminia.copyToClipboard).toBe("function");
  });

  it("does nothing and does not throw when navigator.clipboard is falsy", () => {
    const desc = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });

    const btn = document.createElement("button");
    btn.innerHTML = "Copy";

    expect(() => Staminia.copyToClipboard("hello", btn)).not.toThrow();
    expect(btn.innerHTML).toBe("Copy"); // unchanged

    // Restore
    if (desc) {
      Object.defineProperty(navigator, "clipboard", desc);
    }
  });
});

describe("copyToClipboard – clipboard available", () => {
  function mockClipboard() {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    return writeText;
  }

  it("calls navigator.clipboard.writeText with the provided text", () => {
    const writeText = mockClipboard();
    const btn = document.createElement("button");
    btn.innerHTML = "Copy";

    Staminia.copyToClipboard("hello clipboard", btn);
    expect(writeText).toHaveBeenCalledWith("hello clipboard");
  });

  it("updates button innerHTML to the check icon after a successful copy", async () => {
    mockClipboard();
    const btn = document.createElement("button");
    btn.innerHTML = "Copy";

    Staminia.copyToClipboard("text", btn);

    // Flush the microtask queue so the .then() callback runs
    await Promise.resolve();

    // jsdom re-serialises SVG (self-closing <path/> → <path></path>), so
    // use a structural check instead of strict string equality.
    expect(btn.innerHTML).toContain("<svg");
  });

  it("resets button innerHTML after 2 seconds", async () => {
    vi.useFakeTimers();
    mockClipboard();
    const btn = document.createElement("button");
    const originalHTML = "Copy original";
    btn.innerHTML = originalHTML;

    Staminia.copyToClipboard("text", btn);
    await Promise.resolve(); // let .then() run

    // Button shows the check SVG (jsdom may normalise it, so structural check)
    expect(btn.innerHTML).toContain("<svg");

    // Advance fake timers past the 2-second reset timeout
    vi.advanceTimersByTime(2100);
    expect(btn.innerHTML).toBe(originalHTML);

    vi.useRealTimers();
  });

  it("calls tooltip.setContent with the 'copied' message when a tooltip exists", async () => {
    const setContent = vi.fn();
    window.bootstrap.Tooltip.getInstance = vi.fn(() => ({ setContent }));

    mockClipboard();
    const btn = document.createElement("button");
    btn.innerHTML = "Copy";

    Staminia.copyToClipboard("text", btn);
    await Promise.resolve();

    expect(setContent).toHaveBeenCalledWith({
      ".tooltip-inner": Staminia.messages.copied_to_clipboard,
    });
  });

  it("restores the tooltip title after 2 seconds", async () => {
    vi.useFakeTimers();
    const setContent = vi.fn();
    window.bootstrap.Tooltip.getInstance = vi.fn(() => ({ setContent }));

    mockClipboard();
    const btn = document.createElement("button");
    btn.innerHTML = "Copy";

    Staminia.copyToClipboard("text", btn);
    await Promise.resolve();

    vi.advanceTimersByTime(2100);

    const calls = setContent.mock.calls;
    // Second call should restore 'copy_to_clipboard' message
    expect(calls.length).toBe(2);
    expect(calls[1][0]).toEqual({
      ".tooltip-inner": Staminia.messages.copy_to_clipboard,
    });

    vi.useRealTimers();
  });

  it("does not throw when no tooltip is associated with the button", async () => {
    window.bootstrap.Tooltip.getInstance = vi.fn(() => null);
    mockClipboard();

    const btn = document.createElement("button");
    btn.innerHTML = "Copy";

    Staminia.copyToClipboard("text", btn);
    await expect(Promise.resolve()).resolves.not.toThrow();
  });
});
