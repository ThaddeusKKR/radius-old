const { MessageEmbed } = require('discord.js')
const { globalPrefix } = require('../config.json')
const Keyv = require('keyv')

module.exports = {
    name: 'userinfo',
    description: 'Shows you information about a user (Mention).',
    aliases: ['ui', 'user'],
    async execute(message, args) {

        const db = new Keyv(process.env.DATABASE_URL, { namespace: 'prefixes'})
        db.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
            const embed = new MessageEmbed()
                .setDescription(`Failed to connect to the Keyv database.`)
                .setColor("RED")
            return message.channel.send(embed)
        })
        const prefix = await db.get(message.guild.id) || globalPrefix

        let usr = message.mentions.users.first()
        if (!usr) {
            usr = message.guild.members.cache.get(args[0])
        } else {
            usr = message.member.user
        }
        if (!usr) {
            const emb = new MessageEmbed()
                .setDescription("I can't find your information.")
                .setColor("RED")
            message.channel.send(emb)
            return;
        }
        const mbr = message.guild.members.cache.find(member => member.user.id === usr.id)
        if (!mbr) {
            const emb = new MessageEmbed()
                .setDescription(`Could not find information for user ${args[0]}`)
                .setColor("RED")
            return message.channel.send(emb)
        }
        let pres
        let hasPres = false
        if (mbr.presence.activities.length != 0) hasPres = true
        if (hasPres == true) {
            if (mbr.presence.activities[0].type === "LISTENING") {
                pres = `Listening to **${mbr.presence.activities[0].details}** on **${mbr.presence.activities[0].name}**`
            } else if (mbr.presence.activities[0].type === "CUSTOM_STATUS") {
                pres = `Custom status | \`${mbr.presence.activities[0].state}\``
            } else if (mbr.presence.activities[0].type === "STREAMING" && mbr.presence.activities[0].url.includes("twitch.tv")) {
                pres = `Streaming **${mbr.presence.activities[0].name}** on **Twitch**`
            } else {
                let lower = mbr.presence.activities[0].type.toLowerCase()
                pres = `${capitalise(lower)} **${mbr.presence.activities[0].name}**`
            }
        } else {
            pres = "No activity detected"
        }
        const user = mbr.user
        let roles = [];
        mbr.roles.cache.forEach(role => roles.push(role.id))
        roles.pop()
        roles = roles.join('>, <@&')
        let r
        if (roles.length === 0) {
            r = `No roles`
        } else {
            r = `<@&${roles}>`
        }
        let isBot
        if (user.bot == false) {
            isBot = "No"
        } else {
            isBot = "Yes"
        }
        let nick;
        if (mbr.nickname === null) {
            nick = "No nickname"
        } else {
            nick = mbr.nickname
        }
        const userinfo = new MessageEmbed()
            .setTitle("User Information")
            .setDescription(`User information for ${mbr.toString()}`)
            .setColor("PURPLE")
            .addField(`Username`, mbr.user.username, true)
            .addField(`Discriminator`, mbr.user.discriminator, true)
            .addField(`Bot`, isBot, true)
            .addField(`User ID`, mbr.user.id, true)
            .addField(`Nickname`, nick, true)
            .addField(`Signup Date`, mbr.user.createdAt)
            .addField(`Join Date`, mbr.joinedAt)
            .addField(`Activity`, `${pres}`)
            .addField(`Roles (${mbr.roles.cache.size-1})`, `${r}`)
            .setThumbnail(mbr.user.avatarURL())
        message.channel.send(userinfo)

        function capitalise (s) {
            if (typeof s !== 'string') return ''
            return s.charAt(0).toUpperCase() + s.slice(1)
        }
    }
}