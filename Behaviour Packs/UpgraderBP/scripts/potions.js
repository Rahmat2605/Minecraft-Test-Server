// Potions: each effect in each bottle (drink, splash, lingering) is its own item in the catalogue,
// keyed "minecraft:potion|minecraft:healing". Bedrock tells them apart through the potion
// component and creates them with Potions.resolve (Script API 2.4.0 and later; the add-on targets 2.10.0).
//
// The Java mod blacklists potions (one item id for every effect there); here each one is priced
// along its brewing chain, the same way the mod prices crafting: a potion costs its cheapest brew,
// i.e. the potion it is brewed from + a third of the ingredient (one ingredient brews three
// bottles) + a sixtieth of a blaze powder (one powder fuels 20 brews of three).

import * as mc from "@minecraft/server";

const SEP = "|";

/** Bottle item -> delivery type id used by Potions.resolve. */
export const DELIVERY = {
  "minecraft:potion": "Consume",
  "minecraft:splash_potion": "ThrownSplash",
  "minecraft:lingering_potion": "ThrownLingering",
};
const BOTTLES = Object.keys(DELIVERY);

// effect -> [potion it is brewed from, ingredient] (several lines = several ways, the cheapest counts)
const BREWS = [
  ["minecraft:awkward", "minecraft:water", "minecraft:nether_wart"],
  ["minecraft:mundane", "minecraft:water", "minecraft:sugar"],
  ["minecraft:mundane", "minecraft:water", "minecraft:spider_eye"],
  ["minecraft:mundane", "minecraft:water", "minecraft:glistering_melon_slice"],
  ["minecraft:mundane", "minecraft:water", "minecraft:magma_cream"],
  ["minecraft:long_mundane", "minecraft:water", "minecraft:redstone"],
  ["minecraft:thick", "minecraft:water", "minecraft:glowstone_dust"],
  ["minecraft:nightvision", "minecraft:awkward", "minecraft:golden_carrot"],
  ["minecraft:invisibility", "minecraft:nightvision", "minecraft:fermented_spider_eye"],
  ["minecraft:leaping", "minecraft:awkward", "minecraft:rabbit_foot"],
  ["minecraft:fire_resistance", "minecraft:awkward", "minecraft:magma_cream"],
  ["minecraft:swiftness", "minecraft:awkward", "minecraft:sugar"],
  ["minecraft:slowness", "minecraft:swiftness", "minecraft:fermented_spider_eye"],
  ["minecraft:slowness", "minecraft:leaping", "minecraft:fermented_spider_eye"],
  ["minecraft:water_breathing", "minecraft:awkward", "minecraft:pufferfish"],
  ["minecraft:healing", "minecraft:awkward", "minecraft:glistering_melon_slice"],
  ["minecraft:harming", "minecraft:healing", "minecraft:fermented_spider_eye"],
  ["minecraft:harming", "minecraft:poison", "minecraft:fermented_spider_eye"],
  ["minecraft:poison", "minecraft:awkward", "minecraft:spider_eye"],
  ["minecraft:regeneration", "minecraft:awkward", "minecraft:ghast_tear"],
  ["minecraft:strength", "minecraft:awkward", "minecraft:blaze_powder"],
  ["minecraft:weakness", "minecraft:water", "minecraft:fermented_spider_eye"],
  ["minecraft:turtle_master", "minecraft:awkward", "minecraft:turtle_helmet"],
  ["minecraft:slow_falling", "minecraft:awkward", "minecraft:phantom_membrane"],
  ["minecraft:wind_charged", "minecraft:awkward", "minecraft:breeze_rod"],
  ["minecraft:weaving", "minecraft:awkward", "minecraft:web"],
  ["minecraft:oozing", "minecraft:awkward", "minecraft:slime"],
  ["minecraft:infested", "minecraft:awkward", "minecraft:stone"],
];
// long_X = X + redstone, strong_X = X + glowstone dust
const LONG = ["nightvision", "invisibility", "leaping", "fire_resistance", "swiftness", "slowness", "water_breathing",
  "poison", "regeneration", "strength", "weakness", "turtle_master", "slow_falling"];
const STRONG = ["leaping", "swiftness", "slowness", "healing", "harming", "poison", "regeneration", "strength", "turtle_master"];
for (const e of LONG) BREWS.push(["minecraft:long_" + e, "minecraft:" + e, "minecraft:redstone"]);
for (const e of STRONG) BREWS.push(["minecraft:strong_" + e, "minecraft:" + e, "minecraft:glowstone_dust"]);

/** Effects that can be brewed (Potion of Decay is creative-only, like the mod's blacklist). */
export const EFFECTS = ["minecraft:water", ...new Set(BREWS.map(([effect]) => effect))];

export const isPotionKey = (id) => typeof id === "string" && id.includes(SEP);
export const potionKey = (bottle, effect) => bottle + SEP + effect;

export function splitKey(id) {
  const [bottle, effect] = id.split(SEP);
  return { bottle, effect };
}

/** Catalogue key of a stack: "bottle|effect" for potions, else its type id. */
export function keyOf(stack) {
  if (!stack) return undefined;
  if (DELIVERY[stack.typeId]) {
    try {
      const effect = stack.getComponent("minecraft:potion")?.potionEffectType?.id;
      if (effect) return potionKey(stack.typeId, effect.includes(":") ? effect : "minecraft:" + effect);
    } catch {
      // older game: the potion component is not readable
    }
  }
  return stack.typeId;
}

