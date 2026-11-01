import { world, system, EntityComponentTypes, ItemStack } from "@minecraft/server";

const VILLAGER = "minecraft:villager_v2";
const NOSE_ITEM = "fmc:villager_nose";
const NOSE_FLAG = "fmc:noseless";
const HEAR_RANGE = 14;
const REACT_RANGE = 8;
const REPEAT_COOLDOWN = 600;
const QUEUE_LIFETIME = 200;
const SPEAK_GAP = 12;

const PROFESSIONS = [
  "farmer", "fisherman", "shepherd", "fletcher", "librarian", "cartographer",
  "cleric", "armorer", "weaponsmith", "toolsmith", "butcher", "leatherworker",
  "stone_mason", "mason"
];

const LINES = {
  1: "Oh! I didn't see you there.",
  2: "A visitor... wonderful!",
  3: "Why are you looking at me like that...?",
  4: "Is there something on my face?",
  5: "Are you... broken?",
  6: "Whoa. That's a lot of you, all at once.",
  7: "I can still see you, you know!",
  8: "Was that really necessary?",
  9: "That tree had a good life...",
  10: "Careful! That stone was load-bearing. Maybe.",
  11: "Slow down! You're making a mess!",
  12: "Great. Now how am I supposed to keep the draft out?",
  13: "That was my only bed!!",
  14: "Put that back. Right now.",
  15: "Ooh... decorating, I see.",
  16: "Is that... real?! Can I touch it?",
  17: "Why is there TNT? WHY. IS. THERE. TNT.",
  18: "RUN! RUN NOW!!",
  19: "Finally! Someone with a work ethic.",
  20: "A bed?! At last, some proper furniture.",
  21: "Is it music time?! Please say it's music time.",
  22: "Let's see what you've got...",
  23: "Pleasure doing business with you!",
  24: "...Rude. But okay.",
  25: "Ah! My favorite customer!",
  26: "I don't trust you. But... fine.",
  27: "One wrong move, and I'm calling the golem.",
  28: "I don't have a job! Stop asking!",
  29: "ZOMBIE! Someone do something!!",
  30: "Nobody move. Nobody. Breathe.",
  31: "Is that thing made entirely of bones...?",
  32: "I really, REALLY don't like the eight legs.",
  33: "Don't look at it! Don't. Look. At it.",
  34: "That potion smells like trouble...",
  35: "It's just... bouncing. Why is it bouncing?",
  36: "That... is the single worst thing I have ever seen.",
  37: "Good morning to you too, cow.",
  38: "Nice wool! Very fluffy.",
  39: "Oh no... what happened to you?",
  40: "Well hello there, good boy!",
  41: "The cat's judging me again...",
  42: "Careful! Don't step on the chicken!",
  43: "That is way too cute to be real.",
  44: "OW! That actually hurt!",
  45: "Why would you DO that?!",
  46: "A SWORD?! Really?!",
  47: "Ugh... note to self: stop jumping off things.",
  48: "I'M ON FIRE! THIS IS BAD!!",
  49: "Nope. Nope, nope, nope. I'm out.",
  50: "Okay... okay, we're fine. Everything's fine.",
  51: "I did NOT need to see that.",
  52: "I have a purpose now! A JOB!",
  53: "Just doing my job... nothing to see here.",
  54: "Home time. Finally.",
  55: "Where did my bed go?! I need my bed!",
  56: "Just wandering... living my best life.",
  57: "No job. No purpose. Just vibes.",
  58: "I'm basically an expert now!",
  59: "MASTER level! Someone throw me a parade!!",
  60: "Bedtime. Don't wait up.",
  61: "...five more minutes...",
  62: "Ahh... what a nap.",
  63: "I was SLEEPING!",
  64: "My favorite person is here!!",
  65: "The legend has returned!!",
  66: "Oh. It's you again.",
  67: "Get away from me. Seriously.",
  68: "The hero! Everyone, look, it's the hero!!",
  69: "Great... my hair is ruined.",
  70: "Whoa! That was way too close!",
  71: "Good morning! Big day ahead.",
  72: "Winding down for the day, I see.",
  73: "Bit late to be wandering... isn't it?",
  74: "Whoa! That was fast!",
  75: "Wait... where did the sun go?",
  76: "How are you doing that?! That's not fair!",
  77: "I know you're there... I can feel it.",
  78: "Look at you! All shiny and dangerous.",
  79: "That... is a bold fashion choice.",
  80: "You look like you need to sit down.",
  81: "For me?! You're too kind.",
  82: "Now THIS is a good look!",
  83: "MY NOSE! GIVE IT BACK!!",
  84: "Ahh, there it is... much better.",
  85: "Ooooh, pretty! Do it again!!",
  86: "Was that the bell?! Is it bell time?!",
  87: "Are we going somewhere...? Where are we going?",
  88: "This isn't working. We are NOT moving.",
  89: "Choo choo... I suppose.",
  90: "Did you hear what happened at the well?",
  91: "No! Tell me everything!",
  92: "This fire is doing wonders for morale.",
  93: "DING DONG! Is it lunch? Please say it's lunch!",
  94: "I'm not jobless. I'm just... retired.",
  95: "My job? Professional nap tester. Very busy.",
  96: "Excuse me! Child labour is illegal. I'm calling the golem!",
  97: "When I grow up, my nose will be bigger than yours!",
  98: "Tag! You're it! ...Why aren't you running?",
  99: "Mom said don't talk to strangers. Hi stranger!",
  100: "Is that a real sword? Can I hold it? Mom says no, but can I?",
  101: "(sniff) ...I'm telling my mom! (sniff)",
  102: "Are you a hero? You don't look like a hero.",
  103: "Five more minutes of playing! PLEASE!",
  104: "Everybody DANCE! Come on!",
  105: "My knees are way too old for this.",
  106: "Watch this move! ...Ow. Ow. My back.",
  107: "Are we sneaking? Why are we sneaking?",
  109: "...no... not my emeralds...",
  110: "Who turned off the sun?",
  113: "Is it just me, or is it super hot today?",
  117: "Is this a discount? Please say it's a discount.",
  120: "Who ate my bread?! I had ONE bread!",
  121: "Diamonds?! Can I... hold it? Just once?",
  125: "I'm not crying! My nose is sweating!",
  127: "Villager fact: we never blink. ...Wait, we do now?",
  128: "Hmm... hmmm... HMMMM.",
  130: "Boat trip! Wait... where is the steering wheel?",
  131: "This house has no bed. This is a scam!",
  134: "I saw a creeper once. Once was enough.",
  138: "Haha! You fell! ...Are you okay? HAHA!",
  139: "Hey! That's my crop! Farmers have feelings too!",
  141: "No way! Then what happened?!",
  142: "Goodnight world. Goodnight bed. Goodnight nose."
};

const DURATION = {
  1: 48, 2: 55, 3: 61, 4: 50, 5: 38, 6: 60, 7: 49, 8: 47, 9: 46, 10: 83,
  11: 58, 12: 77, 13: 41, 14: 50, 15: 50, 16: 61, 17: 104, 18: 43, 19: 58, 20: 63,
  21: 76, 22: 44, 23: 50, 24: 49, 25: 46, 26: 55, 27: 68, 28: 63, 29: 55, 30: 61,
  31: 60, 32: 68, 33: 71, 34: 52, 35: 65, 36: 90, 37: 47, 38: 45, 39: 54, 40: 46,
  41: 49, 42: 60, 43: 54, 44: 44, 45: 45, 46: 50, 47: 76, 48: 70, 49: 60, 50: 63,
  51: 50, 52: 57, 53: 61, 54: 45, 55: 64, 56: 56, 57: 63, 58: 46, 59: 68, 60: 48,
  61: 32, 62: 46, 63: 37, 64: 45, 65: 45, 66: 40, 67: 48, 68: 61, 69: 51, 70: 47,
  71: 47, 72: 48, 73: 50, 74: 40, 75: 47, 76: 50, 77: 50, 78: 56, 79: 52, 80: 48,
  81: 54, 82: 45, 83: 43, 84: 51, 85: 46, 86: 59, 87: 63, 88: 63, 89: 40, 90: 49,
  91: 39, 92: 55,
  93: 92, 94: 86, 95: 84, 96: 106, 97: 70, 98: 64, 99: 79, 100: 100, 101: 70, 102: 63, 103: 58, 104: 56, 105: 65, 106: 88, 107: 73, 109: 124, 110: 31, 113: 54, 117: 62, 120: 63, 121: 100, 125: 73, 127: 120, 128: 92, 130: 94, 131: 56, 134: 92, 138: 114, 139: 86, 141: 60, 142: 100
};

const PRIORITY = {
  13: 4, 14: 4, 17: 4, 18: 4, 44: 4, 45: 4, 46: 4, 47: 4, 48: 4, 49: 4, 51: 4, 63: 4, 83: 4,
  16: 3, 29: 3, 30: 3, 31: 3, 32: 3, 33: 3, 34: 3, 35: 3, 36: 3, 84: 3,
  8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 15: 2, 19: 2, 20: 2, 21: 2,
  22: 2, 23: 2, 24: 2, 25: 2, 26: 2, 27: 2, 28: 2, 52: 2, 58: 2, 59: 2,
  60: 2, 62: 2, 70: 2, 74: 2, 75: 2, 81: 2, 82: 2, 85: 2, 86: 2,
  87: 2, 88: 2, 89: 2,
  100: 3, 121: 3, 134: 3, 138: 3, 96: 3, 101: 3, 93: 2, 94: 2, 95: 2, 104: 2, 107: 2, 117: 2, 130: 2, 131: 2, 139: 2, 142: 2
};

const WOOD = ["log", "planks", "wood", "stem", "hyphae", "fence", "trapdoor"];
const STONE = ["stone", "cobble", "deepslate", "granite", "diorite", "andesite", "tuff", "basalt"];
const VALUABLE = [
  "iron_block", "gold_block", "diamond_block", "emerald_block", "netherite_block",
  "lapis_block", "copper_block", "raw_iron_block", "raw_gold_block", "raw_copper_block"
];
const WORKSTATIONS = [
  "crafting_table", "furnace", "blast_furnace", "smoker", "barrel", "lectern", "loom",
  "fletching_table", "cartography_table", "brewing_stand", "cauldron", "composter",
  "smithing_table", "stonecutter", "grindstone", "anvil"
];
const FOOD = ["bread", "carrot", "potato", "beetroot", "wheat", "apple", "beef", "porkchop", "chicken", "cookie", "cake", "melon", "berries"];

const HOSTILE = [
  { type: "minecraft:zombie", line: 29 },
  { type: "minecraft:zombie_villager_v2", line: 29 },
  { type: "minecraft:husk", line: 29 },
  { type: "minecraft:drowned", line: 29 },
  { type: "minecraft:creeper", line: 30 },
  { type: "minecraft:skeleton", line: 31 },
  { type: "minecraft:stray", line: 31 },
  { type: "minecraft:bogged", line: 31 },
  { type: "minecraft:spider", line: 32 },
  { type: "minecraft:cave_spider", line: 32 },
  { type: "minecraft:enderman", line: 33 },
  { type: "minecraft:witch", line: 34 },
  { type: "minecraft:slime", line: 35 },
  { type: "minecraft:magma_cube", line: 35 },
  { type: "minecraft:wither", line: 36 },
  { type: "minecraft:ender_dragon", line: 36 },
  { type: "minecraft:warden", line: 36 }
];

const FRIENDLY = [
  { type: "minecraft:cow", line: 37 },
  { type: "minecraft:mooshroom", line: 37 },
  { type: "minecraft:sheep", line: 38 },
  { type: "minecraft:wolf", line: 40 },
  { type: "minecraft:cat", line: 41 },
  { type: "minecraft:ocelot", line: 41 },
  { type: "minecraft:chicken", line: 42 },
  { type: "minecraft:rabbit", line: 43 }
];

const MOODS = {
  happy: [2, 23, 25, 37, 38, 40, 43, 56, 57, 62, 64, 71, 78, 81, 84, 97, 98, 99, 117, 138],
  excited: [16, 19, 20, 21, 52, 59, 65, 68, 85, 86, 91, 93, 103, 104, 121, 100],
  scared: [17, 18, 29, 31, 32, 48, 49],
  nervous: [7, 30, 33, 34, 42, 50, 75, 77, 107, 134],
  angry: [8, 11, 12, 13, 14, 27, 45, 46, 63, 67, 96, 120, 131, 139],
  hurt: [44, 47, 106],
  sad: [9, 39, 51, 55],
  curious: [3, 4, 5, 6, 10, 15, 22, 26, 35, 41, 73, 80, 87, 102, 110, 127, 128, 130],
  disgust: [36, 79],
  surprised: [1, 70, 74, 76, 141],
  gossip: [90, 92],
  sleepy: [54, 60, 61, 72, 109, 142],
  grumpy: [24, 28, 66, 69, 88, 89, 105, 113],
  proud: [53, 58, 82, 94, 95],
  rage: [83],
  cry: [101, 125]
};

const LINE_MOOD = {};
for (const [mood, lines] of Object.entries(MOODS)) {
  for (const line of lines) LINE_MOOD[line] = mood;
}

const VARIANTS = {
  happy: ["happy", "happy_clap", "happy_sway", "happy_nod", "happy_skip"],
  excited: ["excited", "excited_jump", "excited_spin", "excited_cheer", "excited_bounce"],
  scared: ["scared", "scared_cower", "scared_look_around", "scared_backstep", "scared_shiver"],
  nervous: ["nervous", "nervous_fidget", "nervous_glance", "nervous_shrink", "nervous_sweat"],
  angry: ["angry", "angry_stomp", "angry_point", "angry_huff", "angry_shake_fist"],
  hurt: ["hurt", "hurt_stagger", "hurt_hold", "hurt_limp"],
  sad: ["sad", "sad_sigh", "sad_shake_head", "sad_mope"],
  curious: ["curious", "curious_peek", "curious_sniff", "curious_ponder", "curious_squint"],
  disgust: ["disgust", "disgust_gag", "disgust_turn", "disgust_wave_off"],
  surprised: ["surprised", "surprised_jolt", "surprised_gasp", "surprised_double_take"],
  gossip: ["gossip", "gossip_whisper", "gossip_laugh", "gossip_gesture", "gossip_nod"],
  sleepy: ["sleepy", "sleepy_yawn", "sleepy_nod_off", "sleepy_stretch"],
  grumpy: ["grumpy", "grumpy_eye_roll", "grumpy_tap", "grumpy_cross"],
  proud: ["proud", "proud_puff", "proud_strut", "proud_bow"],
  rage: ["rage", "rage_tantrum", "rage_clutch"],
  cry: ["cry_sob", "cry_wail", "cry_rub_eyes"]
};

const LISTEN = ["listen", "listen_nod", "listen_lean", "listen_hmm"];
const BED_SAFE = ["sleepy", "sleepy_yawn", "sleepy_nod_off"];

