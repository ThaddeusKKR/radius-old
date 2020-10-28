const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'ping',
    description: 'Check if the bot is alive.',
    aliases: ['pi'],
    category: 'info',
    async execute(message, args) {
        const client = message.client
        const embed = new MessageEmbed()
            .setDescription("Pinging...")
            .setColor("RED")
        let msg = await message.channel.send(embed)

        const editEmb = new MessageEmbed()
            .setDescription(`**Server:** \`${msg.createdAt - message.createdAt}ms\`\n**Websocket:** \`${Math.round(client.ws.ping)}ms\`\n**Uptime:** \`${msToTime(client.uptime)}\``)
            .setColor("GREEN")
        msg.edit('Pong!', editEmb)

        function msToTime(ms){
            days = Math.floor(ms / 86400000); // 24*60*60*1000
            daysms = ms % 86400000; // 24*60*60*1000
            hours = Math.floor(daysms / 3600000); // 60*60*1000
            hoursms = ms % 3600000; // 60*60*1000
            minutes = Math.floor(hoursms / 60000); // 60*1000
            minutesms = ms % 60000; // 60*1000
            sec = Math.floor(minutesms / 1000);

            let str = "";
            if (days) str = str + days + "d ";
            if (hours) str = str + hours + "h ";
            if (minutes) str = str + minutes + "m ";
            if (sec) str = str + sec + "s";

            return str;
        }
    }
}