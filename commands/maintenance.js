const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')
const client = require('discord.js')

module.exports = {
    name: 'maintenance',
    description: '(Owner) Turns on maintenance mode for the bot.',
    aliases: [],
    category: 'owner',
    modOnly: false,
    ownerOnly: true,
    async execute(message, args, prefix) {
        const db = new Keyv(process.env.DATABASE_URL, { namespace: 'prefixes' })
        const state = await db.get('maintenance-mode')
        let newState;
        let wordState;
        let reason;
        if (state == false) {
            newState = true
            wordState = "enabled"
            reason = args.join(' ') || "No reason provided."
            await client.user.setStatus(`DND`)
            await client.user.setActivity(`maintenance | radius.tk`, {
                type: "PLAYING"
            })
        } else if (state == true) {
            newState = false
            wordState = "disabled"
            reason = args.join(' ') || "Turned off by bot owner."
            await client.user.setStatus(`ONLINE`)
            await client.user.setActivity(`rd!h | radius.tk`, {
                type: "STREAMING",
                url: "https://twitch.tv/thaddeuskkr"
            })
        }
        db.set('maintenance-mode', newState)
        db.set('maintenance-reason', reason)
        const embed = new MessageEmbed()
            .setDescription(`Maintenance mode **${wordState}** | ${reason}`)
            .setColor("GREEN")
        return message.channel.send(embed)
    }
}