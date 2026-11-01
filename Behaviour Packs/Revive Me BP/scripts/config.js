import * as mc from "@minecraft/server"
import * as ui from "@minecraft/server-ui"
const { world, system } = mc;

export class Config {
    static #DEFAULT = {
        revive_time: 5 * 20,
        knocked_time: 45 * 20,
        surrender_time: 2 * 20,
        is_hardcore: false,
        loot_chest: true,
        hide_coordinates: false,
        show_notifications: true,
        keep_inventory: false,
        show_loot_waypoint_light: true

    };
    /**@param {string} key */
    static get(key) {
        return world.getDynamicProperty(key) ?? Config.#DEFAULT[key];
    }
    /**@param {string} key @param {string | number | boolean | mc.Vector3} value*/
    static set(key, value) {
        world.setDynamicProperty(key, value);
    }
    /**@type {string}*/
    static get revive_time() { return this.get("revive_time"); }
    static set revive_time(v) { this.set("revive_time", v); }

    /**@type {number}*/
    static get knocked_time() { return this.get("knocked_time"); }
    static set knocked_time(v) { this.set("knocked_time", v); }

    /**@type {number}*/
    static get surrender_time() { return this.get("surrender_time"); }
    static set surrender_time(v) { this.set("surrender_time", v); }

    /**@type {boolean}*/
    static get is_hardcore() { return this.get("is_hardcore"); }
    static set is_hardcore(v) { this.set("is_hardcore", v); }

    /**@type {boolean}*/
    static get loot_chest() { return this.get("loot_chest"); }
    static set loot_chest(v) { this.set("loot_chest", v); }

    /**@type {boolean}*/
    static get hide_coordinates() { return this.get("hide_coordinates"); }
    static set hide_coordinates(v) { this.set("hide_coordinates", v); }

    /**@type {boolean}*/
    static get show_notifications() { return this.get("show_notifications"); }
    static set show_notifications(v) { this.set("show_notifications", v); }

    /**@type {boolean}*/
    static get keep_inventory() { return this.get("keep_inventory"); }
    static set keep_inventory(v) { this.set("keep_inventory", v); }

    /**@type {boolean}*/
    static get show_loot_waypoint_light() { return this.get("show_loot_waypoint_light"); }
    static set show_loot_waypoint_light(v) { this.set("show_loot_waypoint_light", v); }
}
system.beforeEvents.startup.subscribe(e => {
    e.customCommandRegistry.registerCommand({
        name: "reviveme:config",
        description: "Customize the reviving times and gamerules.",
        cheatsRequired: false,
        permissionLevel: mc.CommandPermissionLevel.Any
    }, ({ sourceEntity: e }) => {
        const player = world.getAllPlayers().find(k => k.id == e.id)
        const permission = player.playerPermissionLevel
        if (permission == mc.PlayerPermissionLevel.Operator || player.hasTag("admin")) {
            system.run(() => main(player))
        } else {
            player.sendMessage("§cYou need to have operator permission level to run this command.")
            player.sendMessage('§vIf you are on a realm give yourself the "admin" tag.')
        }
    })

    e.customCommandRegistry.registerCommand({
        name: "reviveme:reset",
        cheatsRequired: false,
        description: "Resets your camera and movement to fix visual bugs.",
        permissionLevel: mc.CommandPermissionLevel.Any
    }, ({ sourceEntity: e }) => {
        const player = world.getAllPlayers().find(k => k.id == e.id)
        if (!player) return console.error("Player executor not found")
        system.run(() => {
            player.camera.clear();
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(permission => player.inputPermissions.setPermissionCategory(permission, true));
            player.addEffect("invisibility", 3, { amplifier: 1, showParticles: false })
        })
    })
    e.customCommandRegistry.registerCommand({
        name: "reviveme:coordinates",
        cheatsRequired: false,
        description: "Gets all your death coordinates.",
        permissionLevel: mc.CommandPermissionLevel.Any
    }, ({ sourceEntity: e }) => {
        const player = world.getAllPlayers().find(k => k.id == e.id)
        if (!player) return console.error("Player executor not found")
        system.run(() => {
            coordinatesMenu(player)
        })
    })
})
/**@param {mc.Player} player */
const main = (player) => {
    player.playSound("random.levelup")

    new ui.ModalFormData()
        .header("§lReviveMe Config")
        .divider()
        // time to revive
        .slider("Time to revive", 0, 59, { defaultValue: Config.revive_time / 20 })
        .label("Determinates how much time does it take to revive a player.")
        .divider()

        // time knocked down
        .slider("Knocked lifetime (minutes)", 0, 59, { defaultValue: 0, valueStep: 1 })
        .slider("Knocked lifetime (seconds)", 0, 59, { defaultValue: 45, valueStep: 1 })
        .label("Determinates how much time the player remains alive while being knocked down.")
        .divider()

        // can enemies loot your chest
        .slider("Surrender Time (seconds)", 0, 10, { defaultValue: Config.surrender_time / 20, valueStep: 1 })
        .label("Determinates for how long you have to hold jump to surrender.")
        .divider()

        // is hardcore
        .toggle("is hardcore", { defaultValue: Config.is_hardcore })
        .label("Makes you become spectator after dying, if you get knocked you can still be revived.")
        .divider()

        // is hardcore
        .toggle("Loot Chest", { defaultValue: Config.loot_chest })
        .label("If disabled your loot falls on the ground instead of spawning the loot chest.")
        .divider()

        // hide coordinates
        .toggle("Hide coordinates", { defaultValue: Config.hide_coordinates })
        .label("If enabled no one gets your location in the notifications when you get knocked.\nAdding teams soon..")
        .divider()

        // show notifications
        .toggle("Show notifications", { defaultValue: Config.show_notifications })
        .label("You can disable this if you re getting some chat messages artifacts when playing with multiple addons.")
        .divider()

        // Keep inventory
        .toggle("Enable KeepInventory", { defaultValue: Config.keep_inventory })
        .label("If enabled you wont loose any items from your inventory when you die.")
        .divider()

        // Show Loot Waypoint
        .toggle("Show loot waypoint", { defaultValue: Config.show_loot_waypoint_light })
        .label("Shows the beam emitted by your loot chest.")
        .divider()

        .show(player).then(({ cancelationReason: reason, formValues }) => {
            if (reason) {
                console.log(reason)
                if (reason == "UserBusy")
                    system.waitTicks(10).then(() => { main(player) })
                else
                    return;
            }
            const [
                , , reviveTime,
                , , knocked_m, knocked_s,
                , , surrender_time,
                , , is_hardcore,
                , , loot_chest,
                , , hide_coordinates,
                , , show_notifications,
                , , keep_inventory,
                , , show_loot_waypoint_light,

            ] = formValues;
            player.playSound("random.levelup")

            world.sendMessage(
                `§a-- Updated settings --\n§r` +
                `- §iTime to revive: §r${reviveTime}\n` +
                `- §iTime Knocked down: §r${knocked_m}:${knocked_s}\n` +
                `- §iTime to surrender: §r${surrender_time}\n` +
                `- §iHardcore: §r${is_hardcore}\n` +
                `- §iLoot Chest: §r${loot_chest}\n` +
                `- §iHide coordinates: §r${hide_coordinates}\n` +
                `- §iShow Notifications: §r${show_notifications}\n` +
                `- §iKeepInventory: §r${keep_inventory}\n` +
                `- §iEnableLootWaypoint: §r${show_loot_waypoint_light}\n`

            )

            Config.revive_time = reviveTime * 20;
            Config.knocked_time = (knocked_m * 60 + knocked_s) * 20;
            Config.surrender_time = surrender_time * 20;
            Config.is_hardcore = is_hardcore;
            Config.loot_chest = loot_chest;
            Config.hide_coordinates = hide_coordinates;
            Config.show_notifications = show_notifications;
            Config.keep_inventory = keep_inventory;
            Config.show_loot_waypoint_light = show_loot_waypoint_light
        })
}

