const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const Keyv = require('keyv')

module.exports = {
    name: 'warn',
    description: 'Warns a user',
    modOnly: true,
    async execute(message, args) {
        /*
        const embed = new MessageEmbed()
            .setDescription(`This command is not ready for use!`)
            .setColor("RED")
        return message.channel.send(embed)
         */
        if (!args) {
            const embed = new MessageEmbed()
                .setDescription("You did not provide any arguments.")
                .setColor("RED")
            return message.channel.send(embed)
        }

        const loadingEmb = new MessageEmbed()
            .setColor("RED")
            .setDescription("Loading...")
        let loading = await message.channel.send(loadingEmb)

        const memberMsg = message.mentions.users.first()
        const mbr = message.guild.members.cache.find(m => m.user.id === memberMsg.id)
        args.shift()
        const reason = args.join(' ')

        const db = new Keyv(process.env.DATABASE_URL, { namespace: `${message.guild.id}-warns` })
        db.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
            const embed = new MessageEmbed()
                .setDescription(`Failed to connect to the Keyv database | Cancelled`)
                .setColor("RED")
            return loading.edit(embed)
        })

        const warned = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`**${mbr.toString()} was warned** |  ${reason || "No reason provided"}`)
        loading.edit(warned)
    }
}