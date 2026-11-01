// Per-player statistics and big-win announcements.
//
// Kept in a player dynamic property, so they survive restarts. Shown by /upgrader:stats (anyone,
// no cheats needed) or /scriptevent upgrader:stats.

import { world } from "@minecraft/server";
import { CONFIG } from "./config.js";

const KEY = "upgrader:stats";
const EMPTY = { spins: 0, wins: 0, staked: 0, won: 0, best: null };

/** { spins, wins, staked, won, best: { chance, target, count } | null } */
export function statsOf(player) {
  try {
    const raw = player.getDynamicProperty(KEY);
    return { ...EMPTY, ...(typeof raw === "string" ? JSON.parse(raw) : {}) };
  } catch {
    return { ...EMPTY };
  }
}

/** Counts one spin the moment it is decided (the result is already known then). */
export function recordSpin(player, { staked, win, prizeValue, chance, target, count }) {
  const stats = statsOf(player);
  stats.spins += 1;
  stats.staked += Math.max(0, Math.round(staked));
  if (win) {
    stats.wins += 1;
    stats.won += Math.max(0, Math.round(prizeValue));
    if (!stats.best || chance < stats.best.chance) stats.best = { chance, target, count };
  }
  try {
    player.setDynamicProperty(KEY, JSON.stringify(stats));
  } catch {
    // statistics are a nicety
  }
}

export function resetStats(player) {
  try {
    player.setDynamicProperty(KEY, undefined);
  } catch {
    // ignore
  }
}

const ANNOUNCE = { enabled: false, maxChance: 0.1, ...(CONFIG.announceWins ?? {}) };

/** Tells the whole server about a lucky win (CONFIG.announceWins), once the needle has stopped. */
export function announceWin(player, { chance, name, count }) {
  if (!ANNOUNCE.enabled || !(chance <= ANNOUNCE.maxChance)) return;
  try {
    world.sendMessage({
      rawtext: [
        { text: "§6[Upgrader] §e" + player.name + " §f" },
        { translate: "upgrader.stats.announce", with: { rawtext: [count > 1 ? { text: count + "x " } : { text: "" }, name, { text: (chance * 100).toFixed(2) + "%" }] } },
      ],
    });
  } catch {
    // ignore
  }
}
