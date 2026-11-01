// The station screens (port of UpgraderScreen), drawn by the custom JSON UI in UpgraderRP/ui.
//
// Each screen is a server form whose title starts with "upgrader:". The resource pack hides the
// standard form for those titles and draws the mod's screen instead; every slot, text and wheel
// picture on it is fed by one form button (index from layout.js), and clicking a slot or button of
// the screen answers the form with that index.
//
//   upgrader:station        the station: cards, wheel, UPGRADE, presets, Amount, your inventory
//   upgrader:station:spin   the same while the wheel spins (frames played by the screen itself)
//   upgrader:catalog        the item picker: search box, 14 x 9 grid, rows
//
// Every button carries an icon: pictures that show nothing get GUI/none (an empty slot is
// recognised by it), and a StyledButton's text names its hover picture.

import { system } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";
import { CONFIG } from "./config.js";
import { LAYOUT } from "./layout.js";
import {
  PRESETS,
  applyPreset,
  catalogValue,
  clampCount,
  displayState,
  finishUpgrade,
  inputStack,
  inventoryOf,
  maxStackSize,
  sessionOf,
  setCount,
  setInput,
  setInputAmount,
  setTarget,
  startUpgrade,
  translationKey,
} from "./menu.js";
import { needleAngle, RESULT_FLASH_TICKS, spinClock, START_DELAY } from "./spin.js";
import { formatPercent, formatValue, raw, tr } from "./text.js";
import { canStake, catalog, chance, itemInfo, rarityOf, stackValue } from "./values.js";
import { isPotionKey, keyOf, potionName } from "./potions.js";

const S = LAYOUT.station;
const C = LAYOUT.catalog;
const GUI = LAYOUT.gui;
const TITLE = { station: "upgrader:station", spin: "upgrader:station:spin", catalog: "upgrader:catalog" };
const RARITY_COLOR = { u: "§e", r: "§b", e: "§d" };
const GRID = C.cols * C.rows;
const NONE = GUI + "/none";

const iconOf = (id) => itemInfo(id).icon || GUI + "/unknown";
const nameOf = (id, key) => {
  if (isPotionKey(id)) return potionName(id); // the bottle alone does not say which potion it is
  const k = key ?? translationKey(id);
  return k ? { translate: k } : { text: itemInfo(id).name };
};
const coloredName = (id, key) => raw(RARITY_COLOR[rarityOf(id)] ?? "§f", nameOf(id, key));
const countText = (amount) => (amount > 1 ? String(amount) : "");
const click = (player, pitch = 1.0) => {
  try {
    player.playSound("random.click", { volume: 0.35, pitch });
  } catch {
    // ignore
  }
};

const blank = () => ({ text: "", icon: NONE });

/** Form buttons of one screen: entry i = { text, icon }; built in index order. */
class Entries {
  constructor(count) {
    this.list = Array.from({ length: count }, blank);
    this.actions = new Map();
  }

  set(index, text, icon, action) {
    this.list[index] = { text: text ?? "", icon: icon || NONE };
    if (action) this.actions.set(index, action);
  }

  /** A StyledButton: background picture, hover picture (sent as the text) and its action. */
  styled(index, active, on, hover, off, action) {
    this.set(index, active ? hover : off, active ? on : off, action);
  }

  form(title) {
    const form = new ActionFormData().title(title);
    for (const { text, icon } of this.list) form.button(text, icon);
    return form;
  }
}

/**
 * Shows a form, trying again while the player is busy (chat open, the previous form still closing).
 * `form` may be a function building the form, called on every try; onSend runs before each try.
 */
