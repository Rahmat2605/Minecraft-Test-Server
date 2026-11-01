// Admin menu (idea: YTAUN, 1.7) and the add-on's commands.
//
// The admin menu is the catalogue grid: tap an item to take it out of the prizes (it can still be put
// in as a stake), tap again to allow it; search "banned" to list the removed ones. The list is saved in
// the world (split over several properties, so a long list is never lost).
//
//   /upgrader:admin                  admin menu (operators; close the chat to see it)
//   /upgrader:stats                  your Upgrader statistics (anyone)
//   /scriptevent upgrader:admin      admin menu, for operators or players tagged "upgrader_admin"
//   /scriptevent upgrader:ban [id]   take the item in your hand (or <id>) out of the prizes
//   /scriptevent upgrader:unban_all  allow every item again
//   /scriptevent upgrader:stats      your statistics
// No command needs cheats, so worlds keep their achievements.

import { CommandPermissionLevel, CustomCommandStatus, PlayerPermissionLevel, system, world } from "@minecraft/server";
import { keyOf } from "./potions.js";
import { statsOf } from "./stats.js";
import { formatPercent, formatValue, raw, tr } from "./text.js";
import { displayName, openPicker } from "./ui.js";
import { canWin, catalog, clearExcluded, excludedItems, isBlacklisted, isExcluded, itemInfo, setExcluded, unitValue } from "./values.js";

const KEY = "upgrader:excluded"; // upgrader:excluded, upgrader:excluded_1, _2... (one JSON array each)
const CHUNK = 30000; // characters per property (a dynamic property string holds 32767)
const ADMIN_TAG = "upgrader_admin";

// ---------------------------------------------------------------------------
// Saving
// ---------------------------------------------------------------------------

/** Reads the saved list (called once at startup). */
export function loadExcluded() {
  clearExcluded();
  for (let part = 0; part < 64; part++) {
    let raw;
    try {
      raw = world.getDynamicProperty(part ? KEY + "_" + part : KEY);
    } catch {
      return;
    }
    if (typeof raw !== "string") return;
    try {
      for (const id of JSON.parse(raw)) if (typeof id === "string") setExcluded(id, true);
    } catch {
      // a damaged part: skip it
    }
  }
}

function save() {
  const parts = [];
  let current = [];
  let size = 2;
  for (const id of excludedItems()) {
    if (size + id.length + 3 > CHUNK && current.length) {
      parts.push(current);
      current = [];
      size = 2;
    }
    current.push(id);
    size += id.length + 3;
  }
  if (current.length) parts.push(current);
  try {
    for (let part = 0; part < 64; part++) {
      const key = part ? KEY + "_" + part : KEY;
      if (part < parts.length) world.setDynamicProperty(key, JSON.stringify(parts[part]));
      else if (world.getDynamicProperty(key) !== undefined) world.setDynamicProperty(key, undefined);
      else break;
    }
  } catch {
    // the change still holds until the world closes
  }
}

function exclude(id, excluded) {
  setExcluded(id, excluded);
  save();
}

// ---------------------------------------------------------------------------
// Admin menu
// ---------------------------------------------------------------------------

const say = (player, text) => {
  try {
    player.sendMessage(text);
  } catch {
    // left
  }
};

const BANNED_ONLY = /^(banned|ban|removed)$/;

/** Every prize candidate plus the removed ones; removed first, then cheapest first. */
function gridItems(query) {
  const q = query.trim().toLowerCase();
  const banned = new Set(excludedItems());
  let ids = [...new Set([...catalog(), ...banned])];
  if (BANNED_ONLY.test(q)) ids = ids.filter((id) => banned.has(id));
  else if (q) ids = ids.filter((id) => id.includes(q) || itemInfo(id).name.toLowerCase().includes(q));
  return ids.sort((a, b) => Number(banned.has(b)) - Number(banned.has(a)) || unitValue(a) - unitValue(b) || (a < b ? -1 : 1));
}

