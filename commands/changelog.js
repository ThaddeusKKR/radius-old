const { MessageEmbed } = require('discord.js')
const { globalPrefix } = require('../config.json')
const Keyv = require('keyv')

module.exports = {
    name: 'changelog',
    description: 'Shows the most recent changelog.',
    aliases: ['cl'],
    modOnly: false,
    ownerOnly: false,
    async execute(message, args) {
        let version = args[0]
        if (!args.length) version = 'latest'
        const embed = new MessageEmbed()
            .setDescription(`Here is the changelog for RavenBot \`${version}\`.`)
            .addField(`Changelog`, "```diff\n" +
                "- Commit: v22b560 (v117)\n" +
                "+ added a prefix command\n" +
                "- removed global prefix after setting server prefix\n" +
                "+ added this changelog\n" +
                "+ made it such that userinfo works with user ids as a argument\n" +
                "+ made a working play command (haha music features coming soon)\n" +
                "+ changed the default volume to 40%\n" +
                "+ added a bunch of other music commands\n" +
                "```")
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp()
            .setColor("RANDOM")
        message.channel.send(embed)
    }
}