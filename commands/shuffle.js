const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'shuffle',
    description: 'Shuffles the song queue.',
    aliases: ['sh'],
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
        } else if (message.guild.musicData.loopSong == true) {
            message.guild.musicData.loopSong = false
        }
        if (message.guild.musicData.queue.length < 1) {
            const embed = new MessageEmbed()
                .setDescription(`There are no songs in queue!`)
                .setColor("RED")
            return message.channel.send(embed)
        }

        shuffleQueue(message.guild.musicData.queue);

        const embed = new MessageEmbed()
            .setDescription(`Shuffled the queue. Use the \`queue\` command to view the new queue.`)
            .setColor("GREEN")
        return message.channel.send(embed)

        function shuffleQueue(queue) {
            for (let i = queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue[i], queue[j]] = [queue[j], queue[i]];
            }
        }
    }
}