const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'move',
    description: 'Moves a song to another position in queue.',
    aliases: ['mv'],
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
        const oldPos = args[0]
        const newPos = args[1]

        if (oldPos < 1 || oldPos > message.guild.musicData.queue.length || newPos < 1 || newPos > message.guild.musicData.queue.length || oldPos == newPos) {
            const errorEmb = new MessageEmbed()
                .setDescription(`You entered an invalid song number.`)
                .setColor("RED")
            return message.channel.send(errorEmb)
        }
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const noVoice = new MessageEmbed()
                .setDescription(`You are not in a voice channel!`)
                .setColor("RED")
            return message.channel.send(noVoice)
        }
        let autoDisable = false
        if (typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const noSong = new MessageEmbed()
                .setDescription(`You are not in the same voice channel as the bot.`)
                .setColor("RED")
            return message.channel.send(noVoice)
        } else if (message.guild.musicData.loopSong) {
            message.guild.musicData.loopSong = false
            autoDisable = true
        }

        const song = message.guild.musicData.queue[oldPos - 1]

        arrayMove(message.guild.musicData.queue, oldPos - 1, newPos - 1)

        const embed = new MessageEmbed()
            .setDescription(`[${song.title}](${song.url}) has been moved to position ${newPos}.`)
            .setColor("GREEN")
        message.guild.musicData.loopSong = true
        return message.channel.send(embed)

        function arrayMove (arr, oldIndex, newIndex) {
            while (oldIndex < 0) {
                oldIndex += arr.length
            }
            while (newIndex < 0) {
                newIndex += arr.length;
            }
            if (newIndex >= arr.length) {
                var k = newIndex - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
            return arr;
        }
    }
}