const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'remove',
    description: 'Removes a song from the queue.',
    aliases: ['rm', 'rem'],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        if (message.guild.musicData.private == true) {
            const privateRoleDB = new Keyv(process.env.DATABASE_URL, { namespace: 'private' })
            privateRoleDB.on('error', err => {
                console.log(`Connection error (Keyv): ${err}`)
            })
            const privateRole = await privateRoleDB.get(message.guild.id)
            if (!message.member.roles.cache.find(r => r.id === privateRole)) {
                const embed = new MessageEmbed()
                    .setDescription(`The bot is currently in DJ only mode | DJ Role: <@&${privateRole}>`)
                    .setColor("RED")
                return message.channel.send(embed)
            }
        }
    }
}