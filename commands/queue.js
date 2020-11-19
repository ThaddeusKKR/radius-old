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
            .setElementsPerPage(10)
            .formatField('# - Song', function(e) {
                return `**${queueClone.indexOf(e) + 1}**: ${e.title}`;
            });

        queueEmbed.embed.setColor('PURPLE').setTitle(`Queue for ${message.guild.name}`)
        queueEmbed.build();
    }
}