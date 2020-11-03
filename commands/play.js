const { MessageEmbed } = require('discord.js')
const { globalPrefix } = require('../config.json')
const ytdl = require('ytdl-core')
const search = require('youtube-search')
const Keyv = require('keyv')

module.exports = {
    name: 'play',
    description: 'Plays a song from YouTube.',
    aliases: ['p'],
    modOnly: false,
    ownerOnly: false,
    async execute(message, args) {
        const db = new Keyv(process.env.DATABASE_URL, { namespace: 'prefixes'})
        db.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
        })
        const serverPrefix = await db.get(message.guild.id) || globalPrefix
        if (!args) {
            if (message.guild.musicData.isPlaying == false) {
                message.guild.musicData.isPlaying = true
                const embed = new MessageEmbed()
                    .setDescription("Resumed the music.")
                    .setColor("GREEN")
                return message.channel.send(embed)
            } else {
                const embed = new MessageEmbed()
                    .setDescription("You did not provide any arguments!")
                    .setColor("RED")
                return message.channel.send(embed)
            }
        }

        const query = args.join(' ')

        var opts = {
            maxResults: 1,
            key: process.env.YTKEY
        }

        const embed = new MessageEmbed()
            .setDescription("Searching...")
            .setColor("ORANGE")
        const msg = await message.channel.send(embed)

        search(query, opts, function (error, results) {
            if (error) {
                const errEmb = new MessageEmbed()
                    .setDescription(`Unable to find results for \`${query}\`.`)
                    .setColor("RED")
                msg.edit(errEmb)
                console.log(error)
                return;
            }

            console.log(results)
        })
    }
}