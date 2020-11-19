const { MessageEmbed } = require('discord.js')
 
module.exports = {
    name: 'kick',
    description: 'Kicks a user',
    category: 'moderation',
    aliases: [],
    modOnly: true,
    async execute(message, args) {
      message.delete()
      if (!args.length) {
        const embed = new MessageEmbed()
          .setDescription("You did not provide any arguments.")
          .setColor("RED")
        let msg = await message.channel.send(embed)
        msg.delete({ timeout: 5000})
        return;
      }
      const loading = new MessageEmbed()
        .setDescription("Processing...")
        .setColor("RED")
      const msg = await message.channel.send(loading)
      const memberMsg = message.mentions.users.first()
      const mbr = message.guild.members.cache.find(m => m.user.id === memberMsg.id)
      args.shift()
      let reason = args.join(' ')
      try {
        if (!reason) {
          reason = "No reason provided."
        }
        mbr.kick({ reason: reason })
        const embed = new MessageEmbed()
          .setDescription(`Kicked ${mbr.user.tag} | ${reason}`)
          .setColor("PURPLE")
        return msg.edit(embed)
      } catch (err) {
        console.log(err)
        const fail = new MessageEmbed()
          .setDescription(`Failed to kick ${mbr.user.toString()} | I may have insufficient permissions.`)
          .setColor("RED")
        msg.edit(fail)
        return msg.delete({ timeout: 5000})
      }
    }
}