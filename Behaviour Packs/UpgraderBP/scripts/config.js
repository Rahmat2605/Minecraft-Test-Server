// Upgrader settings. Same options and defaults as config/upgrader.json of the Java mod.
// After editing, run /reload (or restart the world) for the changes to apply.

export const CONFIG = {
  // chance = houseEdge * inputValue / targetValue, then clamped to [minChance, maxChance]
  houseEdge: 0.9,
  minChance: 0.001,
  maxChance: 0.9,

  // How long the wheel spins, in ticks (20 ticks = 1 second; at most 80 on the Bedrock screen)
  spinDurationTicks: 70,

  // Fixed prices. They replace the computed price and flow into everything crafted from them.
  // Example: { "minecraft:diamond": 500, "myaddon:ruby": 250 }
  // Items from other add-ons are found by themselves (customItems below); a price here wins over all others.
  valueOverrides: {},

  // Items that can never be put in or picked as the target. Example: ["minecraft:elytra"]
  blacklist: [],

  // Multiplies every price (does not change the odds, only the numbers shown)
  globalValueMultiplier: 1.0,

  // Multiplies the price of single items. Example: { "minecraft:netherite_ingot": 1.5 }
  valueMultipliers: {},

  // Highest "Amount" a player can ask for (also limited by the target's max stack size)
  maxTargetCount: 64,

  // Give every player one Upgrader the first time they join the world (it can still be crafted)
  giveOnFirstJoin: true,

  // Items from other add-ons: every registered item that is not "minecraft:" or "upgrader:" is offered.
  // Price order: valueOverrides > /scriptevent upgrader:price <id> <value> > item tag "upgrader:value_<n>"
  //   > estimate (autoPrice). Hide one with blacklist, the tag "upgrader:blacklist" or /scriptevent upgrader:blacklist <id>.
  customItems: {
    enabled: true,
    autoPrice: true, // estimate from durability, food, stack size and the words in the id when no price is given
    autoMultiplier: 1.0, // scales only the estimates
    minValue: 3, // lowest and highest estimate
    maxValue: 5000,
    iconGuess: true, // icon = "textures/items/<name>" unless given in icons
    icons: {}, // Example: { "myaddon:ruby": "textures/items/ruby_gem" }
    allowNamespaces: [], // Example: ["myaddon"]; empty = every add-on
    denyNamespaces: [],
  },

  // Enchantments add to what a stake is worth: perLevel for each level, x treasure for mending,
  // frost walker, soul speed, swift sneak and wind burst; curses add nothing. Enchanted books can then
  // be staked (as a book + their enchantments); they are never a prize.
  enchantments: {
    enabled: true,
    perLevel: 30,
    treasure: 3,
  },

  // Tell the whole server when someone wins with a chance at or below maxChance (0.1 = 10%).
  announceWins: {
    enabled: false,
    maxChance: 0.1,
  },

  // Anti-spam: at most attemptLimit upgrades per attemptWindowSeconds (0 = no limit)
  attemptLimit: 0,
  attemptWindowSeconds: 0,
};