const SIGNATURE = {
  4: "curious_squint",
  13: "angry_stomp",
  17: "angry_point",
  21: "dance",
  23: "proud_bow",
  24: "grumpy_cross",
  30: "frozen",
  33: "nervous_shrink",
  36: "disgust_gag",
  48: "on_fire",
  57: "happy_sway",
  59: "excited_spin",
  60: "sleepy_yawn",
  61: "sleepy_nod_off",
  62: "sleepy_stretch",
  85: "excited_cheer",
  89: "choo",
  91: "excited_bounce",
  93: "excited_jump",
  94: "grumpy_cross",
  95: "stretch_back",
  96: "angry_point",
  98: "excited_jump",
  99: "chat_wave_hello",
  100: "stare_wow",
  101: "cry_rub_eyes",
  104: "dance_disco",
  105: "dance_sway_arms",
  106: "dance_jumpy",
  107: "tiptoe",
  109: "sleepy_nod_off",
  120: "angry_stomp",
  121: "stare_wow",
  125: "cry_rub_eyes",
  127: "owl_head",
  128: "think_hard",
  130: "chat_shrug",
  131: "angry_stomp",
  138: "belly_laugh",
  139: "angry_shake_fist",
  141: "surprised_gasp",
  142: "sleepy_yawn"
};

const KID_LINES = new Set([96, 97, 98, 99, 100, 101, 102, 103]);

const TALK = "fmc.talk";
const REACT = "fmc.react";
const IDLE = "fmc.idle";
const FLEE = "fmc.flee";

const TALK_RANGE = 6;
const SHOUT_RANGE = 12;
const BELL_RANGE = 10;
const SHOUTS = new Set([13, 14, 17, 18, 29, 30, 31, 32, 33, 34, 35, 36, 44, 45, 46, 48, 49, 63, 83]);

const IDLE_LAYERS = [
  "idle_sway_slow", "idle_sway_fast", "idle_weight_shift", "idle_rock", "idle_bob", "idle_twist",
  "idle_lean_back", "idle_lean_side", "idle_bounce_toes", "idle_groove", "idle_head_bop",
  "idle_shoulder_roll", "idle_tiny_dance", "idle_hip_sway", "idle_nod_along", "idle_breathe_big"
];
const DANCES = [
  "dance", "dance_shuffle", "dance_twist", "dance_headbang", "dance_robot", "dance_disco",
  "dance_chicken", "dance_wave_body", "dance_spin_slow", "dance_jumpy", "dance_sway_arms",
  "dance_crouch", "dance_floss", "dance_moonwalk", "dance_macarena", "dance_clap_step", "dance_hop",
  "dance_swing", "dance_bounce_crouch", "dance_arm_roll", "dance_leg_kick", "dance_penguin",
  "dance_conga", "dance_sprinkler", "dance_worm", "dance_cabbage_patch", "dance_charleston", "dance_salsa",
  "dance_chicken_run", "dance_robot_arms", "dance_shuffle_fast", "dance_spin_hop", "dance_disco_point", "dance_hip_bump",
  "dance_limbo", "dance_windmill", "dance_kick_line", "dance_head_spin", "dance_wiggle_nose", "dance_belly_shake"
];
const CROUCH_DANCES = ["dance_crouch", "crouch_bounce_side", "crouch_walk_dance", "dance_bounce_crouch"];
const MIMIC = "fmc.mimic";
const CROPS = ["wheat", "carrots", "potatoes", "beetroot", "melon_stem", "pumpkin_stem", "sweet_berry"];
const IDLE_FUNNY = [120, 127];
const KID_IDLE = [97, 98, 102];

const FLEES = [
  "flee_flail", "flee_hands_up", "flee_look_back", "flee_cover_head", "flee_scream", "flee_zigzag", "flee_duck",
  "flee_sprint_lean", "flee_wave_arms_side", "flee_hop_panic", "flee_trip", "flee_spin_around", "flee_tiptoe_fast"
];
const RECOVER = ["pant", "hands_on_knees", "wipe_sweat", "relief_sigh", "look_behind", "collapse_sit"];
const IDLE_STILL = [
  "idle_tap_foot", "idle_look_left_right", "idle_check_nails", "idle_whistle", "idle_rub_hands", "idle_hum_sway",
  "idle_crack_neck", "idle_bored_slump", "idle_kick_dirt", "idle_stare_blank", "idle_heel_bounce", "idle_pose_hero",
  "stretch_side", "yawn_arms", "look_at_sky_point",
  "chill_lean", "chill_sway_hum", "chill_nap_standing", "chill_look_around", "chill_kick_pebble"
];
const SITS = ["sit_ground", "sit_bored", "lie_down_relax"];
const TWERKS = ["twerk", "twerk_fast", "butt_wiggle"];
const SWIM = "fmc.swim";
const CRIES = ["cry_sob", "cry_wail", "cry_rub_eyes", "cry_kneel"];
const HOT_BLOCKS = ["fire", "lava", "magma"];
const SEE_THROUGH = ["glass", "ice", "iron_bars", "leaves", "fence", "chain", "scaffolding", "barrier", "slime", "honey_block"];

const MAX_VOICES = 6;
const MEMORY_BASE = 400;
const MEMORY_IDLE = 1200;
const MEMORY_MAX = 4800;
const WATCH_RANGE = 32;
const HOLD_RANGE = 6;
const GAZE_RANGE = 10;

const FACE = {
  angry: 1, rage: 1,
  scared: 2, nervous: 2,
  happy: 3, excited: 3, proud: 3,
  sad: 4, hurt: 4,
  sleepy: 5,
  surprised: 6,
  disgust: 7, grumpy: 7,
  cry: 4
};

const MOOD_EMOTE = {
  angry: "anger", rage: "anger", scared: "shock", nervous: "sweat",
  happy: "happy", excited: "sparkle", proud: "happy", sad: "gloom",
  hurt: "gloom", sleepy: "sleep", surprised: "alert", disgust: "gloom",
  grumpy: "anger", curious: "question", gossip: "chat", cry: "tear"
};

const SECOND_EMOTE = { scared: "sweat", excited: "happy", happy: "heart", surprised: "shock", curious: "idea" };
const REPEAT_EMOTE = { angry: 12, rage: 10, scared: 20, nervous: 26, sleepy: 30, excited: 24, happy: 36, cry: 12 };
const STAY_PUT = new Set(["scared", "nervous", "hurt"]);

const TRAITS = ["cheerful", "timid", "grumpy", "brave", "chatty"];
const JOBS = [
  "Villager", "Farmer", "Fisherman", "Shepherd", "Fletcher", "Librarian", "Cartographer",
  "Cleric", "Armorer", "Weaponsmith", "Toolsmith", "Butcher", "Leatherworker", "Mason", "Nitwit"
];

const VALUABLE_ITEMS = [
  "diamond", "emerald", "netherite", "gold_block", "golden_apple", "totem", "elytra",
  "nether_star", "beacon", "heart_of_the_sea", "trident", "amethyst_block"
];

const CROWD = {
  shock: { moves: ["shock_freeze", "stare_wow", "surprised_gasp", "surprised_jolt", "jump_scare"], face: 6, marks: ["shock", "sparkle"] },
  scary: { moves: ["scared_cower", "scared_backstep", "scared_shiver", "surprised_jolt", "flee_hands_up", "flee_scream", "nervous_laugh"], face: 2, marks: ["alert", "sweat"] },
  bad: { moves: ["disgust_turn", "angry_huff", "grumpy_cross", "chat_facepalm", "glare", "sulk", "facepalm_quick", "clap_slow"], face: 7, marks: ["anger", "gloom"] },
  good: { moves: ["happy_clap", "happy_nod", "chat_wave_hello", "salute", "victory", "shy_twist", "happy_tear", "bow_deep", "curtsy"], face: 3, marks: ["happy", "heart"] },
  money: { moves: ["happy_nod", "stare_wow", "happy_clap", "jealous_pout", "proud_nose_up"], face: 3, marks: ["emerald", "sparkle"] },
  odd: { moves: ["curious_peek", "curious_squint", "chat_shrug", "mock_imitate", "point_laugh"], face: 0, marks: ["question"] }
};

const ARCS = {
  joke: [
    { s: "chat_explain", l: "listen_nod", se: "chat" },
    { s: "gossip_gesture", l: "listen_hmm", sf: 3, lf: 6, se: "idea", le: "question" },
    { s: "chat_laugh_big", l: "chat_laugh_big", sf: 3, lf: 3, se: "laugh", le: "laugh", both: true, laugh: true }
  ],
  friends: [
    { s: "chat_wave_hello", l: "chat_wave_hello", sf: 3, lf: 3, se: "happy", le: "happy", both: true },
    { s: "gossip_gesture", l: "chat_agree", sf: 3, se: "chat", le: "happy" },
    { s: "peekaboo", l: "belly_laugh", sf: 3, lf: 3, se: "happy", le: "laugh" },
    { s: "chat_blush", l: "chat_blush", sf: 3, lf: 3, se: "heart", le: "heart" }
  ],
  argue: [
    { s: "chat_explain", l: "grumpy_cross", lf: 7, se: "chat", le: "anger" },
    { s: "chat_argue", l: "chat_argue", sf: 1, lf: 1, se: "anger", le: "anger", both: true },
    { s: "angry_huff", l: "chat_shrug", sf: 1, lf: 7, se: "anger", le: "question" },
    { s: "chat_shrug", l: "chat_agree", sf: 3, lf: 3, se: "heart", le: "happy" }
  ],
  news: [
    { s: "chat_lean_in", l: "listen_lean", se: "chat" },
    { s: "gossip_whisper", l: "surprised_gasp", lf: 6, se: "alert", le: "shock" },
    { s: "chat_explain", l: "stare_wow", lf: 6, se: "idea", le: "sparkle" },
    { s: "chat_agree", l: "chat_agree", sf: 3, lf: 3, se: "happy", le: "happy", both: true }
  ],
  comfort: [
    { s: "sad_sigh", l: "listen_lean", sf: 4, lf: 4, se: "gloom" },
    { s: "chat_explain", l: "chat_agree", sf: 4, se: "chat", le: "heart" },
    { s: "chat_blush", l: "chat_wave", sf: 3, lf: 3, se: "heart", le: "happy" }
  ],
  prank: [
    { s: "sneak_peek", l: "idle_whistle", se: "idea" },
    { s: "boo", l: "jump_scare", sf: 3, lf: 6, se: "chat", le: "shock" },
    { s: "point_laugh", l: "sulk", sf: 3, lf: 7, se: "laugh", le: "anger", laugh: true },
    { s: "high_five", l: "shy_twist", sf: 3, lf: 3, se: "heart", le: "happy" }
  ],
  celebrate: [
    { s: "high_five", l: "high_five", sf: 3, lf: 3, se: "happy", le: "happy", both: true },
    { s: "fist_bump", l: "fist_bump", sf: 3, lf: 3, se: "sparkle", le: "sparkle", both: true },
    { s: "dance_salsa", l: "dance_charleston", sf: 3, lf: 3, se: "music", le: "music", both: true }
  ],
  band: [
    { s: "air_guitar", l: "idle_nod_along", sf: 3, se: "music" },
    { s: "air_guitar", l: "dance_headbang", sf: 3, lf: 3, se: "music", le: "music", both: true },
    { s: "bow_deep", l: "clap_slow", sf: 3, lf: 3, se: "happy", le: "heart" }
  ],
  secret: [
    { s: "shush", l: "listen_lean", se: "chat" },
    { s: "gossip_whisper", l: "surprised_gasp", lf: 6, se: "chat", le: "shock" },
    { s: "shush", l: "nervous_laugh", lf: 3, se: "idea", le: "sweat" }
  ],
  haggle: [
    { s: "chat_explain", l: "listen_hmm", se: "emerald", le: "question" },
    { s: "chat_shrug", l: "chat_argue", lf: 7, se: "question", le: "emerald" },
    { s: "chat_agree", l: "chat_agree", sf: 3, lf: 3, se: "emerald", le: "happy", both: true }
  ]
};

const TRAIT_ARCS = {
  cheerful: ["joke", "friends", "friends", "news", "celebrate", "band"],
  timid: ["news", "comfort", "comfort", "friends", "secret"],
  grumpy: ["argue", "argue", "haggle", "comfort", "prank"],
  brave: ["joke", "argue", "news", "haggle", "prank", "band"],
  chatty: ["news", "news", "joke", "friends", "haggle", "secret", "celebrate"]
};

const PLAYER_ARCS = {
  good: [
    { s: "chat_lean_in", l: "listen_lean", se: "chat" },
    { glance: true, s: "chat_explain", l: "stare_wow", sf: 3, lf: 3, se: "heart", le: "sparkle", caption: "§a* The villagers are praising you *" },
    { s: "happy_clap", l: "happy_clap", sf: 3, lf: 3, se: "happy", le: "heart", both: true }
  ],
  hero: [
    { s: "chat_explain", l: "listen_nod", se: "idea" },
    { glance: true, s: "excited_cheer", l: "stare_wow", sf: 3, lf: 3, se: "sparkle", le: "heart", caption: "§6* The villagers are telling stories about you, hero! *" },
    { s: "chat_agree", l: "chat_agree", sf: 3, lf: 3, se: "happy", le: "happy", both: true }
  ],
  bad: [
    { s: "gossip_whisper", l: "listen_lean", se: "chat" },
    { glance: true, s: "chat_argue", l: "grumpy_cross", sf: 1, lf: 7, se: "anger", le: "anger", caption: "§c* The villagers are whispering about you... *" },
    { s: "chat_facepalm", l: "sad_shake_head", sf: 7, lf: 7, se: "gloom", le: "anger" }
  ],
  odd: [
    { s: "chat_lean_in", l: "listen_hmm", se: "question" },
    { glance: true, s: "gossip_whisper", l: "curious_squint", lf: 6, se: "question", le: "idea", caption: "§7* The villagers glance at you and giggle *" },
    { s: "chat_laugh_big", l: "chat_laugh_big", sf: 3, lf: 3, se: "laugh", le: "laugh", both: true, laugh: true }
  ]
};

const HURT_LINES = [44, 47, 49];
const WORK_IDLE = [56, 53];
const JOBLESS_IDLE = [57, 56];

const queue = [];
const speaking = new Map();
const villagerBusy = new Map();
const lastLineTick = new Map();
const heard = new Map();
const playerState = new Map();
const villagerState = new Map();
const tradeState = new Map();
const subtitles = new Map();
const lastMove = new Map();
const sessions = new Map();
const sessionOf = new Map();
const afraidUntil = new Map();
const reactUntil = new Map();
const engaged = new Map();
const traits = new Map();
const pitches = new Map();
const fleeing = new Map();
const tantrums = new Map();
const fireSeen = new Map();
const mimics = new Map();
const swimming = new Map();
const parties = new Map();
const outings = new Map();
const dancing = new Map();

let lastWorldTime = 0;
let lastRaining = false;
let sessionCounter = 0;

