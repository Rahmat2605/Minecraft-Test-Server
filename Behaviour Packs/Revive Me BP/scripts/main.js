import * as mc from "@minecraft/server"
const { world, system } = mc;
import { LootChest } from "./lootchest.js"
import { KnockedPlayer } from "./knocked.js"
import "./medikit.js"


// loading properties from the player when joining

system.run(() => world.getPlayers().forEach((player) => {
    //player.camera.clear()
    player.addEffect("invisibility", 3, { showParticles: false })
    player.removeTag("rm:dying")

    const knocked_time = player?.getDynamicProperty('knocked_time')
    if (knocked_time) KnockedPlayer.instances.has(player.id) || new KnockedPlayer(player, knocked_time)
}))

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    //player.camera.clear()
    player.addEffect("invisibility", 3, { showParticles: false })
    // respawned: the death is over, no state left half way
    player.removeTag("rm:dying")
    if (!initialSpawn) return;

    const knocked_time = player?.getDynamicProperty('knocked_time')
    if (knocked_time) KnockedPlayer.instances.has(player.id) || new KnockedPlayer(player, knocked_time)
})

// totem to revive
world.beforeEvents.itemUse.subscribe(({ source: player, itemStack }) => {
    if (itemStack.typeId != "minecraft:totem_of_undying") return;
    if (!KnockedPlayer.instances.has(player.id)) return;

    const knockedPlayer = KnockedPlayer.instances.get(player.id)
    system.run(() => {
        knockedPlayer.revive()
        const eq = player.getComponent("equippable")
        // consume one totem, not the whole stack
        if (itemStack.amount > 1) {
            itemStack.amount -= 1
            eq.setEquipment("Mainhand", itemStack)
        }
        else eq.setEquipment("Mainhand", undefined)
    })

})
// die event while not knocked => knock down

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    const { location, dimension } = deadEntity
    const player = world.getPlayers().find(k => k.id == deadEntity.id)

    if (!player) return;
    // "rm:dying" is set by KnockedPlayer.kill(), this death ends a knock, it doesn't start one
    if (player.hasTag("rm:dying") || KnockedPlayer.instances.has(player.id)) {
        player.removeTag("rm:dying")
        // For getting the death history
        /**@type {{location:mc.Vector3,date:number,dimension:string}[]} */
        const death_locationsObj = JSON.parse(player.getDynamicProperty("death_locations") ?? "[]")
        death_locationsObj.push({ date: Date.now(), location, dimension: dimension.id })
        player.setDynamicProperty(
            "death_locations",
            JSON.stringify(death_locationsObj)
        )
        return;
    }

    player.addTag("lifesteal:ignore")
    let attempts = 0
    const run_id = system.runInterval(() => {
        // the player left the world before respawning
        if (!player.isValid) return system.clearRun(run_id);
        // gave up waiting for the respawn, better a normal death than an endless loop
        if (++attempts > 600) {
            player.removeTag("lifesteal:ignore")
            return system.clearRun(run_id);
        }
        if (player.getComponent("health").currentValue == 0) return;
        player.teleport(location, { dimension, rotation: { x: 45, y: player.getRotation().y } })
        const isSameLocation = Object.entries(player.location).every(([k, v]) => v.toFixed(1) == location[k].toFixed(1))
        const isSameDimension = player.dimension.id == dimension.id

        if (isSameLocation && isSameDimension) {
            new KnockedPlayer(player)
            player.removeTag("lifesteal:ignore")
            system.clearRun(run_id)
        }
    })
})

const eqTypes = ["Feet", "Legs", "Chest", "Head", "Offhand"];

world.afterEvents.playerInteractWithEntity.subscribe((e) => {
    const { player, target: entity } = e;
    if (entity.typeId != 'rm:loot_chest') return;

    try {
        // undefined if the chest was already looted or its items are gone
        const loot = new LootChest().fromEntity(entity)
        if (!loot) return;
        const { items: chestItems, xp } = loot

        const inv = player.getComponent('inventory').container
        const eq = player.getComponent('equippable')
        const currentItems = [
            ...Array.from({ length: inv.size }, (_, i) => inv.getItem(i)),
            ...eqTypes.map(k => eq.getEquipment(k))
        ].filter(item => item)

        // emptied first: the slots the chest doesn't cover would duplicate the items
        for (let i = 0; i < inv.size; i++) inv.setItem(i, undefined)
        eqTypes.forEach(slot => eq.setEquipment(slot, undefined))

        chestItems.forEach((item, i) => {
            if (!item) return;
            i < inv.size
                ? inv.setItem(i, item)
                : eq.setEquipment(eqTypes[i - inv.size], item)
        })
        currentItems.forEach(item =>
            inv.emptySlotsCount > 0
                ? inv.addItem(item)
                : player.dimension.spawnItem(item, player.location)
        )
        player.addLevels(xp)
    } catch (error) { console.warn(`§cReviveMe > loot chest: ${error}`) }
})


// Start messages 

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (player.commandPermissionLevel == 3 && initialSpawn) {
        system.runTimeout(() => {
            player.sendMessage(
                `§a----------------------------\n` +
                `§e@${player.name}§r Thanks for playing §aRevive Me!§r\n` +
                `Bugs? §6Report them on the download page.§r\n` +
                `You like this addon? §gWrite a 5 stars review!§r\n` +
                `§aHave fun!\n` +
                `§iPack version: 1.1.12 - MC 26.30+\nAPI version: 2.8.0\n` +
                `§gNo experiments required, You can now earn achievements!\n` +
                `§a----------------------------`
            )
            player.playSound("random.levelup")
        }, 100)
    }
})

// gamerules NEEDED TO WORK
system.run(() => {
    world.gameRules.keepInventory = true;
    world.gameRules.doImmediateRespawn = true;
})
world.afterEvents.gameRuleChange.subscribe((e) => {
    if (e.rule == "keepInventory" || e.rule == "doImmediateRespawn") {
        world.gameRules.keepInventory = true;
        world.gameRules.doImmediateRespawn = true;
    }
})

system.beforeEvents.startup.subscribe(e => {
    e.customCommandRegistry.registerCommand({
        name: "reviveme:revive",
        description: "Revive a player.",
        mandatoryParameters: [{ type: mc.CustomCommandParamType.EntitySelector, name: "target" }],
        permissionLevel: mc.CommandPermissionLevel.GameDirectors
    }, (origin, targets) => {
        // the parameters arrive as separate arguments, and an EntitySelector one is already an array
        const knockedPlayers = [targets ?? []].flat()
            .map(target => KnockedPlayer.instances.get(target.id))
            .filter(knockedPlayer => knockedPlayer)

        if (!knockedPlayers.length)
            return { status: mc.CustomCommandStatus.Failure, message: "Player isnt knocked down." }

        system.run(() => knockedPlayers.forEach(knockedPlayer => knockedPlayer.revive()))
        return { status: mc.CustomCommandStatus.Success, message: `Revived ${knockedPlayers.length} player(s).` }
    })
})

