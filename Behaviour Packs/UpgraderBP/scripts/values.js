// Item prices: port of ItemValues / UpgradeOdds from the Java mod.
//
// Every item gets a price: anchor prices (base_values.js) flow through all crafting, smelting,
// stonecutting and smithing recipes (an item costs its cheapest recipe), block drops set a floor
// (an ore is worth at least what it drops with Fortune III), and items only used as ingredients
// get their share of what they are crafted into. Items with no price left fall back on rarity.
// The recipes and drops come from tools/gen_data.py (Bedrock scripts cannot read recipes).

import { CONFIG } from "./config.js";
import { BASE_BLACKLIST, BASE_VALUE_GROUPS } from "./base_values.js";
import { BEDROCK_COUNT, DEFAULT_PRICES, ICONS, LOOT, NAMES, NODES, RARITY, RECIPES } from "./data/vanilla.js";
import { EFFECTS, isPotionKey, keyOf, potionInfo, potionPrices, splitKey } from "./potions.js";

const MAX_PASSES = 16;
const MAX_FLOOR_ROUNDS = 24;
const EPSILON = 1e-6;

const fullId = (id) => (id.includes(":") ? id : "minecraft:" + id);

export const NODE_IDS = NODES.map(fullId);
const NODE_INDEX = new Map(NODE_IDS.map((id, i) => [id, i]));
const BASE = new Map();
for (const [value, ids] of BASE_VALUE_GROUPS) for (const id of ids) BASE.set(id, value);
const BLACKLIST = new Set([...BASE_BLACKLIST, ...(CONFIG.blacklist ?? [])]);
const OVERRIDES = new Map(Object.entries(CONFIG.valueOverrides ?? {}).filter(([, v]) => typeof v === "number"));
const MULTIPLIERS = new Map(Object.entries(CONFIG.valueMultipliers ?? {}).filter(([, v]) => typeof v === "number"));
const GLOBAL_MULTIPLIER = CONFIG.globalValueMultiplier > 0 ? CONFIG.globalValueMultiplier : 1.0;
const RARITY_BY_NODE = new Map(Object.entries(RARITY).map(([index, level]) => [Number(index), level]));
const RARITY_VALUE = { u: 150, r: 600, e: 2500 }; // uncommon, rare, epic; common = 3

export const MIN_CHANCE = CONFIG.minChance;
export const MAX_CHANCE = Math.max(CONFIG.maxChance, CONFIG.minChance);
export const HOUSE_EDGE = CONFIG.houseEdge;

// ---------------------------------------------------------------------------
// Blacklist
// ---------------------------------------------------------------------------

export function isBlacklisted(id) {
  if (!id || id === "minecraft:air" || BLACKLIST.has(id) || customBlacklist.has(id)) return true;
  if (isPotionKey(id)) return !EFFECTS.includes(splitKey(id).effect); // e.g. Potion of Decay: creative only
  if (id.endsWith("_spawn_egg") || id === "minecraft:spawn_egg") return true;
  return id.startsWith("upgrader:");
}

// ---------------------------------------------------------------------------
// Price table
// ---------------------------------------------------------------------------

// price per node index (NaN = no price yet), plus prices of items outside the vanilla graph
let prices = Float64Array.from(DEFAULT_PRICES, (v) => (v === null ? NaN : v));
const extraPrices = new Map(OVERRIDES);
for (const [id, value] of OVERRIDES) {
  const index = NODE_INDEX.get(id);
  if (index !== undefined) prices[index] = value;
}

function rarityFallbackIndex(index) {
  return index === undefined ? 3 : RARITY_VALUE[RARITY_BY_NODE.get(index)] ?? 3;
}

let potionTable = new Map(); // potion key -> price, follows the item prices

// ---------------------------------------------------------------------------
// Items from other add-ons (custom.js) and items an admin took out of the prizes (admin.js)
// ---------------------------------------------------------------------------

const customPrices = new Map(); // id -> price; CONFIG.valueOverrides still wins
const explicitPrices = new Set(); // set on purpose (item tag, scriptevent): never replaced by an estimate
const customBlacklist = new Set();
const customIcons = new Map(); // id -> texture path
const explicitIcons = new Set();
const adminExcluded = new Set(); // cannot be won, can still be put in

