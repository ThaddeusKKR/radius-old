const { Client, Collection, MessageEmbed, WebhookClient, Structures } = require('discord.js')
const Discord = require('discord.js')
const fs = require('fs')
const { globalPrefix, unknownCmd, ownerID } = require('./config.json')
const config = require('./config.json')
const Keyv = require('keyv')
const DBL = require('dblapi.js')

Structures.extend('Guild', function(Guild) {
    class MusicGuild extends Guild {
        constructor(client, data) {
            super(client, data);
            this.musicData = {
                queue: [],
                isPlaying: false,
                nowPlaying: null,
                songDispatcher: null,
                skipTimer: false, // only skip if user used leave command
                loopSong: false,
                loopQueue: false,
                volume: 0.4,
                private: false,
                maintenance: false
            };
        }
    }
    return MusicGuild;
});

const client = new Client()
client.commands = new Collection()

// Command Handler
const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}
const db = new Keyv(process.env.DATABASE_URL, { namespace: 'prefixes'})
db.on('error', err => {
    console.log(`Connection error (Keyv): ${err}`)
})

const webhookClient = new WebhookClient(process.env.WHID, process.env.WHTOKEN)
const webhookClient2 = new WebhookClient(process.env.WH2ID, process.env.WH2TOKEN)

const dbl = new DBL(process.env.DBLTOKEN, client)

dbl.on(`posted`, () => {
    console.log(`Server count posted | ${client.users.cache.size} users | ${client.guilds.cache.size} servers`)
    const svPosted = new MessageEmbed()
        .setTitle(`Server count posted`)
        .setDescription(`${client.users.cache.size} users in ${client.guilds.cache.size} servers`)
        .setColor("GREEN")
    webhookClient.send({
        username: 'Radius | DBL',
        embeds: [svPosted]
    })
})
dbl.on(`error`, e => {
    console.log(`Error while posting server count: ${e}`)
    const svPosted = new MessageEmbed()
        .setTitle(`Error posting server count`)
        .setDescription(`${client.users.cache.size} users in ${client.guilds.cache.size} servers\n\`\`\`\n${e}\n\`\`\``)
        .setColor("RED")
    webhookClient.send({
        username: 'Radius | DBL',
        embeds: [svErr]
    })
})
/*
dbl.webhook.on('ready', hook => {
    console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
    const whRunning = new MessageEmbed()
        .setTitle(`Webhook Ready`)
        .setDescription(`The webhook is now running at http://${hook.hostname}:${hook.port}${hook.path}.`)
        .setColor("GREEN")
    webhookClient.send({
        username: 'Radius',
        embeds: [whRunning]
    })
});
dbl.webhook.on('vote', vote => {
    const dmEmb = new MessageEmbed()
        .setDescription(`Thank you for voting for Radius!`)
        .setColor(`PURPLE`)
    let weekendMultiplier = 'is not active';
    if (vote.isWeekend == true) {
        weekendMultiplier = 'is active'
        dmEmb.addField(`Multipliers`, `The weekend multiplier is active, meaning that your vote counts twice. Thanks!`)
    }
    console.log(`User with ID ${vote.user} just voted | The weekend multiplier ${weekendMultiplier}`)
    const voter = client.users.cache.find(u => u.id == vote.user)
    voter.send(dmEmb)
    const logEmb = new MessageEmbed()
        .setDescription(`${voter.toString()} just voted for the bot. The weekend multiplier ${weekendMultiplier}.`)
        .setColor("YELLOW")
    webhookClient.send({
        username: 'Radius Vote Notifications',
        embeds: [logEmb]
    })
})
 */


