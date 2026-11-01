// Server side of the upgrade station: port of UpgraderMenu + AttemptLimiter.
//
// Java keeps the item in a slot of the open menu. Here the input is a slot of the player's
// inventory: it is only taken out when the wheel starts, and the prize (if any) is written to
// a dynamic property first, so leaving or crashing mid-spin never loses or duplicates items
// (the mod's removed(): an interrupted spin is settled right away).

import { CONFIG } from "./config.js";
import { createStack, isPotionKey, keyOf, potionName } from "./potions.js";
import { canStake, canWin, catalog, chance, itemInfo, landingAngle, stackValue, unitValue, HOUSE_EDGE } from "./values.js";
import { announceWin, recordSpin } from "./stats.js";

const PENDING = "upgrader:pending";

/** Per-player menu state (a new UpgraderMenu every time the station is opened). */
export class Session {
  constructor(player) {
    this.playerId = player.id;
    this.reset();
  }

  reset() {
    this.input = null; // { slot, typeId }: typeId is the catalogue key (potions: "bottle|effect")
    this.inputAmount = 0; // how many items of that stack are put in
    this.target = null;
    this.targetCount = 1;
    this.scrollRow = 0; // first catalogue row shown
    this.query = "";
    this.spinning = false;
    this.lastSpin = null; // { chance, win, angle, until }: where the needle stopped, result caption
    this.lastOpenTick = -100;
  }
}

const sessions = new Map();

export function sessionOf(player) {
  let session = sessions.get(player.id);
  if (!session) {
    session = new Session(player);
    sessions.set(player.id, session);
  }
  return session;
}

export function dropSession(playerId) {
  sessions.delete(playerId);
  attempts.delete(playerId);
}

// ---------------------------------------------------------------------------
// Item info gathered once the world is loaded (max stack size, translation key)
// ---------------------------------------------------------------------------

const stackInfo = new Map(); // id -> { key, max }

export function setStackInfo(id, info) {
  stackInfo.set(id, info);
}

export function maxStackSize(id) {
  const known = stackInfo.get(id);
  if (known) return known.max;
  try {
    return createStack(id, 1).maxAmount;
  } catch {
    return 1;
  }
}

export function translationKey(id) {
  return stackInfo.get(id)?.key ?? "";
}