/** explicit = false is an estimate: it never replaces a price that was set on purpose. */
export function setCustomPrice(id, value, explicit = true) {
  if (!(value > 0) || !Number.isFinite(value)) return;
  if (!explicit && explicitPrices.has(id)) return;
  if (explicit) explicitPrices.add(id);
  customPrices.set(id, value);
  catalogCache = null;
}

export function setCustomBlacklist(id, blocked) {
  if (blocked) customBlacklist.add(id);
  else customBlacklist.delete(id);
  catalogCache = null;
}

export function setCustomIcon(id, path, explicit = true) {
  if (!path || (!explicit && explicitIcons.has(id))) return;
  if (explicit) explicitIcons.add(id);
  customIcons.set(id, path);
  ITEM_INFO.delete(id);
}

export const excludedItems = () => [...adminExcluded];
export const isExcluded = (id) => adminExcluded.has(id);

export function setExcluded(id, excluded) {
  if (excluded) adminExcluded.add(id);
  else adminExcluded.delete(id);
  catalogCache = null;
}

export function clearExcluded() {
  adminExcluded.clear();
  catalogCache = null;
}

function rawValue(id) {
  const index = NODE_INDEX.get(id);
  if (index === undefined) return extraPrices.get(id) ?? customPrices.get(id) ?? potionTable.get(id) ?? 3;
  const value = prices[index];
  return Number.isNaN(value) ? rarityFallbackIndex(index) : value;
}

export function unitValue(id) {
  return rawValue(id) * GLOBAL_MULTIPLIER * (MULTIPLIERS.get(id) ?? 1.0);
}

/**
 * Value of an ItemStack (or {typeId, amount, damage, maxDurability}): the item, worn down by its
 * damage (at least 5%), plus its enchantments, plus what it carries (shulker box, bundle).
 */
export function stackValue(stack, amount = stack?.amount, depth = 0) {
  if (!stack || !amount) return 0;
  let item = unitValue(keyOf(stack));
  if (STAKE_ONLY.has(keyOf(stack))) item = unitValue(STAKE_ONLY.get(keyOf(stack))); // an enchanted book: a book + its enchantments
  const wear = durabilityOf(stack);
  if (wear && wear.max > 0) {
    const remaining = 1.0 - wear.damage / wear.max;
    item *= Math.max(0.05, remaining);
  }
  return (item + enchantValue(stack) + contentsValue(stack, depth)) * amount;
}

// ---------------------------------------------------------------------------
// Stake and prize rules
// ---------------------------------------------------------------------------

// Never a prize, but a fine stake when it carries something: id -> the plain item it is priced as
const STAKE_ONLY = new Map([["minecraft:enchanted_book", "minecraft:book"]]);

/** Can this stack be put in the station? (blacklisted items, items carrying blacklisted ones: no) */
export function canStake(stack, depth = 0) {
  const id = keyOf(stack);
  if (!id) return false;
  if (STAKE_ONLY.has(id)) {
    if (!(enchantValue(stack) > 0)) return false;
  } else if (isBlacklisted(id)) {
    return false;
  }
  for (const item of contentsOf(stack, depth)) if (!canStake(item, depth + 1)) return false;
  return true;
}

/** Can this id be won (picked as the target)? */
export function canWin(id) {
  return !isBlacklisted(id) && !adminExcluded.has(id) && !STAKE_ONLY.has(id);
}

// ---------------------------------------------------------------------------
// Enchantments and contents
// ---------------------------------------------------------------------------

const ENCHANT = { enabled: true, perLevel: 30, treasure: 3, ...(CONFIG.enchantments ?? {}) };
// treasure enchantments (books only from loot / trading) and curses (worth nothing)
const TREASURE = new Set(["mending", "frost_walker", "soul_speed", "swift_sneak", "wind_burst"]);
const CURSES = new Set(["binding", "vanishing", "binding_curse", "vanishing_curse"]);

/** What the enchantments of a stack add (CONFIG.enchantments.perLevel per level, treasure x3, curses 0). */
export function enchantValue(stack) {
  if (!ENCHANT.enabled || typeof stack?.getComponent !== "function") return 0;
  let list;
  try {
    list = stack.getComponent("minecraft:enchantable")?.getEnchantments() ?? [];
  } catch {
    return 0;
  }
  let sum = 0;
  for (const enchantment of list) {
    const id = String(enchantment?.type?.id ?? enchantment?.type ?? "").replace("minecraft:", "");
    const level = Math.max(0, Number(enchantment?.level) || 0);
    if (CURSES.has(id)) continue;
    sum += ENCHANT.perLevel * level * (TREASURE.has(id) ? ENCHANT.treasure : 1);
  }
  return sum * GLOBAL_MULTIPLIER;
}

