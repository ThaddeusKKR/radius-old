const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'settings',
    description: 'Changes server settings.',
    aliases: ['set'],
    category: 'admin',
    modOnly: true,
    ownerOnly: false,
    async execute(message, args, prefix) {
        const db = new Keyv(process.env.DATABASE_URL, { namespace: 'guild-settings' })
        const guildSettings = await db.get(message.guild.id)
        if (!guildSettings) {
            const embed = new MessageEmbed()
                .setDescription(`Guild settings currently not available.`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const setting = args[0]
        let value;
        if (args.length < 2) {
            let currentValue = guildSettings.values(setting)
            if (!currentValue) {
                currentValue = "-"
            }
            const embed = new MessageEmbed()
                .setDescription(`\`${setting}\` is currently set to \`${currentValue}\`.`)
                .setColor('PURPLE')
            return message.channel.send(embed)
        } else {
            value = args[1]
        }

    }
}