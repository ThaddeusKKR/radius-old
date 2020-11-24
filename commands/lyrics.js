const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')
const Pagination = require('discord-paginationembed');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = {
    name: 'lyrics',
    description: 'Shows the lyrics of the current song / provided argument',
    aliases: ['ly', 'lr'],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        let songName = args.join(' ')
        if (songName == '' && message.guild.musicData.isPlaying) {
            songName = message.guild.musicData.nowPlaying.title
        } else if (songName == '' && !message.guild.musicData.isPlaying) {
            const embed = new MessageEmbed()
                .setDescription(`There isn't a song playing now - please play a song or enter a song name.`)
                .setColor("RED")
            return message.channel.send(embed)
        }

        songName = songName.replace(/ *\([^)]*\) */g, '');
        songName = songName.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

        const searchingEmbed = new MessageEmbed()
            .setDescription(`Searching... \`${songName}\``)
            .setColor("ORANGE")
        const searching = await message.channel.send(searchingEmbed)

        var url = `https://api.ksoft.si/lyrics/search?q=${encodeURI(songName)}`

        const headers = {
            Authorization: `Bearer ${process.env.LYRICSAPI}`
        }

        try {
            const body = await fetch(url, { headers })
            const result = await body.json()

            if (!result.data[0].lyrics) {
                const errorEmbed = new MessageEmbed()
                    .setDescription(`Could not find lyrics for \`${songName}\`. Please be more specific.`)
                    .setColor("RED")
                return msg.edit(errorEmbed)
            }

            const lyrics = result.data[0].lyrics
            const lyricsIndex = Math.round(lyrics.length / 2048) + 1;
            const lyricsArray = [];

            for (let i = 1; i <= lyricsIndex; ++i) {
                let b = i - 1;
                lyricsArray.push(
                    new MessageEmbed()
                        .setTitle(`Lyrics`)
                        .setDescription(lyrics.slice(b * 2048, i * 2048))
                        .setFooter(`Powered by KSoft.si`)
                )
            }
            const lyricsEmb = new Pagination.Embeds()
                .setArray(lyricsArray)
                .setAuthorizedUsers([message.author.id])
                .setChannel(message.channel)
                .setURL(result.data[0].url)
                .setColor("PURPLE")

            msg.edit(lyricsEmb.build())
            return
        } catch (err) {
            const errEmbed = new MessageEmbed()
                .setTitle(`Error`)
                .setDescription(`There was an error while attempting to get lyrics for \`${songName}\`.`)
                .addField(`Detailed information`, `\`\`\`js\n${err}\n\`\`\``)
                .setColor("RED")
            message.channel.send(errEmbed)
            console.log(err)
            return;
        }
    }
}