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
        channel.join().then(function(connection) {
            const dispatcher = connection
            if (message.guild.musicData.queue) {
                message.guild.musicData.queue.forEach(song => song.voiceChannel = channel)
            }
        })
        embed
            .setColor("GREEN")
            .setDescription(`Connected to \`${channel.name}\` (${channel.bitrate}kbps)\n`)
        message.channel.send(embed)
    }
}