function matchesAny(id, list) {
  for (const part of list) {
    if (id.includes(part)) return true;
  }
  return false;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function chance(p) {
  return Math.random() < p;
}

function priorityOf(line) {
  return PRIORITY[line] ?? 1;
}

function alive(entity) {
  try {
    return !!entity && entity.isValid;
  } catch {
    return false;
  }
}

function asleep(entity) {
  try {
    return entity.isSleeping === true;
  } catch {
    return false;
  }
}

function isBaby(villager) {
  try {
    return !!villager.getComponent(EntityComponentTypes.IsBaby);
  } catch {
    return false;
  }
}

function isCreative(player) {
  try {
    return String(player.getGameMode()).toLowerCase() === "creative";
  } catch {
    return false;
  }
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function fire(villager, event) {
  try {
    villager.triggerEvent(event);
  } catch {}
}

function prop(villager, key, fallback) {
  try {
    return villager.getProperty(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function setProp(villager, key, value) {
  try {
    if (villager.getProperty(key) !== value) villager.setProperty(key, value);
  } catch {}
}

function setFace(villager, value) {
  setProp(villager, "fmc:face", value);
}

function setTalking(villager, value) {
  setProp(villager, "fmc:talking", value);
}

function traitOf(villager) {
  const cached = traits.get(villager.id);
  if (cached) return cached;
  let trait;
  try {
    trait = villager.getDynamicProperty("fmc:trait");
    if (!TRAITS.includes(trait)) {
      trait = pick(TRAITS);
      villager.setDynamicProperty("fmc:trait", trait);
    }
  } catch {
    trait = "cheerful";
  }
  traits.set(villager.id, trait);
  return trait;
}

function pitchOf(villager) {
  if (isBaby(villager)) return 1.3 + Math.random() * 0.15;
  const cached = pitches.get(villager.id);
  if (cached) return cached;
  let pitch;
  try {
    pitch = villager.getDynamicProperty("fmc:pitch");
    if (typeof pitch !== "number") {
      pitch = Math.round((0.88 + Math.random() * 0.24) * 100) / 100;
      villager.setDynamicProperty("fmc:pitch", pitch);
    }
  } catch {
    pitch = 1;
  }
  pitches.set(villager.id, pitch);
  return pitch;
}

function nameOf(villager) {
  try {
    if (villager.nameTag) return villager.nameTag;
  } catch {}
  if (isBaby(villager)) return "Kid";
  try {
    const variant = villager.getComponent(EntityComponentTypes.Variant);
    if (variant) return JOBS[variant.value] ?? "Villager";
  } catch {}
  return "Villager";
}

function play(entity, name, controller, stop, blend) {
  if (!alive(entity)) return;
  try {
    entity.playAnimation("animation.fmc.villager." + name, {
      controller,
      stopExpression: stop ?? "0",
      blendOutTime: blend ?? 0.25
    });
  } catch {}
}

function rest(entity) {
  play(entity, "rest", TALK, "query.any_animation_finished", 0.3);
}

function headSpot(villager, lift) {
  try {
    const head = villager.getHeadLocation();
    return { x: head.x, y: head.y + (lift ?? 0.75), z: head.z };
  } catch {
    const spot = villager.location;
    return { x: spot.x, y: spot.y + 1.6 + (lift ?? 0.75), z: spot.z };
  }
}

function noseSpot(villager) {
  try {
    const head = villager.getHeadLocation();
    const view = villager.getViewDirection();
    return { x: head.x + view.x * 0.35, y: head.y - 0.15, z: head.z + view.z * 0.35 };
  } catch {
    return headSpot(villager, -0.2);
  }
}

function emote(villager, name) {
  if (!alive(villager) || !name) return;
  try {
    villager.dimension.spawnParticle("fmc:emote_" + name, headSpot(villager));
  } catch {}
}

function later(villager, ticks, fn) {
  const id = villager.id;
  system.runTimeout(() => {
    const v = world.getEntity(id);
    if (alive(v)) fn(v);
  }, Math.max(1, Math.floor(ticks)));
}

function burst(villager, particle) {
  try {
    villager.dimension.spawnParticle(particle, noseSpot(villager));
  } catch {}
}

function sound(villager, id, pitch, volume) {
  try {
    villager.dimension.playSound(id, villager.location, { pitch: pitch ?? 1, volume: volume ?? 1 });
  } catch {}
}

function villagersNear(location, dimension, range) {
  try {
    return dimension.getEntities({ location, maxDistance: range, type: VILLAGER });
  } catch {
    return [];
  }
}

function playersNear(location, dimension, range) {
  try {
    return dimension.getPlayers({ location, maxDistance: range });
  } catch {
    return [];
  }
}

function nearestPlayer(villager, range) {
  let best;
  let bestDist = Infinity;
  for (const player of playersNear(villager.location, villager.dimension, range)) {
    const d = distance(player.location, villager.location);
    if (d < bestDist) {
      bestDist = d;
      best = player;
    }
  }
  return best ? { player: best, dist: bestDist } : undefined;
}

function movingAway(villager, player) {
  try {
    const vel = villager.getVelocity();
    if (Math.hypot(vel.x, vel.z) < 0.03) return false;
    const dx = villager.location.x - player.location.x;
    const dz = villager.location.z - player.location.z;
    return vel.x * dx + vel.z * dz > 0;
  } catch {
    return false;
  }
}

function free(villager) {
  const id = villager.id;
  return !asleep(villager) && !speaking.has(id) && !sessionOf.has(id) && !isAfraid(villager) &&
    system.currentTick >= (reactUntil.get(id) ?? 0);
}

function engage(villager, ticks, hold, gaze) {
  const id = villager.id;
  const current = engaged.get(id);
  const until = Math.max(system.currentTick + ticks, current?.until ?? 0);
  engaged.set(id, { until, hold: hold || current?.hold === true });
  if (hold) fire(villager, "fmc:hold");
  if (gaze === "player") fire(villager, "fmc:gaze_player");
  else if (gaze === "villager") fire(villager, "fmc:gaze_villager");
}

function disengage(villager) {
  engaged.delete(villager.id);
  fire(villager, "fmc:release");
  setTalking(villager, false);
}

system.runInterval(() => {
  if (engaged.size === 0) return;
  const now = system.currentTick;
  for (const [id, entry] of engaged) {
    if (entry.until > now) continue;
    if (speaking.has(id) || sessionOf.has(id)) continue;
    const villager = world.getEntity(id);
    if (alive(villager)) disengage(villager);
    else engaged.delete(id);
  }
}, 10);

function posture(villager, mood, partner) {
  if (asleep(villager)) return { hold: false };
  if (partner) return { hold: true, gaze: "villager" };
  if (STAY_PUT.has(mood) || isAfraid(villager)) return { hold: false };
  const near = nearestPlayer(villager, GAZE_RANGE);
  if (!near || movingAway(villager, near.player)) return { hold: false };
  return { hold: near.dist <= HOLD_RANGE, gaze: "player" };
}

function moodFor(villager, line) {
  if (asleep(villager)) return pick(BED_SAFE);
  if (SIGNATURE[line] && chance(0.7)) return SIGNATURE[line];
  let mood = LINE_MOOD[line] ?? "curious";
  const trait = traitOf(villager);
  if ((mood === "curious" || mood === "gossip") && trait === "cheerful" && chance(0.3)) mood = "happy";
  if ((mood === "curious" || mood === "happy") && trait === "grumpy" && chance(0.3)) mood = "grumpy";
  if (mood === "scared" && trait === "brave" && chance(0.5)) return "angry_shake_fist";
  if (mood === "nervous" && trait === "timid" && chance(0.5)) mood = "scared";
  const options = VARIANTS[mood];
  const last = lastMove.get(villager.id);
  let choice = pick(options);
  if (choice === last && options.length > 1) choice = pick(options.filter((o) => o !== last));
  lastMove.set(villager.id, choice);
  return choice;
}

function faceFor(villager, mood) {
  const trait = traitOf(villager);
  if (mood === "scared" && trait === "brave") return 1;
  if ((mood === "curious" || mood === "gossip") && trait === "grumpy" && chance(0.3)) return 7;
  if ((mood === "curious" || mood === "gossip") && trait === "cheerful" && chance(0.3)) return 3;
  return FACE[mood] ?? 0;
}

function isAfraid(villager) {
  return system.currentTick < (afraidUntil.get(villager.id) ?? 0);
}

function scare(villager, ticks) {
  const trait = traitOf(villager);
  const span = Math.floor(ticks * (trait === "timid" ? 1.8 : trait === "brave" ? 0.4 : 1));
  if (span <= 0) return;
  const until = system.currentTick + span;
  afraidUntil.set(villager.id, Math.max(until, afraidUntil.get(villager.id) ?? 0));
  setProp(villager, "fmc:afraid", true);
  disengage(villager);
  flee(villager, span);
  const id = villager.id;
  system.runTimeout(() => {
    if (system.currentTick < (afraidUntil.get(id) ?? 0)) return;
    afraidUntil.delete(id);
    const v = world.getEntity(id);
    if (alive(v)) setProp(v, "fmc:afraid", false);
  }, span + 2);
}

function flee(villager, span) {
  const id = villager.id;
  const until = system.currentTick + span;
  const current = fleeing.get(id);
  if (current && current.until >= until) return;
  const style = current?.style ?? pick(FLEES);
  fleeing.set(id, { until, style });
  play(villager, style, FLEE, "0", 0.3);
  setFace(villager, traitOf(villager) === "brave" ? 1 : 2);
  emote(villager, pick(["shock", "alert", "sweat"]));
  for (let t = 18; t < span; t += 18) {
    system.runTimeout(() => {
      const entry = fleeing.get(id);
      if (!entry || entry.until !== until) return;
      const v = world.getEntity(id);
      if (!alive(v)) return;
      emote(v, pick(["sweat", "sweat", "alert", "shock"]));
      if (chance(0.3)) {
        const next = pick(FLEES);
        entry.style = next;
        play(v, next, FLEE, "0", 0.3);
      }
    }, t);
  }
  system.runTimeout(() => {
    const entry = fleeing.get(id);
    if (!entry || entry.until !== until) return;
    fleeing.delete(id);
    const v = world.getEntity(id);
    if (!alive(v)) return;
    play(v, "rest", FLEE, "query.any_animation_finished", 0.4);
    if (!speaking.has(id) && !sessionOf.has(id)) setFace(v, 0);
    feel(v, pick(RECOVER), 2, "sweat", 50);
  }, span);
}

function recentlyHeard(player, line) {
  const memory = heard.get(player.id);
  if (!memory) return false;
  const entry = memory.get(line);
  if (!entry) return false;
  const base = priorityOf(line) <= 1 ? MEMORY_IDLE : MEMORY_BASE;
  const wait = Math.min(MEMORY_MAX, base * Math.pow(1.6, entry.count - 1));
  return system.currentTick - entry.at < wait;
}

function lastHeardAt(player, line) {
  return heard.get(player.id)?.get(line)?.at ?? -99999;
}

function remember(player, line) {
  let memory = heard.get(player.id);
  if (!memory) {
    memory = new Map();
    heard.set(player.id, memory);
  }
  const entry = memory.get(line);
  const now = system.currentTick;
  if (entry && now - entry.at > MEMORY_MAX * 2) entry.count = 0;
  memory.set(line, { count: Math.min(5, (entry?.count ?? 0) + 1), at: now });
}

function canSee(villager, player) {
  try {
    const from = villager.getHeadLocation();
    const to = player.getHeadLocation();
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (length < 1) return true;
    const dir = { x: dx / length, y: dy / length, z: dz / length };
    let start = from;
    let left = length;
    for (let i = 0; i < 6; i++) {
      const hit = villager.dimension.getBlockFromRay(start, dir, {
        maxDistance: left,
        includeLiquidBlocks: false,
        includePassableBlocks: false
      });
      if (!hit) return true;
      if (!matchesAny(hit.block.typeId, SEE_THROUGH)) return false;
      const spot = hit.block.location;
      const cx = spot.x + 0.5 - start.x;
      const cy = spot.y + 0.5 - start.y;
      const cz = spot.z + 0.5 - start.z;
      const step = Math.max(0.2, cx * dir.x + cy * dir.y + cz * dir.z + 0.9);
      start = { x: start.x + dir.x * step, y: start.y + dir.y * step, z: start.z + dir.z * step };
      left -= step;
      if (left <= 0) return true;
    }
    return true;
  } catch {
    return true;
  }
}

function rangeFor(line) {
  if (line === 86) return BELL_RANGE;
  return SHOUTS.has(line) ? SHOUT_RANGE : TALK_RANGE;
}

function audienceFor(villager, line) {
  const shout = SHOUTS.has(line);
  return playersNear(villager.location, villager.dimension, rangeFor(line)).filter((p) => shout || canSee(villager, p));
}

function staleFor(villager, line) {
  const nearby = audienceFor(villager, line);
  if (nearby.length === 0) return true;
  for (const player of nearby) {
    if (!recentlyHeard(player, line)) return false;
  }
  return true;
}

function voicesNear(location) {
  let count = 0;
  const now = system.currentTick;
  for (const entry of speaking.values()) {
    if (entry.until < now) continue;
    if (distance(entry.spot, location) <= HEAR_RANGE) count++;
  }
  return count;
}

system.runInterval(() => {
  if (subtitles.size === 0) return;
  const now = system.currentTick;
  for (const [id, entry] of subtitles) {
    if (now > entry.until) {
      subtitles.delete(id);
      continue;
    }
    const player = world.getEntity(id);
    if (!alive(player)) {
      subtitles.delete(id);
      continue;
    }
    try {
      player.onScreenDisplay.setActionBar(entry.text);
    } catch {
      subtitles.delete(id);
    }
  }
}, 10);

function caption(player, text, ticks) {
  subtitles.set(player.id, { text, until: system.currentTick + ticks });
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch {}
}

function trimQueue() {
  while (queue.length > 12) {
    let worst = 0;
    for (let i = 1; i < queue.length; i++) {
      if (queue[i].priority < queue[worst].priority) worst = i;
      else if (queue[i].priority === queue[worst].priority && queue[i].added < queue[worst].added) worst = i;
    }
    queue.splice(worst, 1);
  }
}

function request(villager, line) {
  if (!alive(villager) || !LINES[line]) return false;
  if (sessionOf.has(villager.id)) return false;

  const now = system.currentTick;
  const repeatKey = villager.id + ":" + line;
  if (now - (lastLineTick.get(repeatKey) ?? -99999) < REPEAT_COOLDOWN) return false;
  if (staleFor(villager, line)) return false;

  const level = priorityOf(line);
  if (level >= 4) {
    lastLineTick.set(repeatKey, now);
    return speakNow(villager, line);
  }

  for (const item of queue) {
    if (item.villagerId === villager.id) return false;
    if (item.line === line && level < 3) return false;
  }

  lastLineTick.set(repeatKey, now);
  queue.push({ villagerId: villager.id, line, priority: level, added: now });
  trimQueue();
  return true;
}

function forceRequest(villager, line) {
  if (!alive(villager) || !LINES[line]) return false;
  lastLineTick.set(villager.id + ":" + line, system.currentTick);
  return speakNow(villager, line);
}

function silence(villager) {
  const current = speaking.get(villager.id);
  if (!current) return;
  speaking.delete(villager.id);
  const spot = villager.location;
  try {
    villager.dimension.runCommand(
      `stopsound @a[x=${spot.x.toFixed(1)},y=${spot.y.toFixed(1)},z=${spot.z.toFixed(1)},r=${HEAR_RANGE + 6}] social.${current.line}`
    );
  } catch {}
}

function speakNow(villager, line) {
  if (!alive(villager)) return false;
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].villagerId === villager.id) queue.splice(i, 1);
  }
  leaveSession(villager.id);
  silence(villager);
  return deliver(villager, line, { urgent: true });
}

function finish(id, token) {
  const entry = speaking.get(id);
  if (entry && entry.token !== token) return;
  speaking.delete(id);
  const villager = world.getEntity(id);
  if (!alive(villager)) return;
  setTalking(villager, false);
  if (sessionOf.has(id)) return;
  if (!fleeing.has(id)) setFace(villager, 0);
  rest(villager);
  play(villager, "rest", IDLE, "query.any_animation_finished", 0.4);
  disengage(villager);
}

function deliver(villager, line, options) {
  const now = system.currentTick;
  const length = DURATION[line] ?? 50;
  const audience = options?.partner
    ? playersNear(villager.location, villager.dimension, 8).filter((p) => canSee(villager, p))
    : audienceFor(villager, line);
  if (audience.length === 0) return false;
  if (!options?.urgent && voicesNear(villager.location) >= MAX_VOICES) return false;

  const kid = KID_LINES.has(line);
  if (kid && !isBaby(villager)) return false;
  try {
    const pitch = (kid ? 1 : pitchOf(villager)) + (Math.random() - 0.5) * 0.06;
    villager.dimension.playSound("social." + line, villager.location, { volume: 1, pitch });
  } catch {
    return false;
  }

  const token = (speaking.get(villager.id)?.token ?? 0) + 1 + Math.random();
  speaking.set(villager.id, { line, token, until: now + length, spot: villager.location });
  villagerBusy.set(villager.id, now + length + SPEAK_GAP);

  const mood = LINE_MOOD[line] ?? "curious";
  const move = moodFor(villager, line);
  const sleeping = asleep(villager);
  if (!fleeing.has(villager.id)) play(villager, move, TALK);
  if (!sleeping && !fleeing.has(villager.id) && !STAY_PUT.has(mood)) play(villager, pick(IDLE_LAYERS), IDLE);

  setFace(villager, sleeping ? 5 : faceFor(villager, mood));
  setTalking(villager, true);

  const stance = posture(villager, mood, options?.partner);
  if (stance.hold || stance.gaze) engage(villager, length + 10, stance.hold, stance.gaze);
  else if (!options?.partner && engaged.has(villager.id)) disengage(villager);
  if (!sleeping && (mood === "angry" || mood === "rage")) burst(villager, "minecraft:villager_angry");

  const first = move === "dance" || move === "choo" ? "music" : sleeping ? "sleep" : MOOD_EMOTE[mood];
  emote(villager, first);
  const second = SECOND_EMOTE[mood];
  if (second && !sleeping) later(villager, 14, (v) => emote(v, second));
  const every = REPEAT_EMOTE[sleeping ? "sleepy" : mood];
  if (first && every) {
    const id = villager.id;
    for (let t = every; t < length - 6; t += every) {
      system.runTimeout(() => {
        const current = speaking.get(id);
        if (!current || current.token !== token) return;
        const v = world.getEntity(id);
        if (alive(v)) emote(v, first);
      }, t);
    }
  }

  if (!options?.partner) {
    for (const other of villagersNear(villager.location, villager.dimension, 7)) {
      if (other.id === villager.id || !free(other)) continue;
      if (chance(0.55)) {
        const delay = 4 + Math.floor(Math.random() * 10);
        later(other, delay, (v) => {
          if (!free(v)) return;
          const face = mood === "angry" || mood === "rage" ? 6 : mood === "scared" ? 2 : mood === "happy" || mood === "excited" ? 3 : undefined;
          feel(v, pick(LISTEN), face, chance(0.4) ? MOOD_EMOTE[mood] : undefined, Math.min(length, 60));
        });
      }
    }
  }

  const text = "§e" + nameOf(villager) + ": §f" + LINES[line];
  for (const player of audience) {
    remember(player, line);
    caption(player, text, length);
  }

  const id = villager.id;
  system.runTimeout(() => finish(id, token), length);
  return true;
}

system.runInterval(() => {
  if (queue.length === 0) return;
  const now = system.currentTick;

  for (let i = queue.length - 1; i >= 0; i--) {
    if (now - queue[i].added > QUEUE_LIFETIME) queue.splice(i, 1);
  }
  if (queue.length === 0) return;

  queue.sort((a, b) => b.priority - a.priority || a.added - b.added);

  for (let i = queue.length - 1; i >= 0; i--) {
    const item = queue[i];
    const villager = world.getEntity(item.villagerId);
    if (!alive(villager)) {
      queue.splice(i, 1);
      continue;
    }
    if (now < (villagerBusy.get(villager.id) ?? 0)) continue;
    if (deliver(villager, item.line)) queue.splice(i, 1);
  }
}, 4);

function freeVillager(location, dimension, range) {
  const found = villagersNear(location, dimension, range ?? REACT_RANGE);
  const now = system.currentTick;
  let best;
  let bestDist = Infinity;
  let fallback;
  let fallbackDist = Infinity;

  for (const v of found) {
    if (asleep(v)) continue;
    const d = distance(v.location, location);
    const busy = now < (villagerBusy.get(v.id) ?? 0);
    if (!busy && d < bestDist) {
      bestDist = d;
      best = v;
    }
    if (d < fallbackDist) {
      fallbackDist = d;
      fallback = v;
    }
  }
  return best ?? fallback;
}

function reactNear(location, dimension, line, range) {
  const villager = freeVillager(location, dimension, range);
  if (villager) return request(villager, line);
  return false;
}

function feel(villager, move, face, mark, ticks) {
  if (!alive(villager) || asleep(villager) || speaking.has(villager.id)) return;
  const span = ticks ?? 60;
  if (move) play(villager, move, REACT, "0", 0.3);
  reactUntil.set(villager.id, system.currentTick + span);
  if (face !== undefined) setFace(villager, face);
  emote(villager, mark);
  const id = villager.id;
  system.runTimeout(() => {
    const v = world.getEntity(id);
    if (!alive(v)) return;
    if (system.currentTick < (reactUntil.get(id) ?? 0)) return;
    if (move) play(v, "rest", REACT, "query.any_animation_finished", 0.3);
    if (!speaking.has(id) && !sessionOf.has(id)) setFace(v, 0);
  }, span);
}

function faceEachOther(a, b) {
  try {
    a.lookAt(b.getHeadLocation());
  } catch {}
  try {
    b.lookAt(a.getHeadLocation());
  } catch {}
}

function cry(villager, ticks) {
  if (!alive(villager)) return;
  const span = ticks ?? 100;
  if (isNoseless(villager) && chance(0.5)) later(villager, 20, (v) => request(v, 125));
  feel(villager, pick(CRIES), 4, "tear", span);
  setTalking(villager, true);
  for (let t = 12; t < span; t += 12) later(villager, t, (v) => emote(v, chance(0.8) ? "tear" : "gloom"));
  if (isBaby(villager)) sound(villager, "social.baby_cry", 0.97 + Math.random() * 0.06, 0.9);
  else for (let t = 10; t < span; t += 30) later(villager, t, (v) => sound(v, "mob.villager.no", 0.75, 0.45));
  later(villager, span, (v) => {
    if (!speaking.has(v.id) && !sessionOf.has(v.id)) setTalking(v, false);
  });
}

function faint(villager) {
  if (!alive(villager)) return;
  engage(villager, 70, true, undefined);
  feel(villager, "faint", 6, "dizzy", 70);
  for (let t = 24; t < 60; t += 14) later(villager, t, (v) => emote(v, "dizzy"));
  sound(villager, "mob.villager.hurt", pitchOf(villager) + 0.2, 0.5);
  later(villager, 72, (v) => feel(v, "dizzy_wobble", 6, "dizzy", 40));
}

function tantrum(baby, attacker) {
  const id = baby.id;
  const until = system.currentTick + 120;
  tantrums.set(id, until);
  silence(baby);
  leaveSession(id);
  engage(baby, 120, true, undefined);
  play(baby, "baby_cry_floor", TALK);
  reactUntil.set(id, until);
  setFace(baby, 4);
  setTalking(baby, true);
  emote(baby, "tear");
  for (let t = 8; t < 120; t += 10) later(baby, t, (v) => emote(v, chance(0.75) ? "tear" : "gloom"));
  sound(baby, "social.baby_cry", 0.97 + Math.random() * 0.06, 1);
  later(baby, 120, (v) => {
    if (tantrums.get(id) !== until) return;
    tantrums.delete(id);
    setTalking(v, false);
    setFace(v, 0);
    rest(v);
    disengage(v);
    later(v, 4, (again) => forceRequest(again, 101));
    later(v, 10 + (DURATION[101] ?? 60), (again) => scare(again, 120));
  });
  for (const adult of villagersNear(baby.location, baby.dimension, 10)) {
    if (adult.id === id || isBaby(adult) || asleep(adult) || speaking.has(adult.id)) continue;
    leaveSession(adult.id);
    later(adult, 4 + Math.random() * 10, (v) => {
      if (alive(attacker) && distance(attacker.location, v.location) <= GAZE_RANGE + 2) engage(v, 80, false, "player");
      if (traitOf(v) === "timid") {
        feel(v, "comfort_pat", 4, "heart", 80);
      } else {
        feel(v, pick(["glare", "angry_point", "angry_shake_fist"]), 1, "anger", 80);
        later(v, 25, (again) => emote(again, "anger"));
      }
    });
  }
}

function crowd(location, dimension, kind, player, skipId) {
  const style = CROWD[kind];
  let count = 0;
  const watchers = [];
  for (const v of villagersNear(location, dimension, 11)) {
    if (v.id === skipId || !free(v)) continue;
    if (++count > 6) break;
    watchers.push(v);
    const delay = 3 + Math.floor(Math.random() * 16) + count * 2;
    later(v, delay, (villager) => {
      if (!free(villager)) return;
      const trait = traitOf(villager);
      let move = pick(style.moves);
      let face = style.face;
      let marks = style.marks;
      if (kind === "shock" && trait === "cheerful") move = pick(["excited_jump", "stare_wow", "excited_cheer"]);
      if (kind === "shock" && trait === "grumpy") {
        move = "grumpy_eye_roll";
        face = 7;
        marks = ["question"];
      }
      if (kind === "scary" && trait === "brave") {
        move = "angry_shake_fist";
        face = 1;
        marks = ["anger"];
      }
      if (kind === "scary" && trait === "timid") {
        if (chance(0.3)) {
          faint(villager);
          return;
        }
        scare(villager, 120);
      }
      if (kind === "shock" && trait === "timid" && chance(0.25)) {
        faint(villager);
        return;
      }
      if (kind === "bad" && trait === "timid") {
        move = "nervous_shrink";
        face = 2;
        marks = ["sweat"];
      }
      if (player && alive(player) && distance(player.location, villager.location) <= GAZE_RANGE + 2) {
        engage(villager, 70, false, "player");
      }
      feel(villager, move, face, marks[0], 60);
      if (marks[1]) later(villager, 20, (again) => emote(again, marks[1]));
      if (kind === "shock" || kind === "money") later(villager, 36, (again) => emote(again, "sparkle"));
    });
  }
  if (player && watchers.length >= 2 && chance(0.4)) {
    const [a, b] = watchers;
    system.runTimeout(() => {
      const first = world.getEntity(a.id);
      const second = world.getEntity(b.id);
      if (alive(first) && alive(second) && free(first) && free(second) && distance(first.location, second.location) < 6) {
        startSession(first, second, undefined, player.id);
      }
    }, 80);
  }
}

function getReputation(player) {
  const value = player.getDynamicProperty("social_rep");
  return typeof value === "number" ? value : 0;
}

function changeReputation(player, amount) {
  player.setDynamicProperty("social_rep", Math.max(-40, Math.min(40, getReputation(player) + amount)));
}

function noteDeed(player, kind) {
  const state = playerState.get(player.id) ?? {};
  state.deed = { kind, at: system.currentTick };
  playerState.set(player.id, state);
}

function cooled(player, key, ticks) {
  const state = playerState.get(player.id) ?? {};
  state.cool = state.cool ?? {};
  const now = system.currentTick;
  if (now - (state.cool[key] ?? -99999) < ticks) return false;
  state.cool[key] = now;
  playerState.set(player.id, state);
  return true;
}

function hasProfession(villager) {
  if (isBaby(villager)) return false;
  try {
    const variant = villager.getComponent(EntityComponentTypes.Variant);
    if (variant) return variant.value > 0 && variant.value < 14;
  } catch {}
  try {
    const family = villager.getComponent(EntityComponentTypes.TypeFamily);
    if (!family) return true;
    for (const job of PROFESSIONS) {
      if (family.hasTypeFamily(job)) return true;
    }
    return false;
  } catch {
    return true;
  }
}

function isNoseless(villager) {
  if (prop(villager, "fmc:noseless", false) === true) return true;
  try {
    return villager.getDynamicProperty(NOSE_FLAG) === true;
  } catch {
    return false;
  }
}

function setNoseless(villager, value) {
  try {
    villager.setDynamicProperty(NOSE_FLAG, value === true ? true : undefined);
  } catch {}
  setProp(villager, "fmc:noseless", value === true);
}

function consumeHeld(player) {
  if (isCreative(player)) return;
  try {
    const gear = player.getComponent(EntityComponentTypes.Equippable);
    if (!gear) return;
    const item = gear.getEquipment("Mainhand");
    if (!item) return;
    if (item.amount > 1) {
      item.amount -= 1;
      gear.setEquipment("Mainhand", item);
    } else {
      gear.setEquipment("Mainhand", undefined);
    }
  } catch {}
}

function damageHeld(player) {
  if (isCreative(player)) return;
  try {
    const gear = player.getComponent(EntityComponentTypes.Equippable);
    if (!gear) return;
    const item = gear.getEquipment("Mainhand");
    if (!item) return;
    const wear = item.getComponent("minecraft:durability");
    if (!wear) return;
    if (wear.damage + 1 >= wear.maxDurability) {
      gear.setEquipment("Mainhand", undefined);
      return;
    }
    wear.damage += 1;
    gear.setEquipment("Mainhand", item);
  } catch {}
}

function shearNose(player, villager) {
  if (!alive(villager) || isNoseless(villager)) return;
  const spot = noseSpot(villager);
  const id = villager.id;

  leaveSession(id);
  silence(villager);
  play(villager, "nose_cut", TALK);
  setFace(villager, 6);
  emote(villager, "shock");
  burst(villager, "minecraft:critical_hit_emitter");
  sound(villager, "mob.sheep.shear");
  try {
    villager.dimension.spawnItem(new ItemStack(NOSE_ITEM, 1), spot);
  } catch {}

  later(villager, 3, (v) => setNoseless(v, true));

  damageHeld(player);
  changeReputation(player, -1);
  noteDeed(player, "bad");
  villagerBusy.set(id, system.currentTick + 16);
  crowd(villager.location, villager.dimension, "shock", player, id);

  later(villager, 16, (v) => forceRequest(v, 83));
  later(villager, 16 + DURATION[83] + 6, (v) => cry(v, 120));
  later(villager, 70, (v) => {
    if (!speaking.has(id)) {
      setFace(v, 0);
      rest(v);
    }
  });
}

function returnNose(player, villager) {
  if (!alive(villager)) return;
  if (isNoseless(villager)) {
    setNoseless(villager, false);
    consumeHeld(player);
    changeReputation(player, 2);
    noteDeed(player, "good");
    play(villager, "nose_back", REACT, "query.any_animation_finished", 0);
    burst(villager, "minecraft:villager_happy");
    emote(villager, "heart");
    later(villager, 16, (v) => emote(v, "sparkle"));
    sound(villager, "random.orb", 1, 0.6);
    sound(villager, "random.pop", 1.2, 0.8);
    forceRequest(villager, 84);
    crowd(villager.location, villager.dimension, "good", player, villager.id);
  } else {
    forceRequest(villager, 82);
  }
}

function countEmeralds(player) {
  try {
    const inv = player.getComponent(EntityComponentTypes.Inventory);
    if (!inv || !inv.container) return 0;
    let total = 0;
    for (let i = 0; i < inv.container.size; i++) {
      const item = inv.container.getItem(i);
      if (item && item.typeId === "minecraft:emerald") total += item.amount;
    }
    return total;
  } catch {
    return 0;
  }
}

function heldItem(player) {
  try {
    const gear = player.getComponent(EntityComponentTypes.Equippable);
    const item = gear ? gear.getEquipment("Mainhand") : undefined;
    return item ? item.typeId : "";
  } catch {
    return "";
  }
}

function pickArc(members, topicPlayer) {
  if (topicPlayer) {
    const player = world.getEntity(topicPlayer);
    const kind = playerState.get(topicPlayer)?.deed?.kind ?? "odd";
    if (alive(player)) return { steps: PLAYER_ARCS[kind] ?? PLAYER_ARCS.odd, player: topicPlayer };
  }
  const pool = [];
  for (const member of members) pool.push(...TRAIT_ARCS[traitOf(member)]);
  return { steps: ARCS[pick(pool)] };
}

function startSession(first, second, third, topicPlayer) {
  const members = [first, second];
  if (third) members.push(third);
  const arc = pickArc(members, topicPlayer);
  const id = ++sessionCounter;
  const session = { id, members: members.map((m) => m.id), step: 0, steps: arc.steps, player: arc.player, voiced: false };
  sessions.set(id, session);
  faceEachOther(first, second);
  if (third) third.lookAt?.(first.getHeadLocation());
  for (const member of members) {
    sessionOf.set(member.id, id);
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].villagerId === member.id) queue.splice(i, 1);
    }
    reactUntil.delete(member.id);
    engage(member, 2000, true, "villager");
  }
  system.runTimeout(() => nextStep(id), 6 + Math.floor(Math.random() * 10));
}

