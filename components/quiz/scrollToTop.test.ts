import assert from "node:assert/strict";
import test from "node:test";
import { scrollQuizToTop } from "./scrollToTop.ts";

function setup(reducedMotion = false) {
  const frames = new Map<number, FrameRequestCallback>();
  const scrolls: ScrollToOptions[] = [];
  let id = 0;
  const browser = {
    scrollY: 500,
    scrollTo(options: ScrollToOptions) { scrolls.push(options); },
    matchMedia: () => ({ matches: reducedMotion }),
    requestAnimationFrame(callback: FrameRequestCallback) { frames.set(++id, callback); return id; },
    cancelAnimationFrame(frame: number) { frames.delete(frame); },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  const frame = (y: number, time: number) => {
    browser.scrollY = y;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(time));
  };
  return { browser, frames, scrolls, frame };
}

test("navigation refresh waits for the scroll to settle at the top and fires only once", () => {
  const env = setup();
  let refreshes = 0;
  scrollQuizToTop(() => refreshes++);
  assert.deepEqual(env.scrolls, [], "wait for React to commit the next question");
  env.frame(500, 0);
  assert.deepEqual(env.scrolls, [{ top: 0, behavior: "smooth" }]);
  env.frame(350, 8);
  env.frame(100, 16);
  env.frame(0, 32);
  assert.equal(refreshes, 0, "the new question must settle before requesting ads");
  env.frame(0, 48);
  env.frame(0, 64);
  assert.equal(refreshes, 1);
  assert.equal(env.frames.size, 0);
});

test("reduced motion and already-at-top navigation still refresh once", () => {
  const env = setup(true);
  env.browser.scrollY = 0;
  let refreshes = 0;
  scrollQuizToTop(() => refreshes++);
  env.frame(0, 0);
  assert.deepEqual(env.scrolls, [{ top: 0, behavior: "instant" }]);
  env.frame(0, 16);
  env.frame(0, 32);
  assert.equal(refreshes, 1);
});

test("leaving the question or interrupting the scroll cannot cause a delayed refresh", () => {
  const env = setup();
  let refreshes = 0;
  const cancel = scrollQuizToTop(() => refreshes++);
  env.frame(100, 0);
  cancel();
  env.frame(0, 16);
  assert.equal(refreshes, 0);
  scrollQuizToTop(() => refreshes++);
  env.frame(50, 20);
  env.frame(50, 36);
  env.frame(50, 3036);
  env.frame(0, 3052);
  assert.equal(refreshes, 0);
  assert.equal(env.frames.size, 0);
});
