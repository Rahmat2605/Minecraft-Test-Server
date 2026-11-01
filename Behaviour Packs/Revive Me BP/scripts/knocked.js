import * as mc from "@minecraft/server"
const { world, system } = mc;
import { Config } from "./config.js"
import { LootChest } from "./lootchest.js"
import { Notification } from "./notifications.js"

const eqTypes = ["Feet", "Legs", "Chest", "Head", "Offhand"];
/**Camera, Movement, LateralMovement, Sneak, Jump | the enum starts at 1, 0 throws */
const inputCategories = [1, 2, 3, 4, 5];
/**@param {number} ratio 0-1 @param {string} color @param {number} length */
export const bar = (ratio, color, length = 35) =>
    `§l${Array.from({ length }, (_, i) => i < ratio * length ? color : "§7|").join('')}`;

export class KnockedPlayer {
    /**Keyed by player id: the same player can come back as a different object, the id never changes
     * @type {Map<string,KnockedPlayer>} */
    static instances = new Map()
    /**@type {mc.Player} */
    reviver;
    /**@type {mc.Player} */
    player;
    id;
    revivingProgress;
    knocked_time;
    #loop_run_id;
    #ended;

    isSurrending;
    surrending_progress;

    /**@param {mc.Player} player */
    constructor(player, knocked_time = 0) {
        // never leave two loops running on the same player
        const previous = KnockedPlayer.instances.get(player.id)
        if (previous) { previous.#ended = true; system.clearRun(previous.#loop_run_id) }

        KnockedPlayer.instances.set(player.id, this)
        this.knocked_time = knocked_time
        this.player = player;
        this.id = player.id;
        this.isSurrending = false;
        this.surrending_progress = 0;
        this.revivingProgress = 0;
        this.#ended = false;
        this.#loop_run_id = this.loop();
        // a knocked_time already saved means the player is joining, the client needs longer
        this.fall(knocked_time ? 160 : 20);

        if (Config.show_notifications) new Notification({
            title: `@${player.name} got knocked!`,
            message: `§a@${player.name}§r is asking for help!\nat ${Config.hide_coordinates ? "?" : Object.values(player.location).map(k => k.toFixed(0)).join(' ')}`,
            icon: 'textures/ui/knocked_down',
            background: 'textures/ui/orangeBorder'
        })
            .show(world.getPlayers({ excludeNames: [player.name] }));
    }

    display() {
        const backGroundColor = this.isSurrending ? "§R§E§D" : this.reviver ? "§G§R§E" : "§O§R§A"
        const text = this.isSurrending ? "Surrending..." : this.reviver ? "Reviving..." : "Hold JUMP to surrender"
        const color = this.isSurrending ? "§c|" : this.reviver ? "§a|" : "§v|"

        const progress = this.isSurrending
            ? this.surrending_progress / Config.surrender_time
            : this.reviver
                ? this.revivingProgress / Config.revive_time
                : (Config.knocked_time - this.knocked_time) / Config.knocked_time

        const playerBar = bar(progress, color)
        const seconds = Math.max(0, (Config.knocked_time - this.knocked_time) / 20).toFixed(0)

        this.player.onScreenDisplay.setActionBar(
            `§R§M§U${backGroundColor}` +
            `${text}\n` +
            `${playerBar}§r ${seconds}s\n`
        )
        this.player.nameTag = `§l${this.player.name}\n${playerBar}`
        this.reviver?.onScreenDisplay.setActionBar(
            `§R§M§U§G§R§E§rReviving..\n${bar(progress, "§a|")}`
        )
    }
    animation() {
        inputCategories.forEach(category => this.player.inputPermissions.setPermissionCategory(category, false))
    }
    /**The pose holds the last frame until the player turns invisible, so revive, death and respawn end it */
    fall(delay = 20) {
        system.runTimeout(() => {
            if (this.#ended || !this.player.isValid) return;
            this.player.playAnimation("animation.humanoid.fall", { stopExpression: "query.is_invisible" })
        }, delay)
    }
    camera() {
        const loc = this.player.getHeadLocation()
        this.player.camera.setCamera("minecraft:free", {
            location: {
                x: loc.x + Math.sin((system.currentTick % 360) * 0.01745) * Math.min(0.2, this.knocked_time / 400),
                y: loc.y + Math.min(0.5, this.knocked_time / 200),
                z: loc.z - Math.cos((system.currentTick % 360) * 0.01745) * Math.min(0.2, this.knocked_time / 400)
            },
            facingLocation: this.player.location,
            easeOptions: {
                easeTime: 20,
                easeType: mc.EasingType.Linear
            }
        })
        this.player.teleport(this.player.location, {
            dimension: this.player.dimension,
            rotation: { x: 75, y: this.player.getRotation().y }
        })
    }
    save() {
        this.player.setDynamicProperty("knocked_time", this.knocked_time)
    }
    loop() {
        return system.runInterval(() => {
            if (this.#ended) return;
            // player left the world or isn't loaded anymore
            if (!this.player.isValid) {
                KnockedPlayer.instances.delete(this.id)
                return system.clearRun(this.#loop_run_id);
            }
            try { this.tick() } catch (error) { console.warn(`§cReviveMe > knocked loop: ${error}`) }
        })
    }
    tick() {
        // revivers: nearby players that aren't knocked themselves
        const nearPlayers = this.player.dimension.getPlayers({
            location: this.player.location,
            maxDistance: 2.5,
            excludeNames: [this.player.name],
            excludeGameModes: [mc.GameMode.Spectator]
        }).filter(player => !KnockedPlayer.instances.has(player.id))

        nearPlayers.forEach(player => player.onScreenDisplay.setActionBar(
            `§R§M§U§G§R§A§rHold SNEAK to revive ${this.player.name}`
        ))
        this.reviver = nearPlayers.find(k => k.isSneaking)

        if (!this.reviver && this.player.inputInfo.getButtonState("Jump") == 'Pressed') {
            this.isSurrending = true
            this.surrending_progress += 1
        }
        else {
            this.isSurrending = false
            this.surrending_progress = 0;
        }

        if (this.reviver) {
            this.revivingProgress += 1
        }
        else {
            this.knocked_time += 1
            this.revivingProgress += this.revivingProgress > 0 ? -1 : 0
        }

        this.display()
        this.animation()
        //this.camera()

        if (system.currentTick % 20 == 0) {
            ["mining_fatigue", "resistance", "instant_health", "fire_resistance", "weakness"].forEach(effect => {
                this.player.addEffect(effect, 21, { amplifier: 255, showParticles: false })
            })
            this.save()
        }

        // only one ending can happen, the loop stops right after
        if (this.revivingProgress >= Config.revive_time) {
            this.reviver?.onScreenDisplay.setActionBar("§R§M§U§G§R§E§aReviving completed!")
            this.player.onScreenDisplay.setActionBar("§R§M§U§G§R§E§aYou got revived!")
            this.revive()
        }
        else if (this.knocked_time > Config.knocked_time || this.surrending_progress >= Config.surrender_time) {
            this.player.onScreenDisplay.setActionBar("§R§M§U§R§E§D§cYou Died!")
            this.kill()
        }
    }
    /**Shared cleanup, returns false if the player was already revived/killed */
    #end() {
        if (this.#ended) return false;
        this.#ended = true;
        system.clearRun(this.#loop_run_id)

        // no longer knocked from now on, even if the player left before the cleanup below
        KnockedPlayer.instances.delete(this.id)
        if (!this.player.isValid) return false;
        this.reviver?.onScreenDisplay.setActionBar("")
        this.player.nameTag = this.player.name
        this.player.addEffect("invisibility", 3, { showParticles: false })

        // cleared right away too: a leftover knocked_time knocks the player again on the next join
        this.player.setDynamicProperty('knocked_time', undefined)
        system.runTimeout(() => {
            if (!this.player.isValid) return;
            //this.player.camera.clear()
            inputCategories.forEach(category => this.player.inputPermissions.setPermissionCategory(category, true))
            this.player.setDynamicProperty('knocked_time', undefined)
        }, 3)
        return true;
    }
    revive() {
        if (!this.#end()) return;

        if (Config.show_notifications) new Notification({
            title: `Revived §e@${this.player.name}!§r`,
            message: `§e@${this.player.name}§r got revived by §e@${this.reviver?.nameTag ?? "Totem of undying"}!`,
            icon: 'textures/ui/revived',
            background: 'textures/ui/greenBorder'
        })
            .show(world.getPlayers({ excludeNames: [this.player.name, this.reviver?.name ?? ""] }));

        system.runTimeout(() => {
            if (!this.player.isValid) return;
            this.player.getComponent('health').setCurrentValue(6)
            this.player.playAnimation("animation.humanoid.revive")
        }, 3)
    }
    kill() {
        if (!this.#end()) return;

        if (Config.show_notifications) new Notification({
            title: `§e@${this.player.name}§r Gave up`,
            message: `§e@${this.player.name}§r died at ${Config.hide_coordinates ? "?" : Object.values(this.player.location).map(k => k.toFixed(0)).join(' ')}`,
            icon: 'textures/ui/death',
            background: 'textures/ui/redBorder'
        })
            .showAll()

        if (!Config.keep_inventory) {
            const inv = this.player.getComponent('inventory').container
            const eq = this.player.getComponent('equippable')
            // the holes matter: the index is the slot the item goes back to
            const items = [
                ...Array.from({ length: inv.size }, (_, i) => inv.getItem(i)),
                ...eqTypes.map(k => eq.getEquipment(k))
            ]
            const xp = Math.min(7, this.player.level)
            this.player.resetLevel()

            // if the chest fails the loot drops on the ground, so it's never lost
            const dropOnGround = () => {
                for (let i = 0; i < xp * 7; i++)
                    this.player.dimension.spawnEntity("xp_orb", this.player.location)

                items.forEach(item => item && this.player.dimension.spawnItem(item, this.player.location))
            }
            if (!Config.loot_chest) dropOnGround()
            else try { new LootChest().create(this.player, items, xp) }
            catch (error) { console.warn(`§cReviveMe > loot chest: ${error}`), dropOnGround() }
            this.player.runCommand('clear')
        }

        if (Config.is_hardcore) {
            this.player.setGameMode(mc.GameMode.Spectator)
        } else {
            // tells entityDie this death is the knock ending, not a new knock
            this.player.addTag("rm:dying")
            this.player.kill()
        }
    }
}
