	import * as mc from "@minecraft/server"
const { world, system } = mc;

/**
 * Chat notifications by @bakedpotato4747
 * Discord: https://discord.com/channels/523663022053392405/1336971159496822784
 */

export class Notification {
    static #adjustTextLength = function adjustTextLength(text = '', totalLength = 100) {
        return (text.slice(0, totalLength)).padEnd(totalLength, '\t')
    }
    /**@param {{title: string, message: string, icon: string, background: string}} notificationConstructor */
    constructor(notificationConstructor) {
        const { title = "", message = "", icon = "", background = 'textures/ui/greyBorder' } = notificationConstructor;
        this.#text = "§N§O§T§I§F§I§C§A§T§I§O§N" +
            Notification.#adjustTextLength(title, 100) +
            Notification.#adjustTextLength(message, 200) +
            Notification.#adjustTextLength(icon, 100) +
            Notification.#adjustTextLength(background, 100)
    }
    #text;
    /**@param {mc.Player[]} players */
    show(players) {
        players.forEach(player => player.sendMessage(this.#text))
    }
    showAll() {
        world.sendMessage(this.#text)
    }
}



