const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'skip',
    description: 'Skips the currently playing song',
    aliases: ['s'],
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
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const erEmb = new MessageEmbed()
                .setDescription("You are not in a voice channel!")
                .setColor("RED")
            return message.channel.send(erEmb)
        }
        if (typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const embed = new MessageEmbed()
                .setDescription(`There is nothing playing right now!`)
                .setColor("RED")
            return message.channel.send(embed)
        } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            const embed = new MessageEmbed()
                .setDescription(`You are not in the same voice channel as the bot.`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const skippedSong = message.guild.musicData.nowPlaying
        message.guild.musicData.loopSong = false;
        message.guild.musicData.songDispatcher.end();
        const embed = new MessageEmbed()
            .setDescription(`Skipped [${skippedSong.title}](${skippedSong.url}).`)
            .setColor("GREEN")
        message.channel.send(embed)
    }
}