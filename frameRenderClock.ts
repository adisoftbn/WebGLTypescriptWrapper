class FrameRenderClock {
  private before = performance.now();
  private delta = 0;

  getDelta() {
    const now = performance.now()
    const delta = now - this.before
    this.before = now
    this.delta = delta;
    return delta
  }

  getCachedDelta() {
    return this.delta;
  }
}

export const frameRenderClock = new FrameRenderClock();
