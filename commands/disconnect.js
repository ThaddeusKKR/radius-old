const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'disconnect',
    description: 'Disconnects the bot and stops all music.',
    aliases: ['dc', 'fuckoff', 'leave'],
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
        const embed = new MessageEmbed()
            .setDescription(`Disconnected.`)
            .setColor("GREEN")
        if (
            message.guild.musicData.isPlaying == false &&
            message.guild.me.voice.channel
        ) {
            message.guild.me.voice.channel.leave();
            message.channel.send(embed)
        } else if (message.guild.musicData.songDispatcher.paused) {
            message.guild.musicData.songDispatcher.resume();
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.loopSong = false;
            setTimeout(() => {
                message.guild.musicData.songDispatcher.end();
            }, 100);
            message.channel.send(embed)
            return;
        } else {
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.skipTimer = true;
            message.guild.musicData.loopSong = false;
            message.guild.musicData.loopQueue = false;
            message.guild.musicData.songDispatcher.end();
            message.channel.send(embed)
            return;
        }
    }
}