function endSession(id) {
  const session = sessions.get(id);
  if (!session) return;
  sessions.delete(id);
  for (const memberId of session.members) {
    if (sessionOf.get(memberId) !== id) continue;
    sessionOf.delete(memberId);
    villagerBusy.set(memberId, system.currentTick + 200);
    const v = world.getEntity(memberId);
    if (!alive(v)) {
      engaged.delete(memberId);
      continue;
    }
    if (speaking.has(memberId)) continue;
    setFace(v, 0);
    rest(v);
    play(v, "rest", IDLE, "query.any_animation_finished", 0.4);
    disengage(v);
    if (chance(0.5)) feel(v, "wave_goodbye", 3, "happy", 30);
  }
}

function leaveSession(villagerId) {
  const id = sessionOf.get(villagerId);
  if (id !== undefined) endSession(id);
}

function nextStep(id) {
  const session = sessions.get(id);
  if (!session) return;
  const members = session.members.map((m) => world.getEntity(m));
  for (const member of members) {
    if (!alive(member) || asleep(member) || isAfraid(member)) {
      endSession(id);
      return;
    }
  }
  if (distance(members[0].location, members[1].location) > 7) {
    endSession(id);
    return;
  }
  if (session.step >= session.steps.length) {
    endSession(id);
    return;
  }

  const step = session.steps[session.step];
  const speaker = members[session.step % 2];
  const listener = members[(session.step + 1) % 2];
  const extra = members[2];
  faceEachOther(speaker, listener);
  if (extra) {
    try {
      extra.lookAt(speaker.getHeadLocation());
    } catch {}
  }
  for (const member of members) play(member, pick(IDLE_LAYERS), IDLE);
  let span = 45 + Math.floor(Math.random() * 30);

  let voiced = false;
  if (!session.player && session.step === 0 && !session.voiced && chance(0.3)) {
    const near = nearestPlayer(speaker, HEAR_RANGE);
    if (near) {
      const opener = nearBlock(speaker, "campfire") ? 92 : 90;
      if (!staleFor(speaker, opener) && deliver(speaker, opener, { urgent: true, partner: true })) {
        voiced = true;
        session.voiced = opener;
        span = DURATION[opener] + SPEAK_GAP;
        play(listener, "listen_lean", TALK);
        setFace(listener, 6);
      }
    }
  } else if (session.step === 1 && session.voiced === 90) {
    const reply = staleFor(speaker, 91) || chance(0.4) ? 141 : 91;
    if (!staleFor(speaker, reply) && deliver(speaker, reply, { urgent: true, partner: true })) {
      voiced = true;
      span = DURATION[reply] + SPEAK_GAP;
      play(listener, "chat_explain", TALK);
      setTalking(listener, true);
      later(listener, span - 8, (v) => setTalking(v, false));
    }
  }

  if (!voiced) {
    play(speaker, step.s, TALK);
    play(listener, step.l, TALK);
    setFace(speaker, step.sf ?? 0);
    setFace(listener, step.lf ?? 0);
    setTalking(speaker, true);
    setTalking(listener, step.both === true);
    emote(speaker, step.se);
    later(speaker, Math.floor(span * 0.55), (v) => {
      if (sessions.has(id)) setTalking(v, false);
    });
    later(listener, Math.floor(span * 0.5), (v) => {
      if (!sessions.has(id)) return;
      emote(v, step.le);
      if (!step.both) {
        setTalking(v, true);
        later(v, Math.floor(span * 0.4), (again) => setTalking(again, false));
      }
    });
    if (step.laugh) {
      const near = nearestPlayer(speaker, 8);
      if (near) sound(speaker, "mob.villager.yes", 1.45, 0.25);
    }
    if (extra && alive(extra)) {
      play(extra, step.both ? step.l : pick(LISTEN), TALK);
      setFace(extra, step.lf ?? 0);
      later(extra, Math.floor(span * 0.6), (v) => {
        if (sessions.has(id)) emote(v, step.le ?? step.se);
      });
    }
    if (step.glance && session.player) {
      const player = world.getEntity(session.player);
      fire(speaker, "fmc:gaze_player");
      if (extra) fire(extra, "fmc:gaze_player");
      if (alive(player) && distance(player.location, speaker.location) <= 20 && !subtitles.has(player.id)) {
        caption(player, step.caption, 60);
      }
      later(speaker, span - 5, (v) => {
        if (sessionOf.has(v.id)) fire(v, "fmc:gaze_villager");
      });
    }
  }

  session.step++;
  system.runTimeout(() => nextStep(id), span);
}

