const { MessageEmbed } = require('discord.js')
const fs = require('fs')

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

      const memberMsg = message.mentions.users.first()
      const mbr = message.guild.members.cache.find(m => m.user.id === memberMsg.id)
      args.shift()
      const reason = args.join(' ')

      const warned = new MessageEmbed()
          .setColor("GREEN")
          .setDescription(`${mbr.toString()} was warned |  ${reason || "No reason provided"}`)
      message.channel.send(warned)
    }
}