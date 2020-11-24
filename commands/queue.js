const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')
const Pagination = require('discord-paginationembed')

module.exports = {
    name: 'queue',
    description: 'Shows the current queue.',
    aliases: ['q'],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        if (!message.guild.musicData.nowPlaying) {
            const embed = new MessageEmbed()
                .setDescription(`There is no song playing right now!`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        if (message.guild.musicData.queue.length == 0 && message.guild.musicData.nowPlaying) {
            const embed = new MessageEmbed()
                .setTitle(`Queue for ${message.guild.name}`)
                .addField(`Now Playing`, `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url}) - ${mesasge.guild.musicData.nowPlaying.requestedBy.toString()}`)
                .addField(`# - Song`, `No songs in queue.`)
                .setColor("PURPLE")
            return message.channel.send(embed)
        }
        if (message.guild.musicData.queue.length == 0) {
            const embed = new MessageEmbed()
                .setDescription(`There are no songs in queue!`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const queueClone = message.guild.musicData.queue;
        const queueEmbed = new Pagination.FieldsEmbed()
            .setArray(queueClone)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setElementsPerPage(8)
            .formatField(`# - Song`, function(e) {
                let title = e.title.slice(0, 64)
                title = `${title}...`
                return `**${queueClone.indexOf(e) + 1}**: [${title}](${e.url}) (${e.requestedBy.toString()})`;
            });


        queueEmbed.embed.setColor('PURPLE').setTitle(`Queue for ${message.guild.name}`)
        queueEmbed.build();
    }
}