/**@param {mc.Player} player */
function coordinatesMenu(player) {
    /**@type {{location:mc.Vector3,date:number,dimension:string}[]} */
    const coords = JSON.parse(player.getDynamicProperty("death_locations") ?? '[]');


    new ui.ActionFormData()
        .button("Clear")
        .button("Close")
        .body(
            coords
                ? coords.map(({ date, location: { x, y, z }, dimension }) =>
                    `date: ${new Date(date).toLocaleString()}\nxyzd: ${x.toFixed(0)} ${y.toFixed(0)} ${z.toFixed(0)}, ${dimension}\n`
                ).join("\n")
                : "Nothing here..."
        )
        .show(player).then(({ canceled, selection }) => {
            if (canceled) return;
            if (selection == 0) player.setDynamicProperty("death_locations", undefined)
        })
}


system.afterEvents.scriptEventReceive.subscribe(({ sourceEntity: e, id }) => {
    if (id == "reviveme:config") {
        const player = world.getAllPlayers().find(k => k.id == e.id)
        const permission = player.playerPermissionLevel
        if (permission == mc.PlayerPermissionLevel.Operator || player.hasTag("admin")) {
            system.run(() => main(player))
        } else {
            player.sendMessage("§cYou need to have operator permission level to run this command.")
            player.sendMessage('§vIf you are on a realm give yourself the "admin" tag.')
        }
    }
})