const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'end',
    description: 'Ends a specified poll.',
    aliases: [],
    category: 'tools',
    async execute(message, args) {
        message.delete()
        const channel = message.channel
        const pollMsg = await channel.messages.fetch(args[0]);
        const emb = new MessageEmbed()
            .setDescription("You provided an invalid poll (message) ID.")
            .setColor("RED")
        if (!pollMsg) return message.channel.send(emb)

        if (pollMsg.embeds[0].footer.text.includes("Ended") == true) {
            const embed = new MessageEmbed()
                .setDescription("This poll already ended.")
                .setColor("RED")
            return message.channel.send(embed);
        } else if (pollMsg.embeds[0].footer.text.includes(message.author.id) == false) {
            const embed = new MessageEmbed()
                .setDescription("You can only end a poll that you started.")
                .setColor("RED")
            return message.channel.send(embed);
        }

        const yesNum = pollMsg.reactions.cache.get('👍').count
        const noNum = pollMsg.reactions.cache.get('👎').count

        const embed = new MessageEmbed()
            .setDescription(`**This poll has ended.**\n${pollMsg.embeds[0].description}\n\n__**Results:**__\n:thumbsup: : ${yesNum-1}  |  :thumbsdown: : ${noNum-1}`)
            .setColor("RED")
            .setFooter("Ended")
            .setTimestamp()
        pollMsg.edit(embed)
        await pollMsg.reactions.removeAll()
    }
}