client.on('message', async message => {

    let prefix
    if (message.content.startsWith(globalPrefix && !db.get(message.guild.id))) {
        prefix = globalPrefix
    } else {
        const guildPrefix = await db.get(message.guild.id); // Get prefix for the guild
        if (message.content.startsWith(guildPrefix)) prefix = guildPrefix
    }
    if (!prefix || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) {
        if (unknownCmd == true) { // Config.json
            const noEmb = new MessageEmbed()
                .setDescription(`Unknown command | Do \`${db.get(message.guild.id) || globalPrefix}help\` for a full list of commands`)
                .setColor("RED")
            message.channel.send(noEmb)
        }
        return;
    }

    const maintenanceState = await db.get('maintenance-mode')
    const maintenanceReason = await db.get('maintenance-reason')

    if (maintenanceState == true && message.author.id != ownerID) {
        const embed = new MessageEmbed()
            .setTitle("Unable to execute command")
            .setDescription(`**The bot is in maintenance mode** | \`${maintenanceReason}\``)
            .setColor("RED")
        return message.channel.send(embed)
    }

    if (command.modOnly == true) {
        if (message.author.id != ownerID || message.member.hasPermission('ADMINISTRATOR') == false) {
            const embed = new MessageEmbed()
                .setDescription("You are not allowed to use this command.")
                .setColor("RED")
            return message.channel.send(embed)
        }
    }
    if (command.ownerOnly == true) {
        if (message.author.id !== ownerID) {
            const embed = new MessageEmbed()
                .setDescription("You are not allowed to use this command.")
                .setColor("RED")
            return message.channel.send(embed)
        }
    }



    try {
        command.execute(message, args).catch(err => {
            console.error(err)
            const errEmb = new MessageEmbed()
                .setTitle("Error")
                .setDescription(`There was an error attempting to execute the command.`)
                .addField("Command:", `\`${command.name}\``)
                .addField("Arguments:", `\`${args || "None"}\``)
                .addField("Details:", `\`\`\`\n${err}\n\`\`\``)
                .setColor("RED")
            message.channel.send(errEmb)
            const errLogEmb = new MessageEmbed()
                .setColor("RED")
                .setDescription(`${message.author.toString()} used command \`${command.name}\` in \`${message.guild.name}\` but faced an error: \`${err}\``)
            webhookClient.send({
                username: 'Radius',
                embeds: [errLogEmb]
            })
            webhookClient2.send({
                username: 'Radius',
                embeds: [errLogEmb]
            })
        })

        const embed = new MessageEmbed()
            .setDescription(`${message.author.toString()} used command \`${command.name}\` in \`${message.guild.name}\`.`)
            .setColor("PURPLE")
        webhookClient.send({
            username: 'Raven',
            embeds: [embed]
        })
        webhookClient2.send({
            username: 'RavenBot Logging',
            embeds: [embed]
        })
    } catch (error) {
        console.error(error)
        const errEmb = new MessageEmbed()
            .setTitle("Error")
            .setDescription(`There was an error attempting to execute the command.`)
            .addField("Command:", `\`${command.name}\``)
            .addField("Arguments:", `\`${args || "None"}\``)
            .addField("Details:", `\`\`\`\n${error}\n\`\`\``)
            .setColor("RED")
        message.channel.send(errEmb)
        const errLogEmb = new MessageEmbed()
            .setColor("RED")
            .setDescription(`${message.author.toString()} used command \`${command.name}\` in \`${message.guild.name}\` but faced an error: \`${error}\``)
        webhookClient.send({
            username: 'Raven',
            embeds: [errLogEmb]
        })
        webhookClient2.send({
            username: 'RavenBot Logging',
            embeds: [errLogEmb]
        })
    }
})

client.on('voiceStateUpdate', async (___, newState) => {
    if (
        newState.member.user.bot &&
        !newState.channelID &&
        newState.guild.musicData.songDispatcher &&
        newState.member.user.id == client.user.id
    ) {
        newState.guild.musicData.queue.length = 0;
        newState.guild.musicData.songDispatcher.end();
        return;
    }
    if (
        newState.member.user.bot &&
        newState.channelID &&
        newState.member.user.id == client.user.id &&
        !newState.selfDeaf
    ) {
        newState.setSelfDeaf(true);
    }
});

client.once('ready', async () => {
    await client.user.setActivity("rd!h | radius.tk", {
        type: "STREAMING",
        url: "https://twitch.tv/thaddeuskkr"
    }).catch(console.error)
    await client.user.setStatus("ONLINE")
    console.log("Ready.")
    const logChannel = client.channels.cache.find(ch => ch.id === "756087509129101332")
    const logChannel2 = client.channels.cache.find(ch => ch.id === "769958858990026762")
    if (!logChannel || !logChannel2) return
    const embed = new MessageEmbed()
        .setTitle("Bot ready")
        .setDescription("Radius has started.")
        .addField("Cached users", client.users.cache.size)
        .addField("Cached servers", client.guilds.cache.size)
        .setColor("PURPLE")
    logChannel.send(embed).catch(err => {
        console.log("Failed to send start embed [1]")
    })
    logChannel2.send(embed).catch(err => {
        console.log("Failed to send start embed [2]")
    })
})
client.login(process.env.TOKEN)