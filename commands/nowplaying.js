const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'nowplaying',
    description: 'Shows you the currently playing song.',
    aliases: ['np'],
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
        if (!message.guild.musicData.nowPlaying) {
            const embed = new MessageEmbed()
                .setDescription(`There is no song playing right now!`)
                .setColor("RED")
            return message.channel.send(embed)
        }
        const video = message.guild.musicData.nowPlaying
        let description;
        if (video.duration == 'Live Stream') {
            description = '**LIVE**';
        } else {
            description = playbackBar(message, video);
        }

        let loopStatus;
        if (message.guild.musicData.loopQueue == true) {
            loopStatus = '🔁 (Queue)'
        } else if (message.guild.musicData.loopSong == true) {
            loopStatus = '🔂 (Current Song)'
        } else {
            loopStatus = '➡ (Disabled)'
        }

        const embed = new MessageEmbed()
            .setTitle("Now Playing")
            .setDescription(description)
            .addField(`Title`, `[${video.title}](${video.url})`, true)
            .addField(`Loop`, loopStatus, true)
            .setColor("PURPLE")
            .setImage(video.thumbnail)
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
        function playbackBar(message, video) {
            const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
            const passedTimeInMSObj = {
                seconds: Math.floor((passedTimeInMS / 1000) % 60),
                minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
                hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
            };
            const passedTimeFormatted = formatDuration(
                passedTimeInMSObj
            );

            const totalDurationObj = video.rawDuration;
            const totalDurationFormatted = formatDuration(
                totalDurationObj
            );

            let totalDurationInMS = 0;
            Object.keys(totalDurationObj).forEach(function(key) {
                if (key == 'hours') {
                    totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
                } else if (key == 'minutes') {
                    totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
                } else if (key == 'seconds') {
                    totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
                }
            });
            const playBackBarLocation = Math.round(
                (passedTimeInMS / totalDurationInMS) * 10
            );
            let playBack = '';
            for (let i = 1; i < 21; i++) {
                if (playBackBarLocation == 0) {
                    playBack = ':diamond_shape_with_a_dot_inside:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
                    break;
                } else if (playBackBarLocation == 10) {
                    playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:diamond_shape_with_a_dot_inside:';
                    break;
                } else if (i == playBackBarLocation * 2) {
                    playBack = playBack + ':diamond_shape_with_a_dot_inside:';
                } else {
                    playBack = playBack + '▬';
                }
            }
            playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
            return playBack;
        }
    }
}