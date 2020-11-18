const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'dj',
    description: 'Toggles DJ only mode.',
    aliases: ['djonly'],
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        const privateRoleDB = new Keyv(process.env.DATABASE_URL, { namespace: 'private' })
        privateRoleDB.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
        })
        if (message.guild.musicData.private == true) {
            const privateRole = await privateRoleDB.get(message.guild.id)
            if (!message.member.roles.cache.find(r => r.id === privateRole) || !message.member.hasPermission('ADMINISTRATOR')) {
                const embed = new MessageEmbed()
                    .setDescription(`The bot is currently in DJ only mode | DJ Role: <@&${privateRole}>`)
                    .setColor("RED")
                return message.channel.send(embed)
            }
        }
        if (!args.length) {
            let state;
            if (message.guild.musicData.private == false) {
                message.guild.musicData.private = true;
                state = "enabled"
            }
            if (message.guild.musicData.private == true) {
                message.guild.musicData.private = false;
                state = "disabled"
            }
            const embed = new MessageEmbed()
                .setDescription(`DJ mode ${state}.`)
                .setColor("GREEN")
            return message.channel.send(embed)
        }
        if (!message.mentions.roles.first() || !message.guild.roles.cache.find(r => r.id === args[0] || r.name === args[0])) {
            const err = new MessageEmbed()
                .setDescription(`You did not specify a role.`)
                .setColor("RED")
            return message.channel.send(err)
        }
        const roleID = message.mentions.roles.first().id || message.guild.roles.cache.find(r => r.id === args[0] || r.name === args[0])
        privateRoleDB.set(message.guild.id, roleID)
        const embed = new MessageEmbed()
            .setDescription(`DJ role for this server set to <@&${roleID}>`)
            .setColor("GREEN")
        return message.channel.send(embed)
    }
}