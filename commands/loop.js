const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'loop',
    description: 'Toggles loop of the current song / queue (defaults to song)',
    aliases: ['lp', 'repeat'],
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
        if (args[0] != "q" && args[0] != "queue" && args[0] != "song" && args[0] != "np" && args[0] != "s" && args[0] != "current") {
            const embed = new MessageEmbed()
                .setDescription(`Invalid loop type. Available types: \`song\`, \`queue\`.`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        if (args[0] == "q" || args[0] == "queue") {
            if (message.guild.musicData.loopSong == true) {
                const embed = new MessageEmbed()
                    .setDescription(`Song loop is already on - turn off song loop / skip the current song before turning on queue loop.`)
                    .setColor("GREEN")
                return message.channel.send(embed)
            }
            if (message.guild.musicData.loopQueue == true) {
                message.guild.musicData.loopQueue = false;
                const embed = new MessageEmbed()
                    .setDescription(`Queue loop is now disabled. There are ${message.guild.musicData.queue.length} songs in queue.`)
                    .setColor("GREEN")
                return message.channel.send(embed)
            } else {
                message.guild.musicData.loopQueue = true;
                const embed = new MessageEmbed()
                    .setDescription(`Queue loop is now enabled. There are ${message.guild.musicData.queue.length} songs in queue.`)
                    .setColor("GREEN")
                return message.channel.send(embed)
            }
        } else if (args[0] == "song" || args[0] == "np" || args[0] == "s" || args[0] == "current") {
            if (message.guild.musicData.loopQueue == true) {
                const embed = new MessageEmbed()
                    .setDescription(`Queue loop is already on - turn off queue loop before turning on song loop.`)
                    .setColor("GREEN")
                return message.channel.send(embed)
            }
            if (message.guild.musicData.loopSong == true) {
                message.guild.musicData.loopSong = false;
                const embed = new MessageEmbed()
                    .setDescription(`No longer looping the currently playing song.`)
                    .setColor("GREEN")
                return message.channel.send(embed)
            } else {
                message.guild.musicData.loopSong = true;
                const embed = new MessageEmbed()
                    .setDescription(`Now looping the currently playing song. `)
                    .setColor("GREEN")
                return message.channel.send(embed)
            }
        }

    }
}