// Upgrader for Minecraft Bedrock: gambling-style item upgrader, port of the "Upgrader" Java mod.
// Right-click with the Upgrader to open the station, put an item in, pick the item you want,
// and spin: win and your item becomes the target, lose and it is gone.

import { EquipmentSlot, ItemStack, ItemTypes, system, world } from "@minecraft/server";
import { dropSession, hasPending, sessionOf, setStackInfo, settlePending } from "./menu.js";
import { openStation } from "./ui.js";
import { candidateItems, computePrices, needsRecompute, setAvailableItems, setPrices } from "./values.js";
import { createStack, potionCandidates } from "./potions.js";
import { describeCustom, discoverCustomIds } from "./custom.js";
import { loadExcluded } from "./admin.js";
import { CONFIG } from "./config.js";

const UPGRADER = "upgrader:upgrader";
const LORE = [{ translate: "upgrader.item.desc" }];

// Blocks whose own right-click action should win over opening the station
const INTERACTIVE_BLOCK =
  /door|gate|button|lever|chest|barrel|shulker|furnace|smoker|crafting|crafter|anvil|table|:bed$|bell|hopper|dispenser|dropper|loom|grindstone|stonecutter|beacon|lectern|repeater|comparator|noteblock|jukebox|cake|campfire|anchor|lodestone|composter|cauldron|brewing|sign|frame|vault|chiseled_bookshelf|decorated_pot|shelf|copper_golem_statue/;

// ---------------------------------------------------------------------------
// Startup: find the items this game version has, then price everything
// ---------------------------------------------------------------------------

let ready = false;
const waiting = [];

function whenReady(callback) {
  if (ready) callback();
  else waiting.push(callback);
}

function* startup() {
  const available = [];
  let n = 0;
  for (const id of candidateItems()) {
    if (!ItemTypes.get(id)) continue;
    try {
      const stack = new ItemStack(id, 1);
      setStackInfo(id, { key: stack.localizationKey, max: stack.maxAmount });
      available.push(id);
    } catch {
      // not an item that can exist in an inventory in this version
    }
    if (++n % 64 === 0) yield;
  }
  loadExcluded(); // items an admin took out of the prizes
  // items of other add-ons: found by custom.js, priced from config, tags, scriptevents or an estimate
  const have = new Set(available);
  for (const id of discoverCustomIds()) {
    if (!have.has(id) && describeCustom(id)) available.push(id);
    if (++n % 64 === 0) yield;
  }
  // every brewable potion in every bottle is its own catalogue item
  for (const key of potionCandidates()) {
    try {
      const stack = createStack(key, 1);
      setStackInfo(key, { key: stack.localizationKey, max: stack.maxAmount });
      available.push(key);
    } catch {
      // effect or bottle this game version does not have
    }
    if (++n % 64 === 0) yield;
  }
  setAvailableItems(available);
  // The shipped price table already is what the default settings give, so the station can open
  // right away; with overrides or a custom blacklist it waits for the new prices.
  const blocking = needsRecompute();
  if (!blocking) markReady();
  const table = yield* computePrices(); // also picks up edits to base_values.js
  setPrices(table);
  if (blocking) markReady();
}

function markReady() {
  ready = true;
  for (const callback of waiting.splice(0)) callback();
}

let started = false;
function start() {
  if (started) return;
  started = true;
  system.runJob(startup());
}
world.afterEvents.worldLoad.subscribe(start);
system.runTimeout(start, 1); // after /reload the world is already loaded

// ---------------------------------------------------------------------------
// Opening the station
// ---------------------------------------------------------------------------

function open(player) {
  const session = sessionOf(player);
  if (session.spinning) {
    if (system.currentTick - (session.spinTick ?? 0) < 400) return;
    session.spinning = false; // a spin whose screen never came back: settle it below and reopen
  }
  if (system.currentTick - session.lastOpenTick < 10) return; // one click can fire two events
  session.lastOpenTick = system.currentTick;
  if (hasPending(player)) settlePending(player);
  if (!ready) {
    player.onScreenDisplay.setActionBar({ translate: "upgrader.gui.pricing" });
    whenReady(() => player.isValid && openStation(player));
    return;
  }
  openStation(player);
}

// Right-click / tap into the air
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId === UPGRADER && source?.typeId === "minecraft:player") open(source);
});

// Right-click / tap while aiming at a block
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.itemStack?.typeId !== UPGRADER || event.isFirstEvent === false) return;
  if (INTERACTIVE_BLOCK.test(event.block.typeId)) return;
  event.cancel = true;
  const player = event.player;
  system.run(() => open(player));
});

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

const STARTER = "upgrader:starter_given";

/** Hands every player one Upgrader the first time they join a world with the add-on (the recipe stays). */
function giveStarter(player) {
  if (!CONFIG.giveOnFirstJoin || !player.isValid || player.getDynamicProperty(STARTER)) return;
  player.setDynamicProperty(STARTER, true);
  const stack = new ItemStack(UPGRADER, 1);
  const leftover = player.getComponent("minecraft:inventory")?.container?.addItem(stack);
  if (leftover) player.dimension.spawnItem(leftover, player.location);
}

// A spin interrupted by leaving (or a crash) is settled on the next join, like the mod's removed()
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn) return;
  sessionOf(player).reset();
  if (hasPending(player)) settlePending(player);
  system.runTimeout(() => {
    try {
      giveStarter(player);
    } catch {
      // left again already
    }
  }, 20);
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => dropSession(playerId));

// Tooltip line under the item name: "Right-click to open the upgrade station"
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    try {
      const equippable = player.getComponent("minecraft:equippable");
      const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
      if (item?.typeId !== UPGRADER || item.getLore().length) continue;
      item.setLore(LORE);
      equippable.setEquipment(EquipmentSlot.Mainhand, item);
    } catch {
      // ignore
    }
  }
}, 20);
