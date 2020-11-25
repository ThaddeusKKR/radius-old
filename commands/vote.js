const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'vote',
    description: 'Sends you a link to vote for the bot.',
    aliases: ['vt'],
    category: 'info',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        const embed = new MessageEmbed()
            .setDescription(`Vote for the bot [here](https://radius.tk/vote).`)
            .setColor("PURPLE")
        return message.channel.send(embed)
    }
}