function tryChat(villager, player, day) {
  if (sessions.size >= 6) return false;
  if (!free(villager)) return false;
  if (system.currentTick < (villagerBusy.get(villager.id) ?? 0)) return false;
  const night = day > 12500 && day < 23500;
  if (night && !nearBlock(villager, "campfire")) return false;
  const trait = traitOf(villager);
  const odds = 0.25 * (trait === "chatty" ? 2 : trait === "grumpy" ? 0.5 : trait === "timid" ? 0.7 : 1);
  if (!chance(odds)) return false;
  const friends = [];
  for (const other of villagersNear(villager.location, villager.dimension, 4.5)) {
    if (other.id === villager.id || !free(other)) continue;
    if (system.currentTick < (villagerBusy.get(other.id) ?? 0)) continue;
    friends.push(other);
    if (friends.length >= 2) break;
  }
  if (friends.length === 0) return false;
  const state = playerState.get(player.id);
  const fresh = state?.deed && system.currentTick - state.deed.at < 2400 && chance(0.7);
  startSession(villager, friends[0], friends[1] && chance(0.4) ? friends[1] : undefined, fresh ? player.id : undefined);
  return true;
}

function isRaining() {
  try {
    const weather = String(world.getDimension("minecraft:overworld").getWeather()).toLowerCase();
    return weather.includes("rain") || weather.includes("thunder");
  } catch {
    return false;
  }
}

function underSky(villager) {
  try {
    if (villager.dimension.id !== "minecraft:overworld") return false;
    const spot = villager.location;
    const top = villager.dimension.getTopmostBlock({ x: Math.floor(spot.x), z: Math.floor(spot.z) });
    return !top || top.location.y <= Math.floor(spot.y) + 1;
  } catch {
    return false;
  }
}

function markVariant(villager) {
  try {
    return villager.getComponent(EntityComponentTypes.MarkVariant)?.value ?? 0;
  } catch {
    return 0;
  }
}

function groupDance(leader, members, rounds) {
  const crew = [leader, ...members].filter((v) => alive(v));
  if (crew.length < 2) return false;
  const id = leader.id + ":" + system.currentTick;
  const steps = [];
  const pool = DANCES.slice();
  for (let i = 0; i < (rounds ?? 4); i++) steps.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  const span = steps.length * 60 + 40;
  for (const v of crew) {
    leaveSession(v.id);
    dancing.set(v.id, id);
    reactUntil.set(v.id, system.currentTick + span);
    engage(v, span, true, "villager");
    setFace(v, 3);
  }
  faceEachOther(leader, crew[1]);
  if (!request(leader, 104)) emote(leader, "music");
  sound(leader, "mob.villager.celebrate", pitchOf(leader), 0.8);
  steps.forEach((step, index) => {
    system.runTimeout(() => {
      for (const v of crew) {
        if (!alive(v) || dancing.get(v.id) !== id) continue;
        play(v, step, REACT, "0", 0.2);
        setTalking(v, chance(0.3));
        emote(v, pick(["music", "music", "happy", "sparkle"]));
      }
      const loud = crew.find((v) => alive(v) && dancing.get(v.id) === id && !speaking.has(v.id));
      if (loud && index > 0 && chance(0.5)) request(loud, pick([105, 106]));
    }, index * 60 + 5);
  });
  for (let t = 0; t < steps.length * 60; t += 10) {
    system.runTimeout(() => {
      if (!alive(leader) || dancing.get(leader.id) !== id) return;
      sound(leader, t % 20 === 0 ? "note.bd" : "note.hat", 1, 0.35);
      if (t % 40 === 0) sound(leader, "note.harp", pick([0.8, 1, 1.2, 1.35]), 0.35);
    }, t + 5);
  }
  system.runTimeout(() => {
    for (const v of crew) {
      if (!alive(v) || dancing.get(v.id) !== id) continue;
      play(v, pick(["victory", "happy_clap", "proud_bow"]), REACT, "0", 0.3);
      emote(v, "happy");
    }
  }, steps.length * 60 + 5);
  system.runTimeout(() => {
    for (const v of crew) {
      if (dancing.get(v.id) !== id) continue;
      dancing.delete(v.id);
      if (!alive(v)) continue;
      play(v, "rest", REACT, "query.any_animation_finished", 0.3);
      setTalking(v, false);
      if (!speaking.has(v.id)) setFace(v, 0);
      disengage(v);
    }
  }, span);
  return true;
}

function tryGroupDance(villager, day) {
  if (day > 12000 || !free(villager) || dancing.has(villager.id)) return false;
  if (!chance(0.035)) return false;
  const crew = villagersNear(villager.location, villager.dimension, 7).filter(
    (v) => v.id !== villager.id && free(v) && !dancing.has(v.id) && !isBaby(v)
  );
  if (crew.length < 2) return false;
  return groupDance(villager, crew.slice(0, 5), 3 + Math.floor(Math.random() * 3));
}

function mimicCrouch(player, down) {
  const list = mimics.get(player.id) ?? new Set();
  if (down) {
    for (const v of villagersNear(player.location, player.dimension, 5)) {
      if (!free(v) && !list.has(v.id)) continue;
      if (dancing.has(v.id)) continue;
      list.add(v.id);
      play(v, "crouch_pose", MIMIC, "0", 0.1);
    }
  } else {
    for (const vid of list) {
      const v = world.getEntity(vid);
      if (alive(v)) play(v, "rest", MIMIC, "query.any_animation_finished", 0.1);
    }
    list.clear();
  }
  mimics.set(player.id, list);
}

function faceAway(villager, player) {
  try {
    const spot = villager.location;
    villager.lookAt({ x: spot.x * 2 - player.location.x, y: spot.y + 1.5, z: spot.z * 2 - player.location.z });
  } catch {}
}

function twerkAt(villager, player) {
  engage(villager, 90, true, undefined);
  faceAway(villager, player);
  feel(villager, pick(TWERKS), 3, "music", 90);
  for (let t = 18; t < 90; t += 18) later(villager, t, (v) => emote(v, pick(["music", "laugh", "sparkle"])));
  sound(villager, "mob.villager.yes", pitchOf(villager) + 0.3, 0.5);
  for (const other of villagersNear(villager.location, villager.dimension, 7)) {
    if (other.id === villager.id || !free(other)) continue;
    later(other, 10 + Math.random() * 15, (v) => {
      faceEachOther(v, villager);
      feel(v, pick(["facepalm_quick", "point_laugh", "clap_slow", "disgust_turn", "belly_laugh"]), pick([3, 7, 6]), pick(["laugh", "question", "anger"]), 60);
    });
  }
  later(villager, 92, (v) => disengage(v));
}

