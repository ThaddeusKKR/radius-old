const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'info',
    description: 'Shows information such as requested by for a song in queue.',
    aliases: [],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        const index = args[0] - 1
        if (!message.guild.musicData.nowPlaying) {
            const embed = new MessageEmbed()
                .setDescription(`There is no song playing right now!`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        if (message.guild.musicData.queue.length == 0) {
            const embed = new MessageEmbed()
                .setDescription(`There are no songs in queue!`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        if (args[0] < 1 && args[0] >= message.guild.musicData.queue.length) {
            const errorEmb = new MessageEmbed()
                .setDescription(`You entered an invalid song number.`)
                .setColor("RED")
            return message.channel.send(errorEmb)
        }
        const song = message.guild.musicData.queue[index]

        const embed = new MessageEmbed()
            .setTitle(`Information about song ${args[0]}`)
            .addField(`Title`, song.title)
            .addField(`URL`, song.url)
            .addField(`Duration`, song.duration, true)
            .addField(`Requested by`, song.requestedBy.toString(), true)
            .addField(`Position in queue`, index + 1)
            .setColor("PURPLE")
            .setImage(song.thumbnail)
        return message.channel.send(embed)
    }
}