/** Translated name of an item id (RawMessage). */
export function itemName(id) {
  if (isPotionKey(id)) return potionName(id);
  const key = translationKey(id);
  return key ? { translate: key } : { text: itemInfo(id).name };
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export function inventoryOf(player) {
  return player.getComponent("minecraft:inventory")?.container;
}

/** The stack in the input slot, or undefined (and the input is cleared) if it was moved away. */
export function inputStack(player, session) {
  if (!session.input) return undefined;
  const stack = inventoryOf(player)?.getItem(session.input.slot);
  if (!stack || keyOf(stack) !== session.input.typeId || !canStake(stack)) {
    session.input = null;
    session.inputAmount = 0;
    return undefined;
  }
  if (session.inputAmount > stack.amount || session.inputAmount < 1) session.inputAmount = stack.amount;
  return stack;
}

export function setInput(session, slot, stack) {
  if (session.spinning) return;
  if (!stack) {
    session.input = null;
    session.inputAmount = 0;
    return;
  }
  if (!canStake(stack)) return;
  session.input = { slot, typeId: keyOf(stack) };
  session.inputAmount = stack.amount;
}

/** Exact value of what is in the input (used for the real roll). */
export function inputValue(player, session) {
  const stack = inputStack(player, session);
  return stack ? stackValue(stack, session.inputAmount) : 0;
}

// ---------------------------------------------------------------------------
// Target and amount
// ---------------------------------------------------------------------------

export function clampCount(session, count) {
  let ceiling = CONFIG.maxTargetCount;
  if (session.target) ceiling = Math.min(ceiling, maxStackSize(session.target));
  return Math.max(1, Math.min(Math.max(1, ceiling), Math.floor(count)));
}

export function setTarget(session, id) {
  if (session.spinning) return;
  if (id && !canWin(id)) return;
  session.target = id ?? null;
  session.targetCount = 1;
}

export function setCount(session, count) {
  if (session.spinning) return;
  session.targetCount = clampCount(session, count);
}

export function setInputAmount(player, session, amount) {
  const stack = inputStack(player, session);
  if (!stack || session.spinning) return;
  session.inputAmount = Math.max(1, Math.min(stack.amount, Math.floor(amount)));
}

/** What the screen shows: rounded values, like the sync packet of the mod. */
export function displayState(player, session) {
  const inValue = Math.round(inputValue(player, session));
  const targetValue = session.target ? Math.round(unitValue(session.target)) : 0;
  const count = clampCount(session, session.targetCount);
  return {
    inputValue: inValue,
    targetValue,
    count,
    chance: chance(inValue, targetValue * count),
    cooldown: cooldownRemaining(player),
  };
}

/** Catalogue value shown to the player (the mod sends Math.round(unitValue) to the client). */
export function catalogValue(id) {
  return Math.round(unitValue(id));
}

/**
 * Presets x2 / x4 / x8 / 30% / 50% / 70%: the catalogue item and Amount whose total comes closest
 * to the wanted value (1.7, YTAUN). Prices are sparse, so one item alone can be far off (a "50%"
 * that shows 38%); the Amount fills the gap. Among fits within one point of the best, the smallest
 * Amount wins, then the closest.
 */
export function applyPreset(player, session, preset) {
  const inValue = Math.round(inputValue(player, session));
  if (inValue <= 0) return false;
  const wanted = preset.multiplier ? inValue * preset.multiplier : (HOUSE_EDGE * inValue) / preset.chance;
  if (!(wanted > 0)) return false;
  const fits = [];
  for (const id of catalog()) {
    const value = catalogValue(id);
    if (!(value > 0)) continue;
    const ceiling = Math.max(1, Math.min(CONFIG.maxTargetCount, maxStackSize(id)));
    const count = Math.max(1, Math.min(ceiling, Math.round(wanted / value)));
    fits.push({ id, count, error: Math.abs(value * count - wanted) / wanted });
  }
  if (!fits.length) return false;
  const bestError = Math.min(...fits.map((fit) => fit.error));
  const pick = fits
    .filter((fit) => fit.error <= bestError + 0.01)
    .sort((x, y) => x.count - y.count || x.error - y.error)[0];
  setTarget(session, pick.id);
  setCount(session, pick.count);
  return true;
}

export const PRESETS = [
  { label: "x2", multiplier: 2 },
  { label: "x4", multiplier: 4 },
  { label: "x8", multiplier: 8 },
  { label: "30%", chance: 0.3 },
  { label: "50%", chance: 0.5 },
  { label: "70%", chance: 0.7 },
];

// ---------------------------------------------------------------------------
// Attempt limiter
// ---------------------------------------------------------------------------

const attempts = new Map(); // playerId -> timestamps (ms)

function prune(recent, windowMs) {
  const cutoff = Date.now() - windowMs;
  while (recent.length && recent[0] <= cutoff) recent.shift();
}

export function cooldownRemaining(player) {
  const limit = CONFIG.attemptLimit;
  const window = CONFIG.attemptWindowSeconds;
  if (!(limit > 0 && window > 0)) return 0;
  const recent = attempts.get(player.id);
  if (!recent) return 0;
  const windowMs = window * 1000;
  prune(recent, windowMs);
  if (!recent.length) {
    attempts.delete(player.id);
    return 0;
  }
  if (recent.length < limit) return 0;
  const freeAt = recent[0] + windowMs;
  return Math.max(1, Math.floor((freeAt - Date.now() + 999) / 1000));
}

function recordAttempt(player) {
  if (!(CONFIG.attemptLimit > 0 && CONFIG.attemptWindowSeconds > 0)) return;
  let recent = attempts.get(player.id);
  if (!recent) attempts.set(player.id, (recent = []));
  prune(recent, CONFIG.attemptWindowSeconds * 1000);
  recent.push(Date.now());
}

// ---------------------------------------------------------------------------
// Upgrade
// ---------------------------------------------------------------------------

/**
 * UpgraderMenu.startUpgrade: rolls the result and takes the input out of the inventory.
 * Returns the spin to animate, or a reason it could not start.
 */
export function startUpgrade(player, session) {
  if (session.spinning) return { error: "spinning" };
  const stack = inputStack(player, session);
  if (!stack) return { error: "no_input" };
  if (!session.target) return { error: "no_target" };
  if (!canStake(stack) || !canWin(session.target)) return { error: "blacklisted" };
  if (cooldownRemaining(player) > 0) return { error: "cooldown" };

  if (hasPending(player)) settlePending(player); // never overwrite an unpaid prize
  recordAttempt(player);
  const count = clampCount(session, session.targetCount);
  const inValue = stackValue(stack, session.inputAmount);
  const odds = chance(inValue, unitValue(session.target) * count);
  const win = Math.random() < odds;
  const angle = landingAngle(odds, win);

  const slot = session.input.slot;
  const container = inventoryOf(player);
  const left = stack.amount - session.inputAmount;
  if (left > 0) {
    stack.amount = left;
    container.setItem(slot, stack);
  } else {
    container.setItem(slot, undefined);
  }
  const prize = win ? { id: session.target, count, slot } : null;
  player.setDynamicProperty(PENDING, JSON.stringify({ prize }));
  recordSpin(player, { staked: inValue, win, prizeValue: unitValue(session.target) * count, chance: odds, target: session.target, count });

  session.spinning = true;
  return {
    win,
    chance: odds,
    angle,
    ticks: spinTicks(),
    input: { typeId: keyOf(stack), amount: session.inputAmount },
    target: session.target,
    count,
  };
}

/** Spin length in ticks; the screen can play up to 80 ticks of spin, then the result. */
export function spinTicks() {
  return Math.max(1, Math.min(80, Math.floor(CONFIG.spinDurationTicks)));
}

/** UpgraderMenu.applyResult: hands out the prize (if any) and plays the result sound. */
export function finishUpgrade(player, session, spin) {
  const placedSlot = settlePending(player);
  session.spinning = false;
  if (spin.win) announceWin(player, { chance: spin.chance, name: itemName(spin.target), count: spin.count });
  if (spin.win && placedSlot !== undefined) {
    // like the mod, the prize becomes the new input, ready to be upgraded again
    session.input = { slot: placedSlot, typeId: spin.target };
    session.inputAmount = spin.count;
  } else {
    // a lost (or dropped) input leaves the input slot empty
    session.input = null;
    session.inputAmount = 0;
  }
  try {
    player.dimension.playSound(spin.win ? "random.levelup" : "random.anvil_land", player.location, {
      volume: 0.7,
      pitch: spin.win ? 1.4 : 0.8,
    });
  } catch {
    // sound is cosmetic
  }
}

/**
 * Gives the stored prize of an unfinished spin and clears it.
 * Returns the inventory slot it went into (undefined if dropped or there was none).
 */
export function settlePending(player) {
  let pending;
  try {
    const raw = player.getDynamicProperty(PENDING);
    if (typeof raw !== "string") return undefined;
    pending = JSON.parse(raw);
  } catch {
    pending = null;
  }
  player.setDynamicProperty(PENDING, undefined);
  const prize = pending?.prize;
  if (!prize?.id || !(prize.count > 0)) return undefined;
  let stack;
  try {
    stack = createStack(prize.id, prize.count);
  } catch {
    return undefined;
  }
  const container = inventoryOf(player);
  if (container) {
    if (Number.isInteger(prize.slot) && prize.slot >= 0 && prize.slot < container.size && !container.getItem(prize.slot)) {
      container.setItem(prize.slot, stack);
      return prize.slot;
    }
    const leftover = container.addItem(stack);
    if (!leftover) return findSlot(container, prize.id);
    stack = leftover;
  }
  player.dimension.spawnItem(stack, player.location);
  return undefined;
}

function findSlot(container, id) {
  for (let i = 0; i < container.size; i++) if (keyOf(container.getItem(i)) === id) return i;
  return undefined;
}

export function hasPending(player) {
  return typeof player.getDynamicProperty(PENDING) === "string";
}