function outing(villager, kind, target, span) {
  const id = villager.id;
  const token = system.currentTick;
  outings.set(id, token);
  reactUntil.set(id, system.currentTick + span + 90);
  fire(villager, kind === "stalk" ? "fmc:stalk_on" : "fmc:golem_on");
  if (kind === "stalk") {
    play(villager, pick(["sneak_walk", "sneak_tiptoe_crouch"]), MIMIC, "0", 0.2);
    setFace(villager, 7);
    emote(villager, "idea");
  } else {
    setFace(villager, 3);
    emote(villager, "heart");
    play(villager, "happy_skip", REACT, "0", 0.3);
  }
  let done = false;
  for (let t = 10; t <= span; t += 10) {
    later(villager, t, (v) => {
      if (done || outings.get(id) !== token) return;
      const goal = world.getEntity(target.id);
      const near = alive(goal) && distance(v.location, goal.location) <= (kind === "stalk" ? 2.2 : 3.5);
      if (!near && t < span) {
        if (kind === "stalk" && t % 40 === 0) emote(v, pick(["question", "idea"]));
        return;
      }
      done = true;
      fire(v, "fmc:seek_off");
      play(v, "rest", MIMIC, "query.any_animation_finished", 0.2);
      if (!alive(goal) || !near) {
        outings.delete(id);
        setFace(v, 0);
        disengage(v);
        return;
      }
      engage(v, 90, true, undefined);
      if (kind === "stalk") {
        faceEachOther(v, goal);
        feel(v, "sneak_freeze", 7, "idea", 14);
        later(v, 14, (again) => feel(again, "boo", 3, "chat", 30));
        later(goal, 20, (g) => {
          if (speaking.has(g.id) || asleep(g)) return;
          reactUntil.delete(g.id);
          feel(g, pick(["jump_scare", "surprised_jolt", "shock_freeze"]), 6, "shock", 50);
          later(g, 50, (again) => feel(again, pick(["sulk", "angry_huff", "belly_laugh"]), pick([7, 1, 3]), pick(["anger", "laugh"]), 50));
        });
        later(v, 44, (again) => feel(again, "point_laugh", 3, "laugh", 60));
      } else {
        try {
          v.lookAt(goal.getHeadLocation());
        } catch {}
        const move = pick(["golem_hug_dance", "golem_admire", "golem_hug_dance", "dance_salsa", "dance_penguin"]);
        feel(v, move, 3, "heart", 80);
        for (let d = 16; d < 80; d += 16) later(v, d, (again) => emote(again, pick(["heart", "music", "sparkle"])));
        later(v, 70, (again) => feel(again, "golem_bow", 3, "happy", 30));
      }
      later(v, 95, (again) => {
        outings.delete(id);
        setFace(again, 0);
        disengage(again);
      });
    });
  }
}

function sneeze(villager) {
  feel(villager, "sneeze", 6, undefined, 40);
  later(villager, 20, (v) => {
    sound(v, "mob.panda.sneeze", pitchOf(v) + 0.3, 0.8);
    burst(v, "minecraft:villager_happy");
    emote(v, "sweat");
    setFace(v, 5);
  });
  later(villager, 30, (v) => {
    if (chance(0.3)) {
      emote(v, "question");
      setFace(v, 6);
    }
  });
}

function hiccups(villager) {
  feel(villager, "hiccup", 6, undefined, 72);
  for (let t = 2; t < 72; t += 24) later(villager, t, (v) => sound(v, "random.pop", 1.8, 0.4));
}

function ambient(villager, day, raining) {
  if (!free(villager) || engaged.has(villager.id)) return;
  if (!chance(0.14)) return;
  const trait = traitOf(villager);
  const night = day > 12500 && day < 23500;

  if (isNoseless(villager) && chance(0.4)) {
    cry(villager, 80);
    return;
  }

  for (const other of villagersNear(villager.location, villager.dimension, 3)) {
    if (other.id === villager.id || !free(other)) continue;
    if (chance(0.35)) {
      faceEachOther(villager, other);
      for (const v of [villager, other]) {
        feel(v, pick(["chat_wave_hello", "salute", "happy_nod"]), 3, "happy", 40);
        setTalking(v, true);
        later(v, 20, (again) => setTalking(again, false));
      }
      return;
    }
    break;
  }

  const near = nearestPlayer(villager, 8);
  if (near && (trait === "cheerful" || trait === "brave") && chance(0.12)) {
    twerkAt(villager, near.player);
    return;
  }
  if (chance(0.1)) {
    const buddy = villagersNear(villager.location, villager.dimension, 9).find(
      (v) => v.id !== villager.id && free(v) && distance(v.location, villager.location) > 3
    );
    if (buddy) {
      outing(villager, "stalk", buddy, 160);
      return;
    }
  }
  if (chance(0.12)) {
    let golem;
    try {
      golem = villager.dimension.getEntities({ location: villager.location, maxDistance: 18, type: "minecraft:iron_golem" })[0];
    } catch {}
    if (golem) {
      outing(villager, "golem", golem, 200);
      return;
    }
  }
  if (chance(0.08)) {
    engage(villager, 110, true, undefined);
    feel(villager, pick(SITS), chance(0.4) ? 5 : 0, chance(0.5) ? "sleep" : undefined, 110);
    later(villager, 112, (v) => disengage(v));
    return;
  }
  if (chance(0.25)) {
    const still = pick(IDLE_STILL);
    feel(villager, still, still.startsWith("chill") ? 8 : chance(0.3) ? 3 : 0, undefined, 60);
    return;
  }

  const roll = Math.random();
  if (roll < 0.08) {
    sneeze(villager);
    return;
  }
  if (roll < 0.12) {
    hiccups(villager);
    return;
  }
  if (roll < 0.16) {
    feel(villager, "owl_head", 6, "question", 60);
    return;
  }

  if (raining && underSky(villager)) {
    feel(villager, pick(["cover_head", "sad_mope", "grumpy_eye_roll", "shiver_cold"]), chance(0.5) ? 4 : 7, "gloom", 60);
    return;
  }
  if (night) {
    if (trait === "timid") feel(villager, pick(["nervous_glance", "shiver_cold"]), 2, "sweat", 60);
    else feel(villager, pick(["sleepy_yawn", "stretch_back", "look_up_sky"]), 5, "sleep", 60);
    return;
  }
  if (hasProfession(villager) && nearBlock(villager, "workstation")) {
    feel(villager, pick(["happy_nod", "proud_puff", "think_hard", "scratch_head"]), chance(0.5) ? 3 : 0, chance(0.5) ? "idea" : undefined, 55);
    return;
  }
  if (trait === "cheerful") feel(villager, pick(DANCES.concat(["happy_sway", "idle_tiny_dance"])), 3, "music", 60);
  else if (trait === "grumpy") feel(villager, pick(["grumpy_eye_roll", "glare", "grumpy_tap"]), 7, chance(0.4) ? "anger" : undefined, 50);
  else if (trait === "timid") feel(villager, pick(["nervous_fidget", "nervous_glance", "tiptoe"]), 2, undefined, 50);
  else if (trait === "brave") feel(villager, pick(["proud_strut", "stretch_back", "salute"]), 3, undefined, 50);
  else feel(villager, pick(["curious_sniff", "curious_peek", "scratch_head", "look_up_sky", "think_hard"]), 0, "question", 50);
}

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target, itemStack } = event;
  if (!target || target.typeId !== VILLAGER) return;
  const held = itemStack ? itemStack.typeId : "";

  if (held.includes("shears") && !isNoseless(target)) {
    event.cancel = true;
    const villagerId = target.id;
    const playerId = player.id;
    system.run(() => {
      const v = world.getEntity(villagerId);
      const p = world.getEntity(playerId);
      if (v && p) shearNose(p, v);
    });
    return;
  }

  if (held === NOSE_ITEM) {
    event.cancel = true;
    const villagerId = target.id;
    const playerId = player.id;
    system.run(() => {
      const v = world.getEntity(villagerId);
      const p = world.getEntity(playerId);
      if (v && p) returnNose(p, v);
    });
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { player, block, brokenBlockPermutation } = event;
  const id = brokenBlockPermutation.type.id;
  const villager = freeVillager(block.location, player.dimension, REACT_RANGE);
  if (!villager) return;

  const state = playerState.get(player.id) ?? {};
  const now = system.currentTick;
  state.breaks = (state.breaks ?? []).filter((t) => now - t < 80);
  state.breaks.push(now);
  playerState.set(player.id, state);

  if (id.includes("bed")) {
    changeReputation(player, -2);
    noteDeed(player, "bad");
    request(villager, 13);
    crowd(block.location, player.dimension, "bad", player, villager.id);
  } else if (id.includes("bell")) {
    changeReputation(player, -2);
    noteDeed(player, "bad");
    request(villager, 14);
    crowd(block.location, player.dimension, "bad", player, villager.id);
  } else if (id.includes("door")) {
    noteDeed(player, "bad");
    request(villager, 12);
  } else if (state.breaks.length >= 5) {
    if (request(villager, 11) && cooled(player, "mess", 400)) crowd(block.location, player.dimension, "bad", player, villager.id);
  } else if (matchesAny(id, CROPS)) {
    noteDeed(player, "bad");
    request(villager, 139);
  } else if (matchesAny(id, WOOD)) {
    request(villager, 9);
  } else if (matchesAny(id, STONE)) {
    request(villager, 10);
  } else if (matchesAny(id, VALUABLE) || id.includes("_ore")) {
    request(villager, 16);
    if (cooled(player, "ore", 300)) crowd(block.location, player.dimension, "shock", player, villager.id);
  } else {
    request(villager, 8);
  }
});

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const { player, block } = event;
  const id = block.typeId;
  const villager = freeVillager(block.location, player.dimension, REACT_RANGE);
  if (!villager) return;

  if (id.includes("tnt")) {
    noteDeed(player, "bad");
    request(villager, 17);
    crowd(block.location, player.dimension, "scary", player, villager.id);
  } else if (matchesAny(id, VALUABLE)) {
    noteDeed(player, "odd");
    request(villager, 16);
    if (cooled(player, "valuable_place", 200)) crowd(block.location, player.dimension, "shock", player, villager.id);
  } else if (matchesAny(id, WORKSTATIONS)) {
    noteDeed(player, "good");
    request(villager, 19);
  } else if (id.includes("bed")) {
    noteDeed(player, "good");
    request(villager, 20);
  } else if (id.includes("jukebox")) request(villager, 21);
  else request(villager, 15);
});

function partyNear(location, dimension, ticks) {
  const crew = villagersNear(location, dimension, 12).filter((v) => free(v) && !dancing.has(v.id));
  if (crew.length >= 2 && groupDance(crew[0], crew.slice(1, 7), Math.max(2, Math.round(ticks / 60)))) return;
  for (const v of villagersNear(location, dimension, 12)) {
    if (!free(v)) continue;
    const delay = Math.floor(Math.random() * 12);
    later(v, delay, (villager) => {
      if (!free(villager)) return;
      feel(villager, pick(DANCES), 3, "music", ticks);
      for (let t = 25; t < ticks; t += 25) later(villager, t, (again) => emote(again, pick(["music", "music", "happy"])));
    });
  }
}

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { player, block, itemStack } = event;
  const id = block.typeId;
  const held = itemStack ? itemStack.typeId : "";

  if (id.includes("jukebox")) {
    if (held.includes("music_disc")) {
      noteDeed(player, "good");
      jukeboxParty(block, player.dimension);
    } else {
      const party = parties.get(partyKey(player.dimension, block.location));
      if (party) endParty(party);
    }
  }

  const villager = freeVillager(block.location, player.dimension, REACT_RANGE);
  if (!villager) return;
  if (id.includes("bell")) {
    request(villager, pick([86, 93]));
    if (cooled(player, "bell", 300)) bellGather(block.location, player.dimension, player);
  } else if (held.includes("flint_and_steel") && id.includes("tnt")) {
    noteDeed(player, "bad");
    request(villager, 18);
    crowd(block.location, player.dimension, "scary", player, villager.id);
  }
});

function partyKey(dimension, spot) {
  return dimension.id + ":" + Math.floor(spot.x) + "," + Math.floor(spot.y) + "," + Math.floor(spot.z);
}

function jukeboxState(party) {
  try {
    const block = party.dimension.getBlock(party.spot);
    if (!block || !block.typeId.includes("jukebox")) return false;
    const player = block.getComponent("minecraft:record_player");
    if (player && typeof player.isPlaying === "function") return player.isPlaying();
  } catch {
    return false;
  }
  return undefined;
}

function yawToward(from, to) {
  return (Math.atan2(-(to.x - from.x), to.z - from.z) * 180) / Math.PI;
}

function jukeboxParty(block, dimension) {
  const key = partyKey(dimension, block.location);
  if (parties.has(key)) return;
  const spot = { x: Math.floor(block.location.x), y: Math.floor(block.location.y), z: Math.floor(block.location.z) };
  const party = {
    key,
    dimension,
    spot,
    center: { x: spot.x + 0.5, y: spot.y, z: spot.z + 0.5 },
    guests: new Map(),
    start: system.currentTick,
    stage: "",
    moves: DANCES.slice().sort(() => Math.random() - 0.5)
  };
  let count = 0;
  for (const v of villagersNear(party.center, dimension, 16)) {
    if (asleep(v) || isAfraid(v) || speaking.has(v.id)) continue;
    if (++count > 10) break;
    leaveSession(v.id);
    disengage(v);
    party.guests.set(v.id, { arrived: false, invited: system.currentTick, angle: 0, radius: 3, circle: true });
    reactUntil.set(v.id, system.currentTick + 99999);
    later(v, Math.random() * 10, (villager) => {
      fire(villager, "fmc:jukebox_on");
      setFace(villager, 3);
      emote(villager, pick(["music", "alert", "happy"]));
      play(villager, "happy_skip", REACT, "0", 0.3);
    });
  }
  if (party.guests.size > 0) parties.set(key, party);
}

function endParty(party) {
  parties.delete(party.key);
  for (const id of party.guests.keys()) {
    reactUntil.delete(id);
    const v = world.getEntity(id);
    if (!alive(v)) continue;
    fire(v, "fmc:jukebox_off");
    disengage(v);
    setTalking(v, false);
    play(v, "rest", REACT, "query.any_animation_finished", 0.3);
    feel(v, pick(["victory", "proud_bow", "happy_clap", "bow_deep", "pant"]), 3, pick(["happy", "heart", "sparkle"]), 40);
  }
}

function stageOf(t) {
  const phase = t % 400;
  if (phase < 160) return "circle";
  if (phase < 320) return "inward:" + Math.floor((phase - 160) / 40);
  return "crouch";
}

system.runInterval(() => {
  if (parties.size === 0) return;
  const now = system.currentTick;
  for (const party of [...parties.values()]) {
    const t = now - party.start;
    if (t % 20 === 0) {
      const state = jukeboxState(party);
      if (state === false && t > 40) {
        endParty(party);
        continue;
      }
      if ((state === undefined && t > 3600) || t > 6000) {
        endParty(party);
        continue;
      }
    }
    const stage = stageOf(t);
    const fresh = stage !== party.stage;
    party.stage = stage;
    const round = Math.floor(t / 400);
    const move =
      stage === "circle"
        ? pick(["dance_circle_step", "dance_conga", "dance_hop"])
        : stage === "crouch"
          ? pick(CROUCH_DANCES)
          : party.moves[(round * 4 + Number(stage.split(":")[1])) % party.moves.length];

    for (const [id, guest] of party.guests) {
      const v = world.getEntity(id);
      if (!alive(v) || asleep(v) || isAfraid(v)) {
        party.guests.delete(id);
        reactUntil.delete(id);
        if (alive(v)) {
          fire(v, "fmc:jukebox_off");
          disengage(v);
        }
        continue;
      }
      const dist = distance(v.location, party.center);
      if (!guest.arrived) {
        if (dist <= 3.4 || now - guest.invited > 220) {
          guest.arrived = true;
          guest.circle = dist <= 4.5;
          guest.angle = Math.atan2(v.location.z - party.center.z, v.location.x - party.center.x);
          guest.radius = Math.max(2.3, Math.min(3.4, dist));
          fire(v, "fmc:jukebox_off");
          engage(v, 60, true, undefined);
          guest.anim = "";
        } else continue;
      }
      if (t % 20 === 0) engage(v, 60, true, undefined);

      if (stage === "circle" && guest.circle) {
        guest.angle += 0.05;
        const target = {
          x: party.center.x + Math.cos(guest.angle) * guest.radius,
          y: v.location.y,
          z: party.center.z + Math.sin(guest.angle) * guest.radius
        };
        let moved = false;
        try {
          moved = v.tryTeleport(target, { checkForBlocks: true, keepVelocity: false });
        } catch {}
        if (!moved) guest.radius = Math.max(1.8, guest.radius * 0.96);
        const ahead = {
          x: party.center.x + Math.cos(guest.angle + 0.3) * guest.radius,
          z: party.center.z + Math.sin(guest.angle + 0.3) * guest.radius
        };
        try {
          v.setRotation({ x: 0, y: yawToward(v.location, ahead) });
        } catch {}
      } else if (fresh) {
        try {
          v.setRotation({ x: 0, y: yawToward(v.location, party.center) });
        } catch {}
      }

      if (fresh || guest.anim === "") {
        let mine = move;
        if (stage === "crouch" && chance(0.25)) mine = pick(TWERKS);
        if (stage.startsWith("inward") && chance(0.15)) mine = "jukebox_admire";
        guest.anim = mine;
        play(v, mine, REACT, "0", 0.2);
        setFace(v, chance(0.15) ? pick([6, 8]) : 3);
        setTalking(v, chance(0.4));
      }
      if (chance(0.03)) emote(v, pick(["music", "music", "happy", "sparkle", "heart"]));
    }
    if (party.guests.size === 0) parties.delete(party.key);
  }
}, 2);