export function openAdmin(player) {
  return openPicker(player, {
    state: { query: "", scrollRow: 0 },
    items: gridItems,
    cell: (id) =>
      isExcluded(id)
        ? [displayName(id), "\n§c", "REMOVED from prizes", "\n§8", "Tap to allow it again"]
        : [displayName(id), "\n§7", tr("upgrader.gui.value", formatValue(unitValue(id))), "\n§8", "Tap to remove it from prizes"],
    footer: (count, row, rows) => raw("§7", `${count} items · row ${row}/${rows} · removed ${excludedItems().length} · search "banned"`),
    onPick: (id) => {
      exclude(id, !isExcluded(id));
      say(player, isExcluded(id) ? `§e[Upgrader] §cRemoved from prizes: §f${itemInfo(id).name} §7(${id})` : `§e[Upgrader] §aAllowed again: §f${itemInfo(id).name} §7(${id})`);
    },
  });
}

function banHeld(player, id) {
  const target = id || keyOf(player.getComponent("minecraft:equippable")?.getEquipment("Mainhand"));
  if (!target) return say(player, "§e[Upgrader] §7Hold the item to remove, or give its id.");
  if (isBlacklisted(target)) return say(player, `§e[Upgrader] §7${target} can never be a prize anyway.`);
  exclude(target, true);
  say(player, `§e[Upgrader] §cRemoved from prizes: §f${itemInfo(target).name} §7(${target})`);
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export function showStats(player) {
  const s = statsOf(player);
  const rate = s.spins ? formatPercent(s.wins / s.spins) : "-";
  const lines = [
    { text: "§6[Upgrader] " },
    { translate: "upgrader.stats.line", with: [String(s.spins), String(s.wins), rate, formatValue(s.staked), formatValue(s.won)] },
  ];
  if (s.best && canWin(s.best.target)) {
    lines.push({ text: "\n§7" }, { translate: "upgrader.stats.best" }, { text: " §f" + (s.best.count > 1 ? s.best.count + "x " : "") });
    lines.push(displayName(s.best.target), { text: " §7(" + formatPercent(s.best.chance) + ")" });
  }
  try {
    player.sendMessage({ rawtext: lines });
  } catch {
    // left
  }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function isOperator(player) {
  try {
    return player.playerPermissionLevel === PlayerPermissionLevel.Operator || player.commandPermissionLevel >= CommandPermissionLevel.GameDirectors;
  } catch {
    return false;
  }
}

function playerCommand(open) {
  return (origin) => {
    const player = origin.sourceEntity;
    if (player?.typeId !== "minecraft:player") return { status: CustomCommandStatus.Failure, message: "Run this as a player." };
    system.run(() => open(player));
    return { status: CustomCommandStatus.Success };
  };
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  const register = (command, callback) => {
    try {
      customCommandRegistry.registerCommand({ cheatsRequired: false, ...command }, callback);
    } catch {
      // older game: the /scriptevent forms still work
    }
  };
  register(
    { name: "upgrader:admin", description: "Upgrader: choose which items can be won", permissionLevel: CommandPermissionLevel.Admin },
    playerCommand(openAdmin),
  );
  register(
    { name: "upgrader:stats", description: "Upgrader: your spins, wins and luckiest win", permissionLevel: CommandPermissionLevel.Any },
    playerCommand(showStats),
  );
});

system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity }) => {
  if (sourceEntity?.typeId !== "minecraft:player") return;
  if (id === "upgrader:stats") return showStats(sourceEntity);
  if (!["upgrader:admin", "upgrader:ban", "upgrader:unban_all"].includes(id)) return;
  if (!isOperator(sourceEntity) && !sourceEntity.hasTag(ADMIN_TAG)) return say(sourceEntity, "§e[Upgrader] §cOnly operators can use this.");
  if (id === "upgrader:admin") openAdmin(sourceEntity);
  else if (id === "upgrader:ban") banHeld(sourceEntity, String(message ?? "").trim());
  else {
    clearExcluded();
    save();
    say(sourceEntity, "§e[Upgrader] §aEvery item can be won again.");
  }
});
