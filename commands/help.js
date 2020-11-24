const { globalPrefix } = require('../config.json');
const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: 'help',
    description: 'Sends you this help command.',
    aliases: ['h', 'commands'],
    category: 'info',
    async execute(message, args) {

        const { commands } = message.client;


        const fullCategories = message.client.commands.map(cmd => cmd.category).join()

        let cats = findDuplicates(fullCategories) // cats is an array of all command categories, work on this later.

        let cmdArr = [];
        let numberOfCommands = 0
        commands.forEach(cmd => {
            if (cmd.ownerOnly == false || !cmd.ownerOnly) {
                cmdArr.push(cmd.name)
                numberOfCommands++
            }
        })
        const commandList = cmdArr.join('\`, \`')

        const db = new Keyv(process.env.DATABASE_URL, { namespace: 'prefixes'})
        db.on('error', err => {
            console.log(`Connection error (Keyv): ${err}`)
            const embed = new MessageEmbed()
                .setDescription(`Failed to connect to the Keyv database.`)
                .setColor("RED")
            return message.channel.send(embed)
        })
        const prefix = await db.get(message.guild.id) || globalPrefix

        if (!args.length) {
            const embed = new MessageEmbed()
                .setTitle("Help")
                .setDescription(`This is a list of all my commands.\nYou can run \`${await db.get(message.guild.id) || globalPrefix}help [command name]\` to get more information on a command.`)
                .addField("Commands", `\`${commandList}\``)
                .setColor("PURPLE")
                .setFooter(`${numberOfCommands} commands | Requested by ${message.author.tag}`)
                .setTimestamp()
            message.channel.send(embed)
            return;
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            const errEmbed = new MessageEmbed()
                .setDescription("That's not a valid command!")
                .setColor("RED")
            return message.channel.send(errEmbed)
        }

        let limitations = ''

        if (command.ownerOnly == true) {
            limitations = "This command is only available for the owner of the bot."
        } else if (command.modOnly == true) {
            limitations = "This command is only available for an admin of this server."
        } else if (!command.ownerOnly && !command.modOnly) {
            limitations = "None"
        } else {
            limitations = "None"
        }

        let aliases;

        if (!command.aliases || command.aliases.length < 1) {
            aliases = "None"
        } else {
            aliases = `\`${command.aliases.join('`, `')}\``
        }

        const embed = new MessageEmbed()
            .setTitle("Command Information")
            .setDescription(`Specific information on the \`${command.name}\` command.\nTo get a full list of commands, just use \`${await db.get(message.guild.id) || globalPrefix}help\`.`)
            .addField(`Name`, `\`${command.name}\``)
            .addField(`Aliases`, aliases)
            .addField(`Description`, command.description)
            .addField(`Limitations`, limitations)
            .setColor("PURPLE")

        message.channel.send(embed)

        function findDuplicates (str) {
            str = str.replace(/[ ]/g,"").split(",");
            var result = [];
            for(var i =0; i < str.length ; i++) {
                if (result.indexOf(str[i]) == -1) result.push(str[i]);
            }
            return result;
        }
    }
}