function bellGather(bell, dimension, player) {
  const center = { x: bell.x + 0.5, y: bell.y, z: bell.z + 0.5 };
  for (const v of villagersNear(center, dimension, BELL_RANGE)) {
    if (asleep(v) || isBaby(v) || isAfraid(v)) continue;
    leaveSession(v.id);
    if (speaking.has(v.id)) continue;
    disengage(v);
    const id = v.id;
    reactUntil.set(id, system.currentTick + 260);
    later(v, Math.random() * 10, (villager) => {
      fire(villager, "fmc:bell_on");
      setFace(villager, 6);
      emote(villager, "alert");
      play(villager, "stare_wow", REACT, "0", 0.3);
    });
    let arrived = false;
    for (let t = 10; t <= 120; t += 10) {
      later(v, t, (villager) => {
        if (arrived) return;
        if (distance(villager.location, center) <= 3.2 || t >= 120) {
          arrived = true;
          fire(villager, "fmc:bell_off");
          engage(villager, 80, true, chance(0.5) ? "player" : "villager");
          setFace(villager, 3);
          feel(villager, pick(DANCES), 3, "music", 70);
          reactUntil.set(id, system.currentTick + 70);
          for (let d = 20; d < 70; d += 20) later(villager, d, (again) => emote(again, pick(["music", "happy", "sparkle"])));
          later(villager, 72, (again) => {
            disengage(again);
            if (alive(player)) scare(again, 80);
            else flee(again, 60);
          });
        }
      });
    }
  }
}

function seesFire(villager) {
  const base = villager.location;
  for (let x = -4; x <= 4; x += 2) {
    for (let z = -4; z <= 4; z += 2) {
      for (let y = -1; y <= 2; y++) {
        try {
          const block = villager.dimension.getBlock({
            x: Math.floor(base.x) + x,
            y: Math.floor(base.y) + y,
            z: Math.floor(base.z) + z
          });
          if (block && matchesAny(block.typeId, HOT_BLOCKS) && !block.typeId.includes("campfire")) return true;
        } catch {}
      }
    }
  }
  return false;
}

world.afterEvents.itemUse.subscribe((event) => {
  const { source, itemStack } = event;
  if (!itemStack || source.typeId !== "minecraft:player") return;
  const id = itemStack.typeId;
  if (id.includes("firework")) {
    reactNear(source.location, source.dimension, 85, REACT_RANGE);
    if (cooled(source, "firework", 200)) partyNear(source.location, source.dimension, 80);
  } else if (id.includes("flint_and_steel")) reactNear(source.location, source.dimension, 18, REACT_RANGE);
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target, itemStack } = event;
  if (target.typeId !== VILLAGER) return;

  const held = itemStack ? itemStack.typeId : "";
  leaveSession(target.id);

  if (asleep(target)) {
    request(target, 63);
    return;
  }
  if (held !== "" && matchesAny(held, FOOD)) {
    changeReputation(player, 1);
    noteDeed(player, "good");
    emote(target, "heart");
    later(target, 14, (v) => emote(v, "happy"));
    request(target, 81);
    return;
  }
  if (isBaby(target)) {
    request(target, pick([96, 96, 99, 102]));
    return;
  }
  if (!hasProfession(target)) {
    let nitwit = false;
    try {
      nitwit = target.getComponent(EntityComponentTypes.Variant)?.value === 14;
    } catch {}
    request(target, nitwit ? pick([28, 95]) : pick([28, 94, 94]));
    return;
  }

  const count = (tradeState.get(target.id) ?? 0) + 1;
  tradeState.set(target.id, count);

  if (count === 15) request(target, 59);
  else if (count === 5) request(target, 58);
  else {
    const rep = getReputation(player);
    if (rep <= -20) request(target, 27);
    else if (rep < 0) request(target, 26);
    else if (rep >= 10) request(target, 25);
    else request(target, pick([22, 22, 117]));
  }

  const state = playerState.get(player.id) ?? {};
  state.tradeVillager = target.id;
  state.tradeTick = system.currentTick;
  state.tradeEmeralds = countEmeralds(player);
  playerState.set(player.id, state);
});

function hitLine(player, pool) {
  let best = pool[0];
  let oldest = Infinity;
  for (const line of pool) {
    const at = lastHeardAt(player, line);
    if (at < oldest) {
      oldest = at;
      best = line;
    }
  }
  if (system.currentTick - oldest < 60 && chance(0.5)) return undefined;
  return best;
}

world.afterEvents.entityHurt.subscribe((event) => {
  const { hurtEntity, damageSource } = event;

  if (hurtEntity.typeId === "minecraft:player") {
    if (damageSource.cause === "fall" && event.damage >= 2) {
      const witness = villagersNear(hurtEntity.location, hurtEntity.dimension, 8)[0];
      if (witness && cooled(hurtEntity, "fall_line", 600)) later(witness, 8, (v) => request(v, 138));
      for (const v of villagersNear(hurtEntity.location, hurtEntity.dimension, 10)) {
        if (!free(v) || !chance(0.6)) continue;
        later(v, 3 + Math.random() * 10, (villager) => {
          const kind = traitOf(villager) === "timid" ? "sweat" : "laugh";
          feel(villager, kind === "laugh" ? pick(["chat_laugh_big", "gossip_laugh", "belly_laugh"]) : "nervous_sweat", kind === "laugh" ? 3 : 2, kind, 50);
          if (kind === "laugh") sound(villager, "mob.villager.yes", 1.4, 0.5);
        });
      }
    }
    return;
  }
  if (hurtEntity.typeId !== VILLAGER) return;

  const cause = damageSource.cause;
  const attacker = damageSource.damagingEntity;
  const byPlayer = attacker?.typeId === "minecraft:player";

  leaveSession(hurtEntity.id);
  if (!asleep(hurtEntity)) {
    const hard = event.damage >= 4 || byPlayer;
    play(hurtEntity, hard ? "flinch_hard" : "flinch", REACT, "query.any_animation_finished", 0.1);
    disengage(hurtEntity);
  }

  if (byPlayer && isBaby(hurtEntity)) {
    changeReputation(attacker, -4);
    noteDeed(attacker, "bad");
    tantrum(hurtEntity, attacker);
    return;
  }

  if (byPlayer) {
    changeReputation(attacker, -3);
    noteDeed(attacker, "bad");
    scare(hurtEntity, 200);
    const health = hurtEntity.getComponent(EntityComponentTypes.Health);
    const low = health && health.currentValue <= health.effectiveMax * 0.4;
    const weapon = heldItem(attacker);
    const pool = low ? [49, 67, 45, 44] : weapon.includes("sword") ? [46, 45, 44, 8, 67] : [45, 44, 8, 67, 46];
    const line = hitLine(attacker, pool);
    if (line) {
      lastLineTick.set(hurtEntity.id + ":" + line, system.currentTick);
      speakNow(hurtEntity, line);
    } else {
      silence(hurtEntity);
      setFace(hurtEntity, low ? 2 : 1);
      emote(hurtEntity, low ? "sweat" : "anger");
      play(hurtEntity, low ? "scared_backstep" : pick(VARIANTS.angry), TALK);
      later(hurtEntity, 50, (v) => {
        if (!speaking.has(v.id)) {
          setFace(v, 0);
          rest(v);
        }
      });
    }
    for (const witness of villagersNear(hurtEntity.location, hurtEntity.dimension, 10)) {
      if (witness.id === hurtEntity.id || asleep(witness)) continue;
      leaveSession(witness.id);
      if (traitOf(witness) !== "brave") scare(witness, 140);
    }
    crowd(hurtEntity.location, hurtEntity.dimension, "scary", attacker, hurtEntity.id);
    return;
  }
  if (cause === "fall") {
    if (event.damage >= 2) feel(hurtEntity, "face_plant", 4, "dizzy", 50);
    request(hurtEntity, 47);
    return;
  }
  if (cause === "fire" || cause === "fireTick" || cause === "lava") {
    request(hurtEntity, 48);
    scare(hurtEntity, 120);
    return;
  }

  const health = hurtEntity.getComponent(EntityComponentTypes.Health);
  if (health && health.currentValue <= health.effectiveMax * 0.4) {
    request(hurtEntity, 49);
    scare(hurtEntity, 160);
    const state = villagerState.get(hurtEntity.id) ?? {};
    state.panicTick = system.currentTick;
    villagerState.set(hurtEntity.id, state);
    return;
  }
  request(hurtEntity, pick(HURT_LINES));
});

world.afterEvents.entityDie.subscribe((event) => {
  const dead = event.deadEntity;
  const killer = event.damageSource?.damagingEntity;

  if (dead.typeId !== VILLAGER) {
    if (killer?.typeId === "minecraft:player" && HOSTILE.some((h) => h.type === dead.typeId)) {
      let cheered = 0;
      for (const v of villagersNear(dead.location, dead.dimension, 14)) {
        if (!free(v) && !isAfraid(v)) continue;
        if (asleep(v) || speaking.has(v.id)) continue;
        const delay = 4 + Math.random() * 12;
        later(v, delay, (villager) => {
          feel(villager, pick(["excited_cheer", "excited_jump", "happy_clap", "chat_wave", "victory", "salute", "cheer_spin", "high_five"]), 3, "happy", 60);
          later(villager, 20, (again) => emote(again, "heart"));
        });
        if (++cheered >= 4) break;
      }
      if (cheered > 0) {
        changeReputation(killer, 1);
        noteDeed(killer, "hero");
      }
    }
    return;
  }

  if (isNoseless(dead)) {
    try {
      dead.dimension.spawnItem(new ItemStack(NOSE_ITEM, 1), dead.location);
    } catch {}
  }

  silence(dead);
  leaveSession(dead.id);
  for (const map of [villagerState, tradeState, villagerBusy, lastMove, afraidUntil, reactUntil, engaged, traits, pitches, fleeing, tantrums, fireSeen, dancing, swimming, outings]) {
    map.delete(dead.id);
  }

  for (const v of villagersNear(dead.location, dead.dimension, REACT_RANGE)) {
    if (v.id === dead.id) continue;
    if (request(v, 51)) break;
  }
  for (const v of villagersNear(dead.location, dead.dimension, 10)) {
    if (v.id === dead.id || !free(v)) continue;
    later(v, 6 + Math.random() * 14, (villager) => feel(villager, pick(["sad_mope", "sad_shake_head", "sad_sigh"]), 4, "gloom", 80));
  }
});

function settle(villager) {
  const id = villager.id;
  if (speaking.has(id) || sessionOf.has(id)) return;
  if (!engaged.has(id) && (prop(villager, "fmc:held", false) === true || prop(villager, "fmc:talking", false) === true)) {
    disengage(villager);
  }
  if (system.currentTick >= (reactUntil.get(id) ?? 0)) setFace(villager, 0);
  if (prop(villager, "fmc:afraid", false) === true && !isAfraid(villager)) setProp(villager, "fmc:afraid", false);
  try {
    if (villager.getDynamicProperty(NOSE_FLAG) === true) setProp(villager, "fmc:noseless", true);
  } catch {}
}

world.afterEvents.entityLoad.subscribe((event) => {
  const entity = event.entity;
  if (!alive(entity) || entity.typeId !== VILLAGER) return;
  settle(entity);
});