/** Stacks inside a shulker box or bundle (empty for everything else). */
function contentsOf(stack, depth) {
  if (depth > 3 || typeof stack?.getComponent !== "function") return [];
  let container;
  try {
    container = stack.getComponent("minecraft:inventory")?.container;
  } catch {
    return [];
  }
  const items = [];
  for (let i = 0; i < (container?.size ?? 0); i++) {
    const item = container.getItem(i);
    if (item) items.push(item);
  }
  return items;
}

function contentsValue(stack, depth) {
  let sum = 0;
  for (const item of contentsOf(stack, depth)) sum += stackValue(item, item.amount, depth + 1);
  return sum;
}

function durabilityOf(stack) {
  if (typeof stack.getComponent !== "function") {
    return stack.maxDurability ? { damage: stack.damage ?? 0, max: stack.maxDurability } : undefined;
  }
  try {
    const durability = stack.getComponent("minecraft:durability");
    if (durability) return { damage: durability.damage, max: durability.maxDurability };
  } catch {
    // not damageable
  }
  return undefined;
}

/** "u" (uncommon), "r" (rare), "e" (epic) or undefined (common): colours the item name. */
export function rarityOf(id) {
  const index = NODE_INDEX.get(id);
  return index === undefined ? undefined : RARITY_BY_NODE.get(index);
}

/**
 * Recomputes every price, exactly like ItemValues.compute() in the mod.
 * Generator so it can run as a system job; returns the new table when done.
 */
export function* computePrices() {
  const n = NODE_IDS.length;
  const table = new Float64Array(n).fill(NaN);
  const fixed = new Uint8Array(n);
  const overridden = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const id = NODE_IDS[i];
    const override = OVERRIDES.get(id);
    if (override !== undefined) {
      table[i] = override;
      overridden[i] = 1;
      fixed[i] = 1;
    } else if (BASE.has(id)) {
      table[i] = BASE.get(id);
    }
  }
  const raw = (i) => (Number.isNaN(table[i]) ? rarityFallbackIndex(i) : table[i]);
  // the mod does not roll the loot of blacklisted blocks
  const loot = LOOT.filter(([block]) => !isBlacklisted(NODE_IDS[block]));

  function* relax() {
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      let changed = false;
      for (let r = 0; r < RECIPES.length; r++) {
        const [result, count, groups] = RECIPES[r];
        if (fixed[result]) continue;
        let sum = 0;
        for (const group of groups) {
          let cheapest = Infinity;
          for (const item of group) {
            const value = table[item];
            if (value < cheapest) cheapest = value; // NaN never compares lower
          }
          if (cheapest === Infinity) {
            sum = Infinity;
            break;
          }
          sum += cheapest;
        }
        if (sum === Infinity || sum <= 0) continue;
        const cost = Math.max(1.0, sum / count);
        const current = table[result];
        if (Number.isNaN(current) || cost < current - EPSILON) {
          table[result] = cost;
          changed = true;
        }
        if ((r & 255) === 255) yield;
      }
      if (!changed) break;
    }
  }

  function lootFloors() {
    let raised = 0;
    for (const [block, drops] of loot) {
      if (overridden[block]) continue;
      let floor = 0;
      for (const [item, perBreak, error] of drops) floor += (perBreak + 2.0 * error) * raw(item);
      if (floor > raw(block) + EPSILON) {
        table[block] = floor;
        fixed[block] = 1;
        raised++;
      }
    }
    return raised;
  }

  function* conversionFloors() {
    const floors = new Map();
    for (let r = 0; r < RECIPES.length; r++) {
      const [result, count, groups] = RECIPES[r];
      if (Number.isNaN(table[result])) continue;
      const groupCost = groups.map((group) => Math.min(...group.map(raw)));
      const worth = table[result] * count;
      const seen = new Set();
      for (const group of groups) {
        for (const item of group) {
          if (!Number.isNaN(table[item]) || seen.has(item)) continue;
          seen.add(item);
          let slots = 0;
          let rest = 0;
          for (let g = 0; g < groups.length; g++) {
            if (groups[g].includes(item)) slots++;
            else rest += groupCost[g];
          }
          const share = (worth - rest) / slots;
          if (share > rarityFallbackIndex(item) + EPSILON) floors.set(item, Math.max(floors.get(item) ?? share, share));
        }
      }
      if ((r & 255) === 255) yield;
    }
    for (const [item, value] of floors) {
      table[item] = value;
      fixed[item] = 1;
    }
    return floors.size;
  }

  yield* relax();
  for (let round = 0; round < MAX_FLOOR_ROUNDS; round++) {
    const byLoot = lootFloors();
    const byConversion = yield* conversionFloors();
    if (byLoot + byConversion === 0) break;
    yield* relax();
  }
  return table;
}

/** Installs a table produced by computePrices(). */
export function setPrices(table) {
  prices = table;
  potionTable = potionPrices(rawValue);
  catalogCache = null;
}
potionTable = potionPrices(rawValue);

/** True when the shipped default table may differ from what the config asks for. */
export function needsRecompute() {
  return OVERRIDES.size > 0 || (CONFIG.blacklist ?? []).length > 0;
}

// ---------------------------------------------------------------------------
// Odds (UpgradeOdds)
// ---------------------------------------------------------------------------

export function chance(inputValue, targetValue) {
  if (inputValue <= 0 || targetValue <= 0) return 0;
  const raw = (HOUSE_EDGE * inputValue) / targetValue;
  return Math.max(MIN_CHANCE, Math.min(MAX_CHANCE, raw));
}

/** Where the needle stops (degrees clockwise from the top); the win zone is [0, chance * 360). */
export function landingAngle(odds, win, random = Math.random) {
  const zone = odds * 360;
  const span = win ? zone : 360 - zone;
  const margin = Math.min(1.5, span * 0.2);
  const usable = Math.max(0.01, span - margin * 2);
  const offset = margin + random() * usable;
  return win ? offset : (zone + offset) % 360;
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

const ITEM_INFO = new Map(); // id -> { id, name, icon }
for (let i = 0; i < BEDROCK_COUNT; i++) {
  ITEM_INFO.set(NODE_IDS[i], { id: NODE_IDS[i], name: NAMES[i], icon: ICONS[i] ? "textures/" + ICONS[i] : "" });
}

/** English name and icon path of a vanilla item (custom items get a name made from their id). */
export function itemInfo(id) {
  let info = ITEM_INFO.get(id);
  if (!info && isPotionKey(id)) {
    info = potionInfo(id);
    ITEM_INFO.set(id, info);
  }
  if (!info && id === "upgrader:upgrader") {
    info = { id, name: "Upgrader", icon: "textures/upgrader/items/upgrader" };
    ITEM_INFO.set(id, info);
  }
  if (!info) {
    const path = id.split(":").pop();
    info = { id, name: path.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "), icon: customIcons.get(id) ?? "" };
    ITEM_INFO.set(id, info);
  }
  return info;
}

let available = null; // ids that exist in this game version (set by setAvailableItems)
let catalogCache = null;

/** Called once the world is loaded with the ids that can be created as ItemStacks. */
export function setAvailableItems(ids) {
  available = ids;
  catalogCache = null;
}

/** Adds one item (an add-on item announced after startup) to the catalogue. */
export function addAvailableItem(id) {
  if (!available) available = NODE_IDS.slice(0, BEDROCK_COUNT);
  if (!available.includes(id)) available.push(id);
  catalogCache = null;
}

/** Every item that can be picked as a target, cheapest first (ItemValues.catalog). */
export function catalog() {
  if (catalogCache) return catalogCache;
  const ids = (available ?? NODE_IDS.slice(0, BEDROCK_COUNT)).filter(canWin);
  const keyed = ids.map((id) => ({ id, value: unitValue(id) }));
  keyed.sort((a, b) => a.value - b.value || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  catalogCache = keyed.map((entry) => entry.id);
  return catalogCache;
}

/** Vanilla ids from the generated data, plus priced items from other add-ons. */
export function candidateItems() {
  const ids = NODE_IDS.slice(0, BEDROCK_COUNT);
  for (const id of OVERRIDES.keys()) if (!NODE_INDEX.has(id) || NODE_INDEX.get(id) >= BEDROCK_COUNT) ids.push(id);
  return ids;
}
