const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'volume',
    description: 'Changes the volume of the player.',
    aliases: ['vol'],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        if (message.guild.musicData.private == true) {
            const privateRoleDB = new Keyv(process.env.DATABASE_URL, { namespace: 'private' })
            privateRoleDB.on('error', err => {
                console.log(`Connection error (Keyv): ${err}`)
            })
            const privateRole = await privateRoleDB.get(message.guild.id)
            if (!message.member.roles.cache.find(r => r.id === privateRole)) {
                const embed = new MessageEmbed()
                    .setDescription(`The bot is currently in DJ only mode | DJ Role: <@&${privateRole}>`)
                    .setColor("RED")
                return message.channel.send(embed)
            }
        }
        let voiceChannel = message.member.voice.channel
        if (!voiceChannel) {
            const noVoice = new MessageEmbed()
                .setDescription(`You are not in a voice channel!`)
                .setColor("RED")
            return message.channel.send(noVoice)
        }
        if (typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const noSong = new MessageEmbed()
                .setDescription(`There is nothing playing.`)
                .setColor("RED")
            return message.channel.send(noSong)
        } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            const diffVc = new MessageEmbed()
                .setDescription(`You are not in the same voice channel as the bot.`)
                .setColor("RED")
            return message.channel.send(diffVc)
        }
        if (!args.length) {
            const embed = new MessageEmbed()
                .setDescription(`You did not provide any arguments!`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const wantedVolume = args[0]
        if (args.length > 1) {
            if (args[1].includes('-o' || '--override')) {
                if (message.author.id != process.env.OWNERID) {
                    const embed = new MessageEmbed()
                        .setDescription(`You do not have permission to use the \`override\` flag.`)
                        .setColor("RED")
                    return message.channel.send(embed)
                }
                const vol = wantedVolume / 100
                message.guild.musicData.volume = volume;
                message.guild.musicData.songDispatcher.setVolume(volume);
                const embed = new MessageEmbed()
                    .setDescription(`**[ OVERRIDE ]** Volume set to **${wantedVolume}%**`)
                    .setColor("GREEN")
                return message.channel.send(embed)
            }
        }
        if (wantedVolume > 100 || wantedVolume < 0) {
            const embed = new MessageEmbed()
                .setDescription(`Volume must be from **0%** to **100%**`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const volume = wantedVolume / 100
        message.guild.musicData.volume = volume;
        message.guild.musicData.songDispatcher.setVolume(volume);
        const embed = new MessageEmbed()
            .setDescription(`Volume set to **${wantedVolume}%**.`)
            .setColor("GREEN")
        return message.channel.send(embed)
    }
}