world.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (!alive(entity)) return;
  const id = entity.typeId;
  if (id === "minecraft:lightning_bolt") {
    reactNear(entity.location, entity.dimension, 70, HEAR_RANGE);
    crowd(entity.location, entity.dimension, "scary", undefined, undefined);
  } else if (id.includes("tnt")) {
    reactNear(entity.location, entity.dimension, 18, HEAR_RANGE);
    crowd(entity.location, entity.dimension, "scary", undefined, undefined);
  }
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const state = playerState.get(player.id) ?? {};
    const villager = freeVillager(player.location, player.dimension, REACT_RANGE);

    if (state.tradeVillager && system.currentTick - (state.tradeTick ?? 0) > 120) {
      const target = world.getEntity(state.tradeVillager);
      if (alive(target)) {
        const paid = countEmeralds(player) !== (state.tradeEmeralds ?? 0);
        if (paid) {
          noteDeed(player, "good");
          emote(target, "emerald");
          later(target, 14, (v) => emote(v, "happy"));
          if (cooled(player, "trade_crowd", 600)) crowd(target.location, target.dimension, "money", player, target.id);
        }
        request(target, paid ? 23 : 24);
      }
      state.tradeVillager = undefined;
    }

    if (!villager) {
      state.stareTicks = 0;
      state.stillTicks = 0;
      state.away = (state.away ?? 0) + 20;
      playerState.set(player.id, state);
      continue;
    }

    if (!state.lastSeen || (state.away ?? 0) > 200) {
      const rep = getReputation(player);
      if (isBaby(villager)) request(villager, 99);
      else if (player.getEffect("village_hero")) {
        request(villager, 68);
        crowd(player.location, player.dimension, "good", player, villager.id);
      }
      else if (rep >= 25) request(villager, 65);
      else if (rep >= 10) request(villager, 64);
      else if (rep <= -20) request(villager, 67);
      else if (rep < 0) request(villager, 66);
      else request(villager, pick([1, 2]));
      if (rep >= 10) crowd(player.location, player.dimension, "good", player, villager.id);
      state.lastSeen = system.currentTick;
      state.away = 0;
      playerState.set(player.id, state);
      continue;
    }
    state.lastSeen = system.currentTick;
    state.away = 0;

    const held = heldItem(player);
    if (held !== "" && held !== state.lastHeld) {
      state.lastHeld = held;
      if (held.includes("tnt")) {
        request(villager, 17);
        if (cooled(player, "tnt_hold", 400)) crowd(player.location, player.dimension, "scary", player, villager.id);
      } else if (matchesAny(held, VALUABLE) || matchesAny(held, VALUABLE_ITEMS)) {
        request(villager, held.includes("diamond") ? pick([16, 121, 121]) : 16);
        if (cooled(player, "valuable_" + held, 900)) {
          noteDeed(player, "odd");
          crowd(player.location, player.dimension, "shock", player, villager.id);
        }
      } else if (matchesAny(held, WORKSTATIONS)) request(villager, 19);
      else if (held.includes("bed")) request(villager, 20);
      else if (held.includes("jukebox")) request(villager, 21);
      else if (held.includes("sword") || held.includes("axe")) {
        if (held.includes("sword") && isBaby(villager) && distance(villager.location, player.location) < TALK_RANGE && cooled(player, "sword_kid", 1200)) request(villager, 100);
        if (getReputation(player) < 0 && cooled(player, "weapon", 600)) crowd(player.location, player.dimension, "scary", player, undefined);
      }
    } else if (held === "") {
      state.lastHeld = "";
    }

    const loc = player.location;
    if (state.prev && Math.abs(loc.x - state.prev.x) < 0.05 && Math.abs(loc.z - state.prev.z) < 0.05) {
      state.stillTicks = (state.stillTicks ?? 0) + 20;
      if (state.stillTicks >= 300) {
        request(villager, 5);
        state.stillTicks = 0;
      }
    } else {
      state.stillTicks = 0;
      if (player.isSneaking && chance(0.2)) {
        if (request(villager, 7)) emote(villager, "question");
        else if (free(villager) && distance(villager.location, loc) < 5 && chance(0.4)) feel(villager, "tiptoe", 0, "question", 60);
      }
    }
    state.prev = { x: loc.x, y: loc.y, z: loc.z };

    const view = player.getViewDirection();
    const dx = villager.location.x - loc.x;
    const dz = villager.location.z - loc.z;
    const len = Math.hypot(dx, dz);
    if (len > 0.1 && len < 7) {
      const dot = (view.x * dx + view.z * dz) / len;
      if (dot > 0.96) {
        state.stareTicks = (state.stareTicks ?? 0) + 20;
        if (state.stareTicks >= 200) {
          request(villager, pick([3, 4]));
          state.stareTicks = 0;
        }
      } else {
        state.stareTicks = 0;
      }
    } else {
      state.stareTicks = 0;
    }

    if (chance(0.25) && player.dimension.getPlayers({ location: loc, maxDistance: 8 }).length >= 3) {
      request(villager, 6);
    }
    if (chance(0.25) && player.getEffect("invisibility")) request(villager, 77);

    let flying = false;
    try {
      flying = player.isFlying === true;
    } catch {}
    if (!flying && isCreative(player)) {
      try {
        flying = !player.isOnGround && !player.isInWater;
      } catch {}
    }
    if (flying && chance(0.2)) {
      if (request(villager, 76) && cooled(player, "fly", 600)) crowd(player.location, player.dimension, "shock", player, villager.id);
    }

    const health = player.getComponent(EntityComponentTypes.Health);
    if (health && health.currentValue <= 6 && chance(0.25)) request(villager, 80);

    if (chance(0.15)) {
      const gear = player.getComponent(EntityComponentTypes.Equippable);
      if (gear) {
        const worn = [];
        for (const slot of ["Head", "Chest", "Legs", "Feet"]) {
          try {
            const item = gear.getEquipment(slot);
            if (item) worn.push(item.typeId);
          } catch {}
        }
        if (worn.length === 4) {
          const materials = new Set(worn.map((w) => w.replace("minecraft:", "").split("_")[0]));
          if (materials.size > 1) request(villager, 79);
          else if (worn[0].includes("diamond") || worn[0].includes("netherite") || worn[0].includes("iron")) {
            if (request(villager, 78) && !worn[0].includes("iron") && cooled(player, "armor", 1200)) {
              crowd(player.location, player.dimension, "shock", player, villager.id);
            }
          }
        }
      }
    }

    playerState.set(player.id, state);
  }
}, 20);

system.runInterval(() => {
  const now = system.currentTick;
  for (const player of world.getAllPlayers()) {
    const state = playerState.get(player.id) ?? {};
    const sneaking = player.isSneaking === true;
    if (sneaking !== state.wasSneaking) {
      state.wasSneaking = sneaking;
      mimicCrouch(player, sneaking);
      state.toggles = (state.toggles ?? []).filter((t) => now - t < 60);
      state.toggles.push(now);
      if (state.toggles.length >= 8 && now - (state.lastParty ?? -9999) > 400) {
        state.lastParty = now;
        state.toggles = [];
        const crew = villagersNear(player.location, player.dimension, 8).filter((v) => free(v) || (mimics.get(player.id)?.has(v.id) ?? false));
        mimicCrouch(player, false);
        if (crew.length > 0) {
          const leader = crew[0];
          emote(leader, "music");
          for (const v of crew) {
            feel(v, pick(CROUCH_DANCES.concat(["twerk", "twerk_fast"])), 3, "music", 90);
            for (let t = 20; t < 90; t += 20) later(v, t, (again) => emote(again, "music"));
          }
        }
      }
      playerState.set(player.id, state);
    }
    if (sneaking) {
      const loc = player.location;
      const prev = state.sneakSpot;
      if (prev && Math.hypot(loc.x - prev.x, loc.z - prev.z) > 0.15) {
        state.sneakWalk = (state.sneakWalk ?? 0) + 1;
        if (state.sneakWalk === 30) {
          const buddy = villagersNear(loc, player.dimension, 5).find((v) => mimics.get(player.id)?.has(v.id));
          if (buddy && !request(buddy, 107)) emote(buddy, "question");
        }
      }
      state.sneakSpot = { x: loc.x, z: loc.z };
      if (now % 20 === 0) mimicCrouch(player, true);
    } else {
      state.sneakWalk = 0;
      state.sneakSpot = undefined;
    }
  }
}, 2);

system.runInterval(() => {
  const seen = new Set();
  for (const player of world.getAllPlayers()) {
    for (const villager of villagersNear(player.location, player.dimension, 32)) {
      if (seen.has(villager.id)) continue;
      seen.add(villager.id);
      let wet = false;
      try {
        wet = villager.isInWater === true;
      } catch {}
      const current = swimming.get(villager.id);
      if (wet) {
        const style = isAfraid(villager) ? "swim_panic" : current ?? pick(["swim_paddle", "swim_doggy", "swim_paddle", "swim_float"]);
        if (style !== current) {
          swimming.set(villager.id, style);
          play(villager, style, SWIM, "0", 0.3);
          if (style === "swim_panic") {
            setFace(villager, 2);
            emote(villager, "sweat");
          }
        } else if (chance(0.05)) {
          emote(villager, style === "swim_panic" ? "sweat" : pick(["happy", "music"]));
        }
      } else if (current) {
        swimming.delete(villager.id);
        play(villager, "rest", SWIM, "query.any_animation_finished", 0.3);
        if (!speaking.has(villager.id) && !fleeing.has(villager.id)) feel(villager, pick(["wipe_sweat", "relief_sigh", "pant"]), 0, "sweat", 40);
      }
    }
  }
}, 10);

system.runInterval(() => {
  const seen = new Set();
  for (const player of world.getAllPlayers()) {
    for (const villager of villagersNear(player.location, player.dimension, 24)) {
      if (seen.has(villager.id)) continue;
      seen.add(villager.id);
      if (asleep(villager)) {
        try {
          villager.dimension.spawnParticle("fmc:emote_sleep", headSpot(villager, 1.1));
        } catch {}
      } else if (isAfraid(villager) && chance(0.4)) {
        emote(villager, "sweat");
      }
    }
  }
}, 30);

system.runInterval(() => {
  const time = world.getTimeOfDay();

  if (lastWorldTime !== 0) {
    const jump = Math.abs(time - lastWorldTime);
    if (jump > 2000 && jump < 22000) {
      const line = time > 0 && time < 12000 ? 74 : 75;
      for (const player of world.getAllPlayers()) {
        reactNear(player.location, player.dimension, line, HEAR_RANGE);
      }
    }
  }
  lastWorldTime = time;

  const raining = isRaining();
  if (raining && !lastRaining) {
    for (const player of world.getAllPlayers()) {
      reactNear(player.location, player.dimension, 69, HEAR_RANGE);
    }
  }
  lastRaining = raining;

  const handled = new Set();
  const day = time % 24000;

  for (const player of world.getAllPlayers()) {
    for (const villager of villagersNear(player.location, player.dimension, WATCH_RANGE)) {
      if (!alive(villager) || handled.has(villager.id)) continue;
      handled.add(villager.id);
      settle(villager);

      if (distance(villager.location, player.location) > HEAR_RANGE) {
        if (!asleep(villager) && seesFire(villager) && system.currentTick - (fireSeen.get(villager.id) ?? -9999) > 200) {
          fireSeen.set(villager.id, system.currentTick);
          scare(villager, 140);
          continue;
        }
        if (!tryChat(villager, player, day)) ambient(villager, day, raining);
        continue;
      }

      const state = villagerState.get(villager.id) ?? {};
      const now = system.currentTick;
      const sleeping = asleep(villager);

      if (sleeping && !state.sleeping) request(villager, pick([60, 142]));
      else if (sleeping && chance(0.12)) request(villager, pick([61, 109]));
      else if (!sleeping && state.sleeping) request(villager, 62);
      state.sleeping = sleeping;

      if (sleeping) {
        villagerState.set(villager.id, state);
        continue;
      }

      if (state.panicTick && now - state.panicTick > 160) {
        request(villager, 50);
        state.panicTick = undefined;
      }

      const employed = hasProfession(villager);
      if (state.employed === false && employed) request(villager, 52);
      state.employed = employed;

      let vehicle = "";
      try {
        const riding = villager.getComponent(EntityComponentTypes.Riding);
        if (riding && riding.entityRidingOn) vehicle = riding.entityRidingOn.typeId;
      } catch {}

      if (vehicle !== "") {
        if (vehicle !== state.vehicle) {
          state.vehicle = vehicle;
          if (vehicle.includes("boat")) request(villager, pick([87, 130]));
          else if (vehicle.includes("minecart")) request(villager, 89);
        } else if (vehicle.includes("boat") && chance(0.3)) {
          try {
            const mount = villager.getComponent(EntityComponentTypes.Riding).entityRidingOn;
            if (mount && mount.isOnGround) request(villager, 88);
          } catch {}
        }
        villagerState.set(villager.id, state);
        continue;
      }
      state.vehicle = "";

      let spoke = false;
      if (seesFire(villager)) {
        const last = fireSeen.get(villager.id) ?? -9999;
        if (now - last > 200) {
          fireSeen.set(villager.id, now);
          leaveSession(villager.id);
          if (!request(villager, 18)) request(villager, 48);
          scare(villager, 140);
          crowd(villager.location, villager.dimension, "scary", undefined, villager.id);
        }
        villagerState.set(villager.id, state);
        continue;
      }

      let mobs = [];
      try {
        mobs = villager.dimension.getEntities({ location: villager.location, maxDistance: 10 });
      } catch {}

      for (const entry of HOSTILE) {
        const threat = mobs.find((m) => alive(m) && m.typeId === entry.type);
        if (!threat) continue;
        leaveSession(villager.id);
        const trait = traitOf(villager);
        if (trait === "timid") scare(villager, 100);
        spoke = request(villager, entry.line === 30 ? pick([30, 134]) : entry.line);
        if (!spoke && !speaking.has(villager.id)) {
          if (trait === "brave") feel(villager, "angry_shake_fist", 1, "anger", 40);
          else feel(villager, pick(VARIANTS.scared), 2, pick(["alert", "shock", "sweat"]), 40);
        }
        spoke = true;
        break;
      }

      if (!spoke && chance(0.6)) {
        for (const entry of FRIENDLY) {
          const match = mobs.find((m) => alive(m) && m.typeId === entry.type);
          if (!match) continue;
          if (entry.type === "minecraft:sheep") {
            let sheared = false;
            try {
              sheared = match.getComponent(EntityComponentTypes.IsSheared) !== undefined;
            } catch {}
            spoke = request(villager, sheared ? 39 : 38);
          } else {
            spoke = request(villager, entry.line);
          }
          if (spoke) break;
        }
      }

      if (!spoke && isBaby(villager)) {
        if (day > 12500 && day < 23000) spoke = chance(0.3) && request(villager, 103);
        else if (chance(0.3)) spoke = request(villager, pick(KID_IDLE));
      }

      if (!spoke) spoke = tryGroupDance(villager, day);
      if (!spoke) spoke = tryChat(villager, player, day);

      if (!spoke && employed && nearBlock(villager, "workstation")) spoke = request(villager, pick([53, 128]));

      if (!spoke) {
        if (day > 12500 && day < 13300) spoke = request(villager, 110);
        if (!spoke && day > 12500 && !hasBedNear(villager)) spoke = request(villager, pick([55, 131]));
        else if (!spoke && day > 12500) spoke = request(villager, pick([54, 73]));
        else if (!spoke && day < 2000) spoke = request(villager, 71);
        else if (!spoke && day > 10500 && day < 12500) spoke = request(villager, 72);
        else if (!spoke && day > 3000 && day < 10000 && [1, 3].includes(markVariant(villager)) && chance(0.2)) {
          spoke = request(villager, 113);
        }
      }

      if (!spoke && chance(0.3)) {
        let nitwit = false;
        try {
          nitwit = villager.getComponent(EntityComponentTypes.Variant)?.value === 14;
        } catch {}
        const pool = chance(0.3) ? IDLE_FUNNY : employed ? WORK_IDLE : nitwit ? [95, 57] : JOBLESS_IDLE;
        spoke = request(villager, pick(pool));
      }

      if (!spoke) ambient(villager, day, raining);

      villagerState.set(villager.id, state);
    }
  }
}, 100);

function nearBlock(villager, kind) {
  const base = villager.location;
  for (let x = -3; x <= 3; x += 3) {
    for (let z = -3; z <= 3; z += 3) {
      for (let y = -1; y <= 1; y++) {
        try {
          const block = villager.dimension.getBlock({
            x: Math.floor(base.x) + x,
            y: Math.floor(base.y) + y,
            z: Math.floor(base.z) + z
          });
          if (!block) continue;
          if (kind === "campfire" && block.typeId.includes("campfire")) return true;
          if (kind === "workstation" && matchesAny(block.typeId, WORKSTATIONS)) return true;
        } catch {}
      }
    }
  }
  return false;
}

function hasBedNear(villager) {
  const base = villager.location;
  for (let x = -6; x <= 6; x += 3) {
    for (let z = -6; z <= 6; z += 3) {
      try {
        const block = villager.dimension.getBlock({
          x: Math.floor(base.x) + x,
          y: Math.floor(base.y),
          z: Math.floor(base.z) + z
        });
        if (block && block.typeId.includes("bed")) return true;
      } catch {}
    }
  }
  return false;
}

world.afterEvents.playerLeave.subscribe((event) => {
  playerState.delete(event.playerId);
  subtitles.delete(event.playerId);
  heard.delete(event.playerId);
});
