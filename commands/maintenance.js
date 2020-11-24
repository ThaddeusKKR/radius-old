const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

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
        } else if (state == true) {
            newState = false
            wordState = "disabled"
            reason = args.join(' ') || "Turned off by bot owner."
        }
        db.set('maintenance-mode', newState)
        db.set('maintenance-reason', reason)
        const embed = new MessageEmbed()
            .setDescription(`Maintenance mode **${wordState}** | ${reason}`)
            .setColor("GREEN")
        return message.channel.send(embed)
    }
}