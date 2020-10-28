const { MessageEmbed } = require('discord.js')
const fs = require('fs')

module.exports = {
    name: 'warn',
    description: 'Warns a user',
    modOnly: true,
    async execute(message, args) {

        const embed = new MessageEmbed()
            .setDescription(`This command is not ready for use!`)
            .setColor("RED")
        return message.channel.send(embed)

      /*
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
        .setTitle("Warn")
        .setDescription(`${mbr.user.toString()} was warned.`)
        .addField(`Reason`, reason)
        .setColor("RANDOM")
      message.channel.send(warned)

      fs.readFile(`../../settings/${message.guild.id}-warnings.json`, 'utf8', (err, jsonString) => {
        if (err) {
          console.log("Failed to read the warnings file. Attempting to make one...")
          console.log(err)
          const embed = new MessageEmbed()
            .setDescription("Failed to read the warnings file for this guild. Attempting to make a new one.")
            .setFooter("Contact my owner for help.")
            .setColor("RED")
          message.channel.send(embed)
          fs
          return;
        }
        try {
          const warnings = JSON.parse(jsonString)
          console.log(warnings)
        } catch (err) {
          console.log(err)
        }
      })
       */
    }
}