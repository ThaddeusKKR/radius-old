const { MessageEmbed } = require('discord.js')
const { globalPrefix } = require('../config.json')
const ytdl = require('ytdl-core')
const Youtube = require('simple-youtube-api')
const Keyv = require('keyv')

module.exports = {
    name: 'play',
    description: 'Plays a song from YouTube.',
    aliases: ['p'],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args) {
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
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const erEmb = new MessageEmbed()
                .setDescription("You are not in a voice channel!")
                .setColor("RED")
            return message.channel.send(erEmb)
        }
        const youtube = new Youtube(process.env.YTKEY)
        const user = message.author
        const db = new Keyv(process.env.DATABASE_URL, { namespace: 'prefixes'})
        db.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
        })
        const serverPrefix = await db.get(message.guild.id) || globalPrefix
        if (!args.length) {
            const embed = new MessageEmbed()
                .setDescription(`You did not provide any arguments!`)
                .setColor("RED")
            return message.channel.send(embed)
        }

        let query = args.join(' ')

        const loading = new MessageEmbed()
            .setDescription("Searching...")
            .setColor("ORANGE")
        const msg = await message.channel.send(loading)

        if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
            const playlist = await youtube.getPlaylist(query).catch(function() {
                const embed = new MessageEmbed()
                    .setColor("RED")
                    .setDescription(`<:youtube:775411612248571904> | Playlist is either private or does not exist.`)
                return msg.edit(embed)
            })
            const videoArr = await playlist.getVideos().catch(function() {
                const embed = new MessageEmbed()
                    .setColor("RED")
                    .setDescription(`<:youtube:775411612248571904> | Could not get one or more songs from the playlist.`)
                return msg.edit(embed)
            })
            const processingEmb = new MessageEmbed()
                .setDescription(`<:youtube:775411612248571904> | Processing playlist...`)
                .setColor("ORANGE")
            msg.edit(processingEmb)

            for (let i = 0; i < videoArr.length; i++) {
                if (videoArr[i].raw.status.privacyStatus == 'private') continue;
                try {
                    const video = await videoArr[i].fetch();
                    message.guild.musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user))
                } catch (err) {
                    console.error(err)
                }
            }
            if (message.guild.musicData.isPlaying == false) {
                const added = new MessageEmbed()
                    .setDescription(`<:youtube:775411612248571904> | Playlist **${playlist.title}** (${videoArr.length} tracks) has been added to the queue.`)
                    .setColor("GREEN")
                msg.edit(added)
                message.guild.musicData.isPlaying = true
                return playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
                const added = new MessageEmbed()
                    .setDescription(`<:youtube:775411612248571904> | Playlist **${playlist.title}** (${videoArr.length} tracks) has been added to the queue.`)
                    .setColor("GREEN")
                return msg.edit(added)
            }
        }

        if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            query = query.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
            const id = query[2].split(/[^0-9a-z_\-]/i)[0];
            const video = await youtube.getVideoByID(id).catch(err => {
                console.error(err)
                const errorEmbed = new MessageEmbed()
                    .setDescription(`<:youtube:775411612248571904> | Could not get the video from the URL you provided.`)
                    .setColor("RED")
                return msg.edit(errorEmbed)
            })
            const addEmbed = new MessageEmbed()
                .setTitle("Added to queue")
                .addField(`Title`, `[${video.title}](${video.url})`)
                .addField("Duration", formatDuration(video.duration), true)
                .addField(`Requested by`, message.author.toString(), true)
                .addField(`Position in queue`, `${message.guild.musicData.queue.length+1}`)
                .setThumbnail(video.thumbnail)
                .setColor("GREEN")
            message.guild.musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user))
            if (message.guild.musicData.isPlaying == false || typeof message.guild.musicData.isPlaying == 'undefined') {
                message.guild.musicData.isPlaying = true;
                msg.edit(addEmbed)
                return playSong(message.guild.musicData.queue, message)
            } else if (message.guild.musicData.isPlaying == true) {
                return msg.edit(addEmbed)
            };
        }

        // YouTube search (if the user provided a video name)

        const videos = await youtube.searchVideos(query, 1).catch(err => {
            const errorEmbed = new MessageEmbed()
                .setDescription(`<:youtube:775411612248571904> | An error occurred when searching for the video.`)
                .setColor("RED")
            console.error(err)
            return msg.edit(errorEmbed)
        })

        if (videos.length < 1) {
            const errorEmbed = new MessageEmbed()
                .setDescription(`<:youtube:775411612248571904> | Could not find results for your query. Try again or be more specific.`)
                .setColor("RED")
            return msg.edit(errorEmbed)
        };

        youtube.getVideoByID(videos[0].id).then(function(video) {
            const addedEmbed = new MessageEmbed()
                .setTitle("Added to queue")
                .setThumbnail(videos[0].thumbnail)
                .addField(`Title`, `[${video.title}](https://www.youtube.com/watch?v=${videos[0].id})`)
                .addField(`Duration`, formatDuration(video.duration), true)
                .addField(`Requested by`, message.author.toString(), true)
                .addField(`Position in queue`, message.guild.musicData.queue.length + 1)
                .setThumbnail(video.thumbnail)
                .setColor("GREEN")
            message.guild.musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user))
            if (message.guild.musicData.isPlaying == false) {
                message.guild.musicData.isPlaying = true;
                playSong(message.guild.musicData.queue, message)
                return msg.edit(addedEmbed)
            } else if (message.guild.musicData.isPlaying = true) {
                return msg.edit(addedEmbed)
            }
        })


        function playSong(queue, message) {
            queue[0].voiceChannel
                .join()
                .then(function(connection) {
                    const dispatcher = connection
                        .play(ytdl(queue[0].url, {
                            quality: 'highestaudio',
                            filter: 'audioonly',
                            highWaterMark: 1 << 25
                        }))
                        .on('start', function() {
                            message.guild.musicData.songDispatcher = dispatcher
                            dispatcher.setVolume(message.guild.musicData.volume);
                            const videoEmb = new MessageEmbed()
                                .setColor("PURPLE")
                                .addField(`Title`, `[${queue[0].title}](${queue[0].url})`)
                                .addField(`Duration`, `${queue[0].duration}`)
                                .setThumbnail(queue[0].thumbnail)
                                .setFooter(
                                    `Requested by ${queue[0].memberDisplayName} | ➡`,
                                    queue[0].memberAvatar
                                );
                            if (queue[1] && !message.guild.musicData.loopSong) videoEmb.addField(`Next in queue`, `[${queue[1].title}](${queue[1].url})`)
                            if (message.guild.musicData.loopSong == true) {
                                videoEmb.setFooter(`Requested by ${queue[0].memberDisplayName} | 🔂`,
                                    queue[0].memberAvatar)
                            }
                            if (message.guild.musicData.loopQueue == true) {
                                videoEmb.setFooter(`Requested by ${queue[0].memberDisplayName} | 🔁`,
                                    queue[0].memberAvatar)
                            }
                            message.channel.send(videoEmb);
                            message.guild.musicData.nowPlaying = queue[0];
                            queue.shift();
                            return;
                        })
                        .on('finish', function() {
                            queue = message.guild.musicData.queue;
                            if (message.guild.musicData.loopSong) {
                                queue.unshift(message.guild.musicData.nowPlaying);
                            } else if (message.guild.musicData.loopQueue) {
                                queue.push(message.guild.musicData.nowPlaying);
                            }
                            if (queue.length >= 1) {
                                playSong(queue, message)
                                return;
                            } else {
                                message.guild.musicData.isPlaying = false;
                                message.guild.musicData.nowPlaying = null;
                                message.guild.musicData.songDispatcher = null;
                                if (message.guild.me.voice.channel && message.guild.musicData.skipTimer) {
                                    message.guild.me.voice.channel.leave();
                                    message.guild.musicData.skipTimer = false;
                                    return;
                                }
                                if (message.guild.me.voice.channel) {
                                    setTimeout(function onTimeOut() {
                                        if (message.guild.musicData.isPlaying == false && message.guild.me.voice.channel) {
                                            message.guild.me.voice.channel.leave();
                                            const leftEmb = new MessageEmbed()
                                                .setDescription(`Left the voice channel due to inactivity.`)
                                                .setColor("GREEN")
                                        }
                                    }, 90000)
                                }
                            }
                        })
                        .on('error', function(e) {
                            const errorEmbed = new MessageEmbed()
                                .setDescription(`Critical Error | Unable to play song - stopped.`)
                                .setColor("RED")
                            message.channel.send(errorEmbed)
                            console.error(e);
                            if (queue.length > 1) {
                                queue.shift();
                                classThis.playSong(queue, message);
                                return;
                            }
                            message.guild.musicData.queue.length = 0;
                            message.guild.musicData.isPlaying = false;
                            message.guild.musicData.nowPlaying = null;
                            message.guild.musicData.loopSong = false;
                            message.guild.musicData.songDispatcher = null;
                            message.guild.me.voice.channel.leave();
                            return;
                        });
                })
                .catch(err => {
                    const noPermEmb = new MessageEmbed()
                        .setDescription(`I do not have permission to join your channel.`)
                        .setColor("RED")
                    message.channel.send(noPermEmb)
                    message.guild.musicData.queue.length = 0;
                    message.guild.musicData.isPlaying = false;
                    message.guild.musicData.nowPlaying = null;
                    message.guild.musicData.loopSong = false;
                    message.guild.musicData.songDispatcher = null;
                    if (message.guild.me.voice.channel) {
                        message.guild.me.voice.channel.leave();
                    }
                    return;
                })
        }

        function constructSongObj(video, voiceChannel, user) {
            let duration = formatDuration(video.duration);
            if (duration == '00:00') duration = 'LIVE';
            return {
                url: `https://www.youtube.com/watch?v=${video.raw.id}`,
                title: video.title,
                rawDuration: video.duration,
                duration,
                thumbnail: video.thumbnails.high.url,
                voiceChannel,
                memberDisplayName: user.username,
                requestedBy: user,
                memberAvatar: user.avatarURL('webp', false, 16)
            };
        }

        function formatDuration(durationObj) {
            const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
                durationObj.minutes ? durationObj.minutes : '00'
            }:${
                (durationObj.seconds < 10)
                    ? ('0' + durationObj.seconds)
                    : (durationObj.seconds
                    ? durationObj.seconds
                    : '00')
            }`;
            return duration;
        }

        function estTime(queue) {
            // Work on this later
        }
    }
}
