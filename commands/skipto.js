const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'skipto',
    description: 'Skips to a specific song in the queue.',
    aliases: [],
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

        if (songNumber < 1 && songNumber >= message.guild.musicData.queue.length) {
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

        if (message.guild.musicData.queue < 1) {
            const noSongs = new MessageEmbed()
                .setDescription(`There are no songs in queue.`)
                .setColor("RED")
            return message.channel.send(noSongs)
        }

        const song = message.guild.musicData.queue[songNumber - 1]

        if (!message.guild.musicData.loopQueue) {
            message.guild.musicData.queue.splice(0, songNumber - 1);
            message.guild.musicData.loopSong = false;
            message.guild.musicData.songDispatcher.end();
            const embed = new MessageEmbed()
                .setDescription(`Skipped to [${song.title}](${song.url}).`)
                .setColor("GREEN")
            return message.channel.send(embed)
        } else if (message.guild.musicData.loopQueue) {
            const slicedBefore = message.guild.musicData.queue.slice(0, songNumber - 1);
            const slicedAfter = message.guild.musicData.queue.slice(songNumber - 1);
            message.guild.musicData.queue = slicedAfter.concat(slicedBefore);
            message.guild.musicData.songDispatcher.end();
            const embed = new MessageEmbed()
                .setDescription(`Skipped to [${song.title}](${song.url}).`)
                .setColor("GREEN")
            return message.channel.send(embed)
        }
    }
}