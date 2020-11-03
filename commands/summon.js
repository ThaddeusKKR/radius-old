const { MessageEmbed } = require('discord.js')
const { globalPrefix } = require('../config.json')
const Keyv = require('keyv')

module.exports = {
    name: 'summon',
    description: 'Summons the bot to your voice channel',
    aliases: ['join'],
    modOnly: false,
    ownerOnly: false,
    async execute(message, args) {
        const embed = new MessageEmbed()
        if (!message.member.voice.channel) {
            embed.setColor("RED")
            embed.setDescription("You are not connected to a voice channel.")
            return message.channel.send(embed)
        }
        const channel = message.member.voice.channel
        await channel.join()
        const connection = message.guild.voice.connection
        embed
            .setColor("GREEN")
            .setDescription(`Connected to \`${channel.name}\` (${channel.bitrate})\n`)
    }
}