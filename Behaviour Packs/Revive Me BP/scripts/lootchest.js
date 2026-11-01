import * as mc from "@minecraft/server"
const { world, system } = mc;
import { QIDB } from "./QIDB.js"
import { Config } from "./config.js"

export const LootDatabase = new QIDB('rvme_l', 10, 1)

export class LootChest {
    constructor() { }
    /**@param {mc.ItemStack[]} itemStacks @param {mc.Player} player@param {number} xp */
    create(player, itemStacks, xp) {
        const { location, dimension } = player;
        const serial_number = player.getDynamicProperty('serial_number') || 0
        player.setDynamicProperty('serial_number', serial_number + 1)

        this.key = player.id + "_" + serial_number
        LootDatabase.set(this.key, itemStacks)

        const lootChest = dimension.spawnEntity("rm:loot_chest", location)

        lootChest.nameTag = player.name + "'s Loot Chest"
        lootChest.setDynamicProperty(`identifier`, this.key)
        lootChest.setDynamicProperty(`experience`, xp)

        lootChest.runCommand('effect @s resistance infinite 225')
        lootChest.runCommand('effect @s regeneration infinite 225')
    }
    /**@param {mc.Entity} entity @returns {{items:mc.ItemStack[],xp:number} | undefined}*/
    fromEntity(entity) {
        if (!entity.isValid) return;
        const identifier = entity.getDynamicProperty('identifier')
        const xp = entity.getDynamicProperty('experience') ?? 0
        if (!identifier || !LootDatabase.has(identifier)) return;

        // claimed before anything else, so a double interact can't loot it twice
        entity.setDynamicProperty('identifier', undefined)
        const items = LootDatabase.get(identifier)
        entity.remove()
        system.runTimeout(() => { try { LootDatabase.delete(identifier) } catch { } }, 5)
        return { items, xp }
    }
}
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (Config.show_loot_waypoint_light === true) {
        if (entity.typeId == "rm:loot_chest") {
            function* showWaypoint() {
                for (let y = entity.location.y; y < 320; y++) {
                    if (entity.dimension.getBlock({ ...entity.location, y }).isAir == true)
                        entity.dimension.setBlockType({ ...entity.location, y }, "rm:loot_tracker")
                    if (y % 5 == 0) yield;
                }
            }
            system.runJob(showWaypoint())
        }
    }

})
let nextAvailableTick = 0
system.afterEvents.scriptEventReceive.subscribe(({ sourceEntity: entity, id }) => {
    if (Config.show_loot_waypoint_light === true) {

        if (id != "rm:check") return;
        if (nextAvailableTick >= system.currentTick) return;

        nextAvailableTick = system.currentTick + 100

        if (entity.typeId == "rm:loot_chest") {
            function* showWaypoint() {
                for (let y = entity.location.y; y < 320; y++) {
                    if (entity.dimension.getBlock({ ...entity.location, y }).isAir == true)
                        entity.dimension.setBlockType({ ...entity.location, y }, "rm:loot_tracker")
                    if (y % 5 == 0) yield;
                }
            }
            system.runJob(showWaypoint())
        }
    }
})

system.beforeEvents.startup.subscribe((e) => {
    e.blockComponentRegistry.registerCustomComponent("rm:loot_tracker", {
        onTick: ({ block, dimension }) => {
            if (Config.show_loot_waypoint_light === false) {
                dimension.setBlockType(block.location, "air")
            }
            const entities = dimension.getEntitiesFromRay(
                block.center(),
                {
                    x: 0, y: -1, z: 0
                },
                { type: "rm:loot_chest", maxDistance: 400 }
            )
            if (entities == 0) {
                dimension.setBlockType(block.location, "air")
            }
        }
    })
})