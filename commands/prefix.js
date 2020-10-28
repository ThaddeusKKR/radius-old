const { MessageEmbed } = require('discord.js')
const { maxPrefixLength } = require('../config.json')

module.exports = {
    name: 'prefix',
    description: 'Sets the prefix for this server.',
    aliases: [],
    modOnly: true,
    async execute(message, args) {
        if (!args.length) {
            const embed = new MessageEmbed()
                .setDescription(`The current prefix for this server is \`${await prefixes.get(message.guild.id) || globalPrefix}\``)
                .setColor("PURPLE")
            return message.channel.send(embed)
        } else if (args.length > 1) {
            const embed = new MessageEmbed()
                .setDescription(`You may only provide one argument`)
                .setColor("PURPLE")
            return message.channel.send(embed)
        }
        if (args[0].length > maxPrefixLength) {
            const embed = new MessageEmbed()
                .setDescription(`The prefix cannot be more than ${maxPrefixLength} characters.`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const db = new Keyv(process.env.DATABASE_URL)
        keyv.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
            const embed = new MessageEmbed()
                .setDescription(`Failed to connect to the Keyv database.`)
                .setColor("RED")
            return message.channel.send(embed)
        })
        db.set(message.guild.id, args[0])
        const embed = new MessageEmbed()
            .setDescription(`Successfully set the server prefix to \`${args[0]}\``)
            .setColor("GREEN")
        message.channel.send(embed)
    }
}