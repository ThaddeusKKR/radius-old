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
        const songNumber = args[0]
        if (songNumber < 1 || songNumber >= message.guild.musicData.queue.length) {
            const errorEmb = new MessageEmbed()
                .setDescription(`You entered an invalid song number.`)
                .setColor("RED")
            return message.channel.send(errorEmb)
        }
        let voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            const noVoice = new MessageEmbed()
                .setDescription(`You are not in a voice channel!`)
                .setColor("RED")
            return message.channel.send(noVoice)
        }
        if (typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const noSong = new MessageEmbed()
                .setDescription(`There is nothing playing.`)
                .setColor("RED")
            return message.channel.send(noSong)
        } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            const diffVc = new MessageEmbed()
                .setDescription(`You are not in the same voice channel as the bot.`)
                .setColor("RED")
            return message.channel.send(diffVc)
        }

        const removedSong = message.guild.musicData.queue[songNumber - 1]

        message.guild.musicData.queue.splice(songNumber - 1, 1);

        const embed = new MessageEmbed()
            .setDescription(`Removed song ${songNumber} ([${removedSong.title}](${removedSong.url})) from queue.`)
            .setColor("GREEN")
        return message.channel.send(embed)
    }
}