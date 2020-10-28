const { MessageEmbed } = require('discord.js')
const { ownerID } = require('../config.json')

module.exports = {
    name: 'reload',
    description: 'Reloads a command.',
    aliases: ['rl'],
    ownerOnly: true,
    category: 'tools',
    async execute(message, args) {

        if (message.author.id != ownerID) {
            const notAllowed = new MessageEmbed()
                .setDescription("You are not allowed to use this command")
                .setColor("RED")
            return message.channel.send(notAllowed)
        }

        if (!args.length) {
            const errEmb = new MessageEmbed()
                .setDescription("You did not provide any arguments!")
                .setColor("RED")
            message.channel.send(errEmb)
            return;
        }
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            const errEmb = new MessageEmbed()
                .setDescription("That's not a valid command!")
                .setColor("RED")
            message.channel.send(errEmb)
            return;
        }

        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.error(error);
            const errEmbed = new MessageEmbed()
                .setTitle("Error")
                .setDescription(`There was an error while trying to reload \`${command.name}\`.\n\`\`\`js\n${error}\n\`\`\``)
                .setColor("RED")
            message.channel.send(errEmbed);
            return;
        }
        const embed = new MessageEmbed()
            .setDescription(`Successfully reloaded \`${command.name}\`.`)
            .setColor("GREEN")
        message.channel.send(embed)
    }
}