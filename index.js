const { Client, Collection, MessageEmbed, WebhookClient } = require('discord.js')
const Discord = require('discord.js')
const fs = require('fs')
const { globalPrefix, unknownCmd, ownerID } = require('./config.json')
const config = require('./config.json')
const Keyv = require('keyv')
const DBL = require('dblapi.js')

const client = new Client()
client.commands = new Collection()

// Command Handler
const commandFiles = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

const db = new Keyv(process.env.DATABASE_URL)
db.on('error', err => {
    console.log(`Connection error (Keyv): ${err}`)
})

client.on('message', async message => {

    // Keyv Data Storage ( Using this for prefix and stuff )

    let prefix
    if (message.content.startsWith(globalPrefix && !db.get(message.guild.id))) {
        prefix = globalPrefix
    } else {
        const guildPrefix = await db.get(message.guild.id); // Get prefix for the guild
        if (!guildPrefix) prefix = globalPrefix
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

    const webhookClient = new WebhookClient(process.env.WHID, process.env.WHTOKEN)
    const webhookClient2 = new WebhookClient(process.env.WH2ID, process.env.WH2TOKEN)

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
        command.execute(message, args)

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
            .addField("Command:", `\`${command}\``)
            .addField("Arguments:", `\`${args}\``)
            .addField("Details:", `\`\`\`\n${error}\n\`\`\``)
            .setColor("RED")
        message.channel.send(errEmb)
        const errLogEmb = new MessageEmbed()
            .setDescription(`${message.author.toString()} used command \`${command.name}\` in \`${message.guild.name}\` but faced an error: \`${error}\``)
        webhookClient.send({
            username: 'Raven',
            embeds: [errEmb]
        })
        webhookClient2.send({
            username: 'RavenBot Logging',
            embeds: [errEmb]
        })
    }
})

const dbl = new DBL(process.env.DBLTOKEN, client);

// Optional events
dbl.on('posted', () => {
    console.log('Server count posted!');
})

dbl.on('error', e => {
    console.log(`Oops! ${e}`);
})

client.once('ready', async () => {
    await client.user.setActivity("raven help", {
        type: "STREAMING",
        url: "https://twitch.tv/thaddeuskkr",
        status: "dnd"
    }).catch(console.error)
    await client.user.setStatus("DND")
    console.log("Ready.")
    const logChannel = client.channels.cache.find(ch => ch.id === "756087509129101332")
    const logChannel2 = client.channels.cache.find(ch => ch.id === "769958858990026762")
    if (!logChannel || !logChannel2) return
    const embed = new MessageEmbed()
        .setTitle("Bot ready")
        .setDescription("Raven has started.")
        .addField("Cached users", client.users.cache.size)
        .addField("Cached servers", client.guilds.cache.size)
        .setColor("PURPLE")
    logChannel.send(embed).catch(err => {
        console.log("Failed to send start embed.")
    })
    logChannel2.send(embed).catch(err => {
        console.log("Failed to send start embed [2]")
    })
})
client.login(process.env.TOKEN)