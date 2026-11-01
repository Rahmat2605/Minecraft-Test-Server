// Items from other add-ons (idea and auto-price rules: YTAUN, 1.7).
//
// Every registered item type that is not "minecraft:" or "upgrader:" is picked up at startup: it can be
// put in and it shows in the catalogue. Its price, first match wins:
//
//   1. CONFIG.valueOverrides                                  { "myaddon:ruby": 250 }
//   2. /scriptevent upgrader:price myaddon:ruby 250          (from a command block or another add-on)
//   3. item tag "upgrader:value_250"                          (in the item's "minecraft:tags" component)
//   4. an estimate from durability, food, stack size, tags and the words in its id (customItems.autoPrice)
//
// Hide one: CONFIG.blacklist, item tag "upgrader:blacklist", /scriptevent upgrader:blacklist <id> [off].
// Icon: CONFIG.customItems.icons, /scriptevent upgrader:icon <id> <texture path>, or the guess
// "textures/items/<name>" (customItems.iconGuess). Price check: /scriptevent upgrader:value [id].

import { BlockTypes, ItemStack, ItemTypes, system } from "@minecraft/server";
import { CONFIG } from "./config.js";
import { setStackInfo } from "./menu.js";
import { keyOf } from "./potions.js";
import { addAvailableItem, setCustomBlacklist, setCustomIcon, setCustomPrice, stackValue, unitValue } from "./values.js";

const OPTIONS = {
  enabled: true,
  autoPrice: true,
  autoMultiplier: 1.0,
  minValue: 3,
  maxValue: 5000,
  iconGuess: true,
  icons: {},
  allowNamespaces: [],
  denyNamespaces: [],
  ...(CONFIG.customItems ?? {}),
};

const SKIPPED = new Set(["minecraft", "upgrader"]);
const VALUE_TAG = /^upgrader:value_(\d+(?:\.\d+)?)$/;
const namespaceOf = (id) => id.slice(0, id.indexOf(":"));

/** An item id of another add-on ("myaddon:ruby"): not vanilla, not a potion key, not ours. */
export function isCustomId(id) {
  return typeof id === "string" && id.includes(":") && !id.includes("|") && !SKIPPED.has(namespaceOf(id));
}

function namespaceAllowed(id) {
  const ns = namespaceOf(id);
  if (OPTIONS.denyNamespaces.includes(ns)) return false;
  return OPTIONS.allowNamespaces.length === 0 || OPTIONS.allowNamespaces.includes(ns);
}

/** Every item type of the loaded add-ons. */
export function discoverCustomIds() {
  if (!OPTIONS.enabled) return [];
  let types = [];
  try {
    types = ItemTypes.getAll();
  } catch {
    return [];
  }
  return types.map((type) => type.id).filter((id) => isCustomId(id) && namespaceAllowed(id));
}

// ---------------------------------------------------------------------------
// Estimated price
// ---------------------------------------------------------------------------

function safe(read, fallback) {
  try {
    const value = read();
    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

// Words in an id that say what the item is: a floor, so an unbreakable weapon is not priced like a trinket.
const FLOORS = [
  [/(sword|katana|scythe|blade|axe|spear|lance|halberd|glaive|saber|sabre|rapier|claymore|dagger|hammer|mace|scepter|staff|wand|bow|trident|gun)/, 400],
  [/(helmet|chestplate|leggings|boots|armor|armour)/, 300],
  [/(core|heart|essence|soul|relic|artifact|orb|totem)/, 250],
  [/(ingot|gem|crystal|shard|ruby|sapphire|ore_|_ore|nugget)/, 40],
];
const HIGH_TIER = /(boss|legend|ultimate|divine|god|void|dragon|demon|infernal|abyss|ender|netherite|mythic)/;

/**
 * Estimated price: 250 durability ~ 137 (an iron sword), 1561 ~ 790 (a diamond sword); food 4 + 3 per
 * nutrition point; plain items 8 (stacks of 64), 25 (16) or 150 (one per slot). Weapon / armour /
 * material words and vanilla tags set a floor (x2 for "boss", "legend"...); an item with a cooldown
 * (an active ability) x1.5, an enchantable one x1.15.
 */
export function autoPrice(stack, tags) {
  const has = (name) => tags.includes(name) || tags.includes("minecraft:" + name);
  const durability = safe(() => stack.getComponent("minecraft:durability")?.maxDurability, 0);
  const nutrition = safe(() => stack.getComponent("minecraft:food")?.nutrition, 0);
  const max = stack.maxAmount;
  const name = stack.typeId.slice(stack.typeId.indexOf(":") + 1);

  let value;
  if (durability > 0) {
    value = 12 + durability * 0.5;
    if (["is_armor", "is_helmet", "is_chestplate", "is_leggings", "is_boots"].some(has)) value *= 1.25;
    if (has("is_sword")) value *= 1.1;
  } else if (nutrition > 0) {
    value = 4 + nutrition * 3;
  } else {
    value = max >= 64 ? 8 : max >= 16 ? 25 : 150;
  }

  let floor = 0;
  for (const [pattern, amount] of FLOORS) if (pattern.test(name)) floor = Math.max(floor, amount);
  if (["is_sword", "is_tool", "is_pickaxe", "is_axe", "is_shovel", "is_hoe", "is_weapon", "is_armor"].some(has)) floor = Math.max(floor, 300);
  if (floor > 0 && max <= 16) value = Math.max(value, HIGH_TIER.test(name) ? floor * 2 : floor);
  if (max === 1 && safe(() => stack.getComponent("minecraft:cooldown"), undefined)) value *= 1.5;
  if (safe(() => stack.getComponent("minecraft:enchantable"), undefined)) value *= 1.15;
  value *= OPTIONS.autoMultiplier;
  return Math.round(Math.max(OPTIONS.minValue, Math.min(OPTIONS.maxValue, value)) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Registering an item
// ---------------------------------------------------------------------------

const described = new Set();

/** Reads one add-on item into the price table, blacklist and icons. True when it can be offered. */
export function describeCustom(id) {
  if (described.has(id)) return true; // a price given by scriptevent must not be estimated over
  let stack;
  try {
    stack = new ItemStack(id, 1);
  } catch {
    return false; // registered, but cannot sit in an inventory
  }
  described.add(id);
  setStackInfo(id, { key: stack.localizationKey, max: stack.maxAmount });
  const tags = safe(() => stack.getTags(), []);
  if (tags.includes("upgrader:blacklist")) setCustomBlacklist(id, true);
  const tagged = tags.map((tag) => VALUE_TAG.exec(tag)).find(Boolean);
  if (tagged) setCustomPrice(id, Number(tagged[1]));
  else if (OPTIONS.autoPrice) setCustomPrice(id, autoPrice(stack, tags), false);
  const icon = OPTIONS.icons[id];
  if (icon) setCustomIcon(id, icon);
  else if (OPTIONS.iconGuess && !safe(() => BlockTypes.get(id), undefined)) setCustomIcon(id, "textures/items/" + id.slice(id.indexOf(":") + 1), false);
  return true;
}

// ---------------------------------------------------------------------------
// /scriptevent upgrader:price | upgrader:blacklist | upgrader:icon | upgrader:value
// ---------------------------------------------------------------------------

function known(id) {
  if (!isCustomId(id) || !safe(() => ItemTypes.get(id), undefined)) return false;
  if (!describeCustom(id)) return false;
  addAvailableItem(id);
  return true;
}

function reportValue(player, id) {
  try {
    const held = player.getComponent("minecraft:equippable")?.getEquipment("Mainhand");
    if (id) return player.sendMessage(`§e[Upgrader] §f${id}: §a${Math.round(unitValue(id) * 100) / 100}`);
    if (!held) return player.sendMessage("§e[Upgrader] §7Hold an item, or give an id.");
    const each = Math.round(unitValue(keyOf(held)) * 100) / 100;
    const total = Math.round(stackValue(held) * 100) / 100;
    player.sendMessage(`§e[Upgrader] §f${keyOf(held)}: §a${each}§7 each, this stack (wear, enchantments, contents): §a${total}`);
  } catch {
    // only players can be told
  }
}

system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity }) => {
  if (!["upgrader:price", "upgrader:blacklist", "upgrader:icon", "upgrader:value"].includes(id)) return;
  const [item, arg] = String(message ?? "").trim().split(/\s+/);
  if (id === "upgrader:value") return reportValue(sourceEntity, item);
  if (!OPTIONS.enabled || !item || !known(item)) return;
  if (id === "upgrader:price") {
    const value = Number(arg);
    if (Number.isFinite(value) && value > 0) setCustomPrice(item, value);
  } else if (id === "upgrader:blacklist") {
    setCustomBlacklist(item, arg !== "off");
  } else if (arg) {
    setCustomIcon(item, arg);
  }
});