export async function show(player, form, onSend) {
  for (let tries = 0; tries < 150; tries++) {
    if (!player.isValid) return undefined;
    const built = typeof form === "function" ? form() : form;
    onSend?.();
    let response;
    try {
      response = await built.show(player);
    } catch {
      return undefined;
    }
    if (response.canceled && response.cancelationReason === FormCancelationReason.UserBusy) {
      await system.waitTicks(2);
      continue;
    }
    return response;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Station
// ---------------------------------------------------------------------------

function zoneTexture(shown) {
  const sweep = Math.max(shown * 360, 1.2); // the mod never draws less than 1.2 degrees
  return GUI + "/zone/" + (sweep < 1.5 ? "zmin" : "z" + Math.min(360, Math.round(sweep)));
}

function needleTexture(angle) {
  return GUI + "/needle/n" + (((Math.round(angle) % 360) + 360) % 360);
}

function percentBucket(shown) {
  const t = Math.min(1, Math.sqrt(Math.max(0, shown)));
  return Math.min(LAYOUT.percentBuckets - 1, Math.floor(t * LAYOUT.percentBuckets));
}

function barTexture(count, max) {
  if (max <= 1) return GUI + "/bar/track";
  return GUI + "/bar/b" + Math.round((LAYOUT.barWidth * (count - 1)) / (max - 1));
}

/** Count picked by clicking zone j of a bar (clickAmount in the mod). */
function zoneCount(j, max) {
  const t = Math.min(1, Math.max(0, (3 * j + 1.5) / LAYOUT.barWidth));
  return 1 + Math.round(t * (max - 1));
}

function amountControls(player, e, prefix, count, max, onChange) {
  e.set(S[prefix + "Label"], tr("upgrader.gui.amount"));
  e.set(S[prefix + "Minus"], "-", GUI + (count > 1 ? "/mini_minus_on" : "/mini_minus_off"), () => onChange(count - 1));
  e.set(S[prefix + "Plus"], "+", GUI + (count < max ? "/mini_plus_on" : "/mini_plus_off"), () => onChange(count + 1));
  // clicking the number opens a slider: it can be dragged without reloading the station
  e.set(S[prefix + "Count"], String(count), undefined, () => (max > 1 ? openAmountSlider(player, count, max, onChange) : openStation(player)));
  e.set(S[prefix + "Bar"], "", barTexture(count, max));
  if (max > 1) {
    for (let j = 0; j < LAYOUT.barZones; j++) e.set(S[prefix + "Zones"] + j, "", NONE, () => onChange(zoneCount(j, max)));
  }
}

/** Slider dialog for an amount; onChange(value) applies it and shows the station again. */
async function openAmountSlider(player, count, max, onChange) {
  const form = new ModalFormData()
    .title(tr("upgrader.gui.amount"))
    .slider(tr("upgrader.gui.amount"), 1, max, { valueStep: 1, defaultValue: Math.max(1, Math.min(max, count)) })
    .submitButton(tr("upgrader.gui.done"));
  const response = await show(player, form);
  if (!response) return;
  const value = Number(response.formValues?.[0]);
  if (response.canceled || !Number.isFinite(value)) return openStation(player);
  onChange(Math.round(value));
}

/**
 * Everything the station shows. `spin` (from startUpgrade) is set while the wheel turns:
 * then the input card shows what was put in and the wheel is left to the frames.
 */
function stationEntries(player, session, spin) {
  const e = new Entries(S.count);
  const state = displayState(player, session);
  const stack = spin ? undefined : inputStack(player, session);
  const input = spin ? spin.input : stack ? { typeId: keyOf(stack), amount: session.inputAmount, key: stack.localizationKey } : undefined;
  const ready = !spin;

  // UPGRADE + presets
  const upgradeText = state.cooldown > 0 ? tr("upgrader.gui.cooldown", String(state.cooldown)) : tr("upgrader.gui.upgrade");
  const canUpgrade = ready && state.cooldown <= 0 && input && session.target;
  e.styled(S.upgradeBg, canUpgrade, GUI + "/upgrade_on", GUI + "/upgrade_hover", GUI + "/upgrade_off",
    canUpgrade ? () => upgrade(player) : () => openStation(player));
  e.set(S.upgradeChevron, "", GUI + (canUpgrade ? "/chevron_on" : "/chevron_off"));
  e.set(canUpgrade ? S.upgradeLabelOn : S.upgradeLabelOff, upgradeText);
  const presetsOn = ready && state.inputValue > 0;
  PRESETS.forEach((preset, k) => {
    const pick = () => {
      if (applyPreset(player, session, preset)) click(player);
      openStation(player);
    };
    e.styled(S.presetBg + k, presetsOn, GUI + "/chip_on", GUI + "/chip_hover", GUI + "/chip_off", presetsOn ? pick : () => openStation(player));
    e.set((presetsOn ? S.presetLabelOn : S.presetLabelOff) + k, preset.label);
  });

  // input card (while the wheel turns, the spin frames draw what sits in the slot)
  if (input && !spin) {
    e.set(S.inputSlot, coloredName(input.typeId, input.key), iconOf(input.typeId), () => {
      setInput(session, 0, undefined); // take it back out
      openStation(player);
    });
    e.set(S.inputCount, countText(input.amount));
  } else {
    e.set(S.inputSlot, "", undefined, () => openStation(player));
  }
  if (input) {
    e.set(S.leftValue, tr("upgrader.gui.value", formatValue(spin ? spin.inputValue : state.inputValue)));
  } else {
    e.set(S.leftHint, tr("upgrader.gui.pick_input"));
    e.set(S.leftHint + 1, tr("upgrader.gui.pick_input_hint"));
  }

  // target card
  if (session.target) {
    e.set(S.targetSlot, coloredName(session.target), iconOf(session.target), () => {
      click(player);
      openCatalog(player);
    });
    e.set(S.rightValue, tr("upgrader.gui.value", formatValue(state.targetValue)));
    const max = Math.max(1, Math.min(CONFIG.maxTargetCount, maxStackSize(session.target)));
    amountControls(player, e, "amount", clampCount(session, session.targetCount), max, (count) => {
      if (!spin && clampCount(session, count) !== session.targetCount) click(player, 1.2);
      setCount(session, count);
      openStation(player);
    });
  } else {
    e.set(S.targetSlot, "", undefined, () => {
      click(player);
      openCatalog(player);
    });
    e.set(S.rightHint, tr("upgrader.gui.pick_target"));
    e.set(S.rightHint + 1, tr("upgrader.gui.pick_target_hint"));
  }

  // how much of the stack goes in (Bedrock can't split stacks with the mouse)
  if (stack && stack.amount > 1) {
    amountControls(player, e, "risk", session.inputAmount, stack.amount, (amount) => {
      if (Math.max(1, Math.min(stack.amount, amount)) !== session.inputAmount) click(player, 1.2);
      setInputAmount(player, session, amount);
      openStation(player);
    });
  }

  // wheel
  const flash = session.lastSpin && system.currentTick < session.lastSpin.until;
  const shown = spin ? spin.chance : flash ? session.lastSpin.chance : state.chance;
  e.set(S.zone, "", zoneTexture(shown));
  e.set(S.percent + percentBucket(shown), formatPercent(shown));
  if (!spin) {
    e.set(S.needle, "", needleTexture(session.lastSpin ? session.lastSpin.angle : 0));
    if (flash) e.set(S.caption, session.lastSpin.win ? raw("§a", tr("upgrader.gui.success")) : raw("§c", tr("upgrader.gui.failure")));
    else e.set(S.caption, tr("upgrader.gui.chance"));
  }

  // your inventory (the stack in the input slot is shown as moved out of it)
  const container = inventoryOf(player);
  for (let k = 0; k < 36; k++) {
    const slot = k < 27 ? 9 + k : k - 27;
    const item = container?.getItem(slot);
    if (!item) {
      e.set(S.inv + k, "", undefined, () => openStation(player));
      continue;
    }
    let shownAmount = item.amount;
    const id = keyOf(item);
    if (!spin && session.input?.slot === slot && id === session.input.typeId) shownAmount -= session.inputAmount;
    if (shownAmount > 0) {
      e.set(S.inv + k, coloredName(id, item.localizationKey), iconOf(id));
      e.set(S.invCount + k, countText(shownAmount));
    }
    e.actions.set(S.inv + k, () => {
      if (!spin && canStake(item)) setInput(session, slot, item); // like shift-clicking it into the slot
      openStation(player);
    });
  }
  return e;
}

/** Opens (or refreshes) the station. */
export async function openStation(player) {
  const session = sessionOf(player);
  if (session.spinning) return;
  const entries = stationEntries(player, session);
  const response = await show(player, entries.form(TITLE.station));
  if (!response) return;
  if (response.canceled) {
    session.reset(); // closing the station clears it, like a new UpgraderMenu
    return;
  }
  const action = entries.actions.get(response.selection);
  if (action) action();
  else openStation(player);
}

// ---------------------------------------------------------------------------
// Spin
// ---------------------------------------------------------------------------

function upgrade(player) {
  const session = sessionOf(player);
  const stack = inputStack(player, session);
  if (!stack) return openStation(player);
  const input = { typeId: keyOf(stack), amount: session.inputAmount, key: stack.localizationKey };
  const inputValue = Math.round(stackValue(stack, session.inputAmount));
  const spin = startUpgrade(player, session);
  if (spin.error) return openStation(player);
  session.spinTick = system.currentTick;
  spin.input = input;
  spin.inputValue = inputValue;
  playSpin(player, session, spin);
}

/**
 * The frames the screen plays, starting `from` ticks into the spin: frame f shows the needle,
 * the caption and what sits in the input slot at spin tick from + f. Every frame of the screen is
 * sent; the ones past the result repeat it, and the screen keeps its last frame up.
 */
function spinFrames(e, spin, from) {
  const start = Math.max(0, Math.min(from, spin.ticks));
  e.list.length = S.frames + 2 * LAYOUT.spinFrames;
  const spinning = raw("§e", tr("upgrader.gui.spinning"));
  const result = spin.win ? raw("§a", tr("upgrader.gui.success")) : raw("§c", tr("upgrader.gui.failure"));
  const prize = spin.win ? { text: countText(spin.count), icon: iconOf(spin.target) } : blank();
  const stake = { text: countText(spin.input.amount), icon: iconOf(spin.input.typeId) };
  for (let f = 0; f < LAYOUT.spinFrames; f++) {
    const t = Math.min(start + f, spin.ticks);
    const done = t >= spin.ticks;
    const a = S.frames + 2 * f;
    e.list[a] = { text: done ? result : spinning, icon: needleTexture(needleAngle(t / spin.ticks, spin.angle)) };
    e.list[a + 1] = done ? prize : stake;
  }
}

/** A click on a station form drawn before the last change (the spin screen): do what it means now. */
function clickStation(player, selection) {
  const entries = stationEntries(player, sessionOf(player));
  const action = entries.actions.get(selection);
  if (action) action();
  else openStation(player);
}

/**
 * Shows the spin. The screen plays it by itself and keeps the result up afterwards: nothing is
 * closed or reloaded when the wheel stops. The game-side clock (ticking, result, prize) starts when
 * the form is sent, again on each retry while the player is busy.
 */
function playSpin(player, session, spin) {
  let settled = false;
  let closed = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    finishUpgrade(player, session, spin);
    session.lastSpin = { chance: spin.chance, win: spin.win, angle: spin.angle, until: system.currentTick + RESULT_FLASH_TICKS };
  };
  const clock = spinClock(player, spin, {
    onResult: settle,
    onLeave: () => {
      closed = true;
      session.spinning = false; // the prize stays stored and is paid on the next join
    },
  });

  const present = (first) => {
    const build = () => {
      const entries = stationEntries(player, session, spin);
      spinFrames(entries, spin, first ? 0 : clock.tick() + START_DELAY);
      return entries.form(TITLE.spin);
    };
    const failed = () => {
      // the form could not be shown (or the player left): never leave the stake hanging
      if (closed) return;
      closed = true;
      clock.stop();
      if (!player.isValid) {
        session.spinning = false; // the prize stays stored and is paid on the next join
        return;
      }
      settle();
      session.reset();
    };
    show(player, build, first ? () => clock.start() : undefined).then((response) => {
      if (closed) return;
      if (!response) return failed();
      if (response.canceled) {
        // closed: like the mod, the result is applied at once and the station closes
        closed = true;
        clock.stop();
        if (!settled) {
          settle();
          clock.resultSound();
        }
        session.reset();
        return;
      }
      if (!settled) {
        present(false); // a click while the wheel turns: keep it turning
        return;
      }
      closed = true;
      clickStation(player, response.selection); // the result was up: the click goes to the station
    }).catch(failed);
  };
  present(true);
}

// ---------------------------------------------------------------------------
// Catalogue (item picker)
// ---------------------------------------------------------------------------

function filteredCatalog(query) {
  const all = catalog();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((id) => id.includes(q) || itemInfo(id).name.toLowerCase().includes(q));
}

/** The item picker of the station: tap an item to make it the target. */
function openCatalog(player) {
  const session = sessionOf(player);
  const inValue = displayState(player, session).inputValue;
  return openPicker(player, {
    title: TITLE.catalog,
    state: session, // keeps query and scrollRow between visits, like the mod
    items: filteredCatalog,
    cell: (id) => {
      const value = catalogValue(id);
      const lines = [coloredName(id), "\n§7", tr("upgrader.gui.value", formatValue(value))];
      if (inValue > 0) lines.push("\n§8", tr("upgrader.gui.estimate", formatPercent(chance(inValue, value))));
      return lines;
    },
    footer: (count, row, rows) => tr("upgrader.gui.picker_footer", String(count), String(row), String(rows)),
    onPick: (id) => {
      setTarget(session, id);
      click(player);
      openStation(player);
      return false; // back to the station, not the picker
    },
    onClose: () => openStation(player), // closing the picker goes back to the station
  });
}

// ---------------------------------------------------------------------------
// Picker: the catalogue screen (search bar, 14 x 9 grid, rows), also used by the admin menu
// ---------------------------------------------------------------------------
//
// picker = {
//   title             form title, must contain "upgrader:catalog" (default "upgrader:catalog:admin")
//   state             { query, scrollRow }, kept by the caller
//   items(query)      ids to show for a search text
//   cell(id)          lines of the hover text (strings / RawMessages)
//   footer(count, row, rows)   text under the grid
//   onPick(id)        a cell was tapped; return false when it opened another screen itself
//   onClose()         the screen was closed
// }

export async function openPicker(player, picker) {
  const state = picker.state;
  state.query ??= "";
  const items = picker.items(state.query);
  const maxRow = Math.max(0, Math.ceil(items.length / C.cols) - C.rows);
  state.scrollRow = Math.max(0, Math.min(maxRow, state.scrollRow ?? 0));
  const e = new Entries(C.count);
  const again = () => openPicker(player, picker);

  e.set(C.search, state.query ? state.query : raw("§8", tr("upgrader.gui.search")), undefined, () => openPickerSearch(player, picker));
  e.set(C.up, "^", GUI + (state.scrollRow > 0 ? "/mini_up_on" : "/mini_up_off"), () => {
    state.scrollRow = Math.max(0, state.scrollRow - C.rows);
    again();
  });
  e.set(C.down, "v", GUI + (state.scrollRow < maxRow ? "/mini_down_on" : "/mini_down_off"), () => {
    state.scrollRow = Math.min(maxRow, state.scrollRow + C.rows);
    again();
  });
  e.set(C.footer, picker.footer(items.length, state.scrollRow + 1, maxRow + 1));

  const first = state.scrollRow * C.cols;
  for (let k = 0; k < GRID && first + k < items.length; k++) {
    const id = items[first + k];
    e.set(C.cells + k, raw(...picker.cell(id)), iconOf(id), () => {
      if (picker.onPick(id) !== false) {
        click(player);
        again();
      }
    });
  }

  const response = await show(player, e.form(picker.title ?? "upgrader:catalog:admin"));
  if (!response) return;
  if (response.canceled) return picker.onClose?.();
  const action = e.actions.get(response.selection);
  if (action) action();
  else again();
}

async function openPickerSearch(player, picker) {
  const form = new ModalFormData()
    .title(tr("upgrader.gui.search"))
    .textField(tr("upgrader.gui.search"), tr("upgrader.gui.search_hint"), { defaultValue: picker.state.query })
    .submitButton(tr("upgrader.gui.done"));
  const response = await show(player, form);
  if (!response) return;
  if (!response.canceled) {
    picker.state.query = String(response.formValues?.[0] ?? "").slice(0, 64);
    picker.state.scrollRow = 0;
  }
  openPicker(player, picker);
}

/** Name of an item as the screens show it (translated, coloured by rarity). */
export const displayName = (id) => coloredName(id);
