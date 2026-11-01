import * as mc from "@minecraft/server"
const { world, system } = mc;
import { bar, KnockedPlayer } from "./knocked.js"

const medikit = {
    id: 'reviveme:medikit',
    prepare_time: 40,   // ticks of sneaking before it starts healing
    heal_per_tick: 0.1, // 300 durability = 30 health points
    hint: `§R§M§U§G§R§AHold §a§lSneak§r to use the Medikit!`
}
/**@type {Map<string,number>} player id -> ticks of use, the only state of the medikit */
const users = new Map()

// start / stop using it
world.afterEvents.playerButtonInput.subscribe(({ player, button, newButtonState }) => {
    if (button != mc.InputButton.Sneak) return;
    if (newButtonState != mc.ButtonState.Pressed) return users.delete(player.id);
    if (KnockedPlayer.instances.has(player.id)) return;

    try {
        if (player.getComponent('equippable').getEquipment("Mainhand")?.typeId != medikit.id) return;
        users.set(player.id, 0)
    } catch { }
})

world.afterEvents.playerHotbarSelectedSlotChange.subscribe(({ player, itemStack }) => {
    users.delete(player.id)
    if (itemStack?.typeId == medikit.id) player.onScreenDisplay.setActionBar(medikit.hint)
})

world.afterEvents.playerLeave.subscribe(({ playerId }) => users.delete(playerId))

// one single loop for everyone who is using a medikit
system.runInterval(() => {
    if (!users.size) return;

    for (const player of world.getAllPlayers()) {
        const time = users.get(player.id)
        if (time == undefined) continue;

        try {
            const eq = player.getComponent('equippable')
            const itemStack = eq.getEquipment("Mainhand")

            // stopped sneaking or swapped the item
            if (!player.isSneaking || itemStack?.typeId != medikit.id) {
                users.delete(player.id)
                player.onScreenDisplay.setActionBar(medikit.hint)
                continue;
            }

            users.set(player.id, time + 1)
            for (const effect of ["mining_fatigue", "weakness"])
                player.addEffect(effect, 5, { amplifier: 225, showParticles: false })

            if (time < medikit.prepare_time) {
                player.onScreenDisplay.setActionBar(
                    `§R§M§U§O§R§APreparing Medikit...\n${bar(time / medikit.prepare_time, "§a|", 20)}`
                )
                continue;
            }

            const health = player.getComponent('health')
            const durability = itemStack.getComponent('durability')
            const used_up = durability.damage + 1 >= durability.maxDurability

            // fully healed or fully used, the medikit is consumed only when it breaks
            if (used_up || health.currentValue >= health.effectiveMax) {
                eq.setEquipment("Mainhand", used_up ? undefined : itemStack)
                player.onScreenDisplay.setActionBar(`§R§M§U§G§R§ECompleted!`)
                users.delete(player.id)
                continue;
            }

            health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + medikit.heal_per_tick))
            durability.damage += 1
            eq.setEquipment("Mainhand", itemStack)

            if (Math.random() < 0.05)
                player.dimension.spawnParticle("minecraft:crop_growth_emitter", player.getHeadLocation())

            player.onScreenDisplay.setActionBar(
                `§R§M§U§G§R§EUsing Medikit...\n${bar(1 - durability.damage / durability.maxDurability, "§a|", 20)}`
            )
        } catch (error) {
            users.delete(player.id)
            console.warn(`§cReviveMe > medikit: ${error}`)
        }
    }
})