/** A new stack for a catalogue key (potions through Potions.resolve). */
export function createStack(id, count = 1) {
  if (!isPotionKey(id)) return new mc.ItemStack(id, count);
  const { bottle, effect } = splitKey(id);
  const stack = mc.Potions.resolve(effect, DELIVERY[bottle]);
  stack.amount = Math.max(1, Math.min(count, stack.maxAmount));
  return stack;
}

/** Potion keys this game can make: every brewable effect in every bottle. */
export function potionCandidates() {
  if (!mc.Potions?.resolve) return [];
  let known;
  try {
    known = new Set(mc.Potions.getAllEffectTypes().map((type) => (type.id.includes(":") ? type.id : "minecraft:" + type.id)));
  } catch {
    known = new Set(EFFECTS);
  }
  const keys = [];
  for (const bottle of BOTTLES) for (const effect of EFFECTS) if (known.has(effect)) keys.push(potionKey(bottle, effect));
  return keys;
}

/**
 * Price of every potion key, from the prices of its ingredients (valueOf(itemId) -> number).
 * Returns a Map key -> price.
 */
export function potionPrices(valueOf) {
  const fuel = valueOf("minecraft:blaze_powder") / 60;
  const drink = new Map([["minecraft:water", valueOf("minecraft:glass_bottle")]]);
  for (let pass = 0; pass < 8; pass++) {
    for (const [effect, parent, ingredient] of BREWS) {
      const base = drink.get(parent);
      if (base === undefined) continue;
      const cost = base + valueOf(ingredient) / 3 + fuel;
      if (!(drink.get(effect) <= cost)) drink.set(effect, cost);
    }
  }
  const splashStep = valueOf("minecraft:gunpowder") / 3 + fuel;
  const lingerStep = valueOf("minecraft:dragon_breath") / 3 + fuel;
  const prices = new Map();
  for (const [effect, value] of drink) {
    prices.set(potionKey("minecraft:potion", effect), Math.max(1, value));
    prices.set(potionKey("minecraft:splash_potion", effect), Math.max(1, value + splashStep));
    prices.set(potionKey("minecraft:lingering_potion", effect), Math.max(1, value + splashStep + lingerStep));
  }
  return prices;
}

// ---------------------------------------------------------------------------
// Names and icons
// ---------------------------------------------------------------------------

const PLAIN = { "minecraft:water": "Water Bottle", "minecraft:awkward": "Awkward Potion", "minecraft:mundane": "Mundane Potion",
  "minecraft:long_mundane": "Mundane Potion", "minecraft:thick": "Thick Potion" };
const TEXTURE = { nightvision: "nightVision", invisibility: "invisibility", leaping: "jump", fire_resistance: "fireResistance",
  swiftness: "moveSpeed", slowness: "moveSlowdown", water_breathing: "waterBreathing", healing: "heal", harming: "harm",
  poison: "poison", regeneration: "regeneration", strength: "damageBoost", weakness: "weakness", turtle_master: "turtleMaster",
  slow_falling: "slowFall", wind_charged: "windCharged", weaving: "weaving", oozing: "oozing", infested: "infested" };
const TITLE = { nightvision: "Night Vision", fire_resistance: "Fire Resistance", water_breathing: "Water Breathing",
  turtle_master: "the Turtle Master", slow_falling: "Slow Falling", wind_charged: "Wind Charging" };

function baseEffect(effect) {
  const name = effect.replace("minecraft:", "");
  if (name.startsWith("long_")) return { name: name.slice(5), level: " (long)" };
  if (name.startsWith("strong_")) return { name: name.slice(7), level: " II" };
  return { name, level: "" };
}

/** English name (used by the catalogue search) and icon path of a potion key. */
export function potionInfo(id) {
  const { bottle, effect } = splitKey(id);
  const prefix = bottle === "minecraft:splash_potion" ? "Splash " : bottle === "minecraft:lingering_potion" ? "Lingering " : "";
  const { name, level } = baseEffect(effect);
  let title;
  if (PLAIN[effect]) title = prefix + PLAIN[effect];
  else {
    const pretty = TITLE[name] ?? name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    title = prefix + "Potion of " + pretty + level;
  }
  const look = TEXTURE[name];
  const kind = bottle === "minecraft:splash_potion" ? "splash" : bottle === "minecraft:lingering_potion" ? "lingering" : "";
  let icon;
  if (!look) icon = kind ? "textures/items/potion_bottle_" + kind : "textures/items/potion_bottle_drinkable";
  else icon = "textures/items/potion_bottle_" + (kind ? kind + "_" : "") + look;
  return { id, name: title, icon };
}

// keys of the game's own potion names (potion.<name>.name, .splash.name, .linger.name)
const LANG = { water: "emptyPotion", awkward: "awkward", mundane: "mundane", thick: "thick", slow_falling: "slowFalling" };

/** Translated name of a potion key, with "II" for strong and "(long)" for long potions. */
export function potionName(id) {
  const { bottle, effect } = splitKey(id);
  const { name, level } = baseEffect(effect);
  const lang = LANG[name] ?? TEXTURE[name] ?? name;
  const kind = bottle === "minecraft:splash_potion" ? "splash." : bottle === "minecraft:lingering_potion" ? "linger." : "";
  const parts = [{ translate: "potion." + lang + "." + kind + "name" }];
  if (level === " II") parts.push({ text: " II" });
  else if (level) parts.push({ text: " " }, { translate: "upgrader.potion.long" });
  return { rawtext: parts };
}
