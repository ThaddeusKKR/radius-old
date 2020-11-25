const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'invite',
    description: 'Sends you a link to invite the bot to your server.',
    aliases: ['inv'],
    category: 'info',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        const embed = new MessageEmbed()
            .setTitle(`Invite the bot to your server`)
            .setDescription(`Click [here](https://radius.tk/invite) to invite Radius to your server.`)
            .setColor("PURPLE")
        return message.channel.send(embed)
    }
}