// The spin clock: same timing, easing, ticking sound and result sound as UpgraderScreen.
// The needle itself is animated by the screen (frames sent with the spin form, see ui.js);
// this keeps the game-side clock: the ticking sounds and the result.

import { system } from "@minecraft/server";

const FULL_TURNS = 1800; // 5 turns before landing, like spinTotalAngle = 1800 + landingAngle
export const RESULT_FLASH_TICKS = 32; // resultFlashUntil = now + 1600 ms
// The screen starts its frames when it opens on the player's side, a moment after the form is
// sent; the clock starts that much after each send so sounds and needle line up.
export const START_DELAY = 2;

/** Cubic ease-out of the needle, as needleAngle() in the mod (degrees clockwise from the top). */
export function needleAngle(progress, landing) {
  const eased = 1 - Math.pow(1 - progress, 3);
  return (eased * (FULL_TURNS + landing)) % 360;
}

/** Ticking interval of the mod: fast, then slower as the wheel winds down. */
export function tickInterval(progress) {
  return progress < 0.55 ? 2 : progress < 0.85 ? 4 : 7;
}

/**
 * The spin clock. start() (re)starts it, e.g. each time the spin form is sent again because the
 * player was busy; onResult runs once when the needle stops; onLeave if the player leaves.
 * Returns { start, stop, tick, resultSound, done }.
 */
export function spinClock(player, spin, { onResult, onLeave }) {
  const resultSound = () => {
    try {
      player.playSound(spin.win ? "random.levelup" : "random.anvil_land", { volume: 0.35, pitch: spin.win ? 1.5 : 0.7 });
    } catch {
      // sound is cosmetic
    }
  };
  let run;
  let tick = -START_DELAY;
  let soundTicks = 0;
  const clock = {
    done: false,
    tick: () => tick,
    resultSound,
    stop() {
      if (run !== undefined) system.clearRun(run);
      run = undefined;
    },
    start() {
      clock.stop();
      if (clock.done) return;
      tick = -START_DELAY;
      soundTicks = 0;
      run = system.runInterval(() => {
        if (!player.isValid) {
          clock.stop();
          onLeave();
          return;
        }
        tick++;
        if (tick < 0) return;
        if (tick < spin.ticks) {
          if (soundTicks % tickInterval(tick / spin.ticks) === 0) {
            try {
              player.playSound("note.hat", { volume: 0.35, pitch: 1.7 });
            } catch {
              // ignore
            }
          }
          soundTicks++;
          return;
        }
        clock.stop();
        clock.done = true;
        onResult();
        resultSound();
      }, 1);
    },
  };
  return clock;
}
