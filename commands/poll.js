const { MessageEmbed } = require('discord.js')
const { prefix } = require('../config.json')

module.exports = {
    name: 'poll',
    description: 'Start a poll using reactions.',
    aliases: ['vote'],
    category: 'tools',
    async execute(message, args) {
        message.delete()
        if (!args.length) {
            const embed = new MessageEmbed()
                .setDescription("You did not provide any arguments!")
                .setColor("RED")
            return message.channel.send(embed)
        }
        const question = args.join(' ')
        const embed = new MessageEmbed()
            .setColor("RED")
            .setDescription("Processing...")
            .setTimestamp()
        const msg = await message.channel.send(embed)
        await msg.react('👍')
        await msg.react('👎')
        const newEmbed = new MessageEmbed()
            .setDescription(question)
            .setColor("PURPLE")
            .setAuthor(`${message.author.tag}`, message.author.avatarURL())
            .setFooter(`${message.author.id} | ${prefix}end ${msg.id}`)
            .setTimestamp()
        msg.edit(newEmbed)
    }
}