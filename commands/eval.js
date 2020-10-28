const { ownerID, prefix } = require('../config.json')
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'eval',
    description: 'Evaluates code (Use the flag `-noOutput` to remove output)',
    aliases: ['ev', 'test', 'run'],
    ownerOnly: true,
    category: 'tools',
    async execute(message, args) {
        if (!args.length) {
            const embed = new MessageEmbed()
                .setDescription("You did not provide any arguments!")
                .setColor("RED")
            return message.channel.send(embed)
        }

        let tOutput = true

        if (args[0] === '-noOutput' || args[0] === '-no' || args[0] === '-nooutput') {
            args.shift()
            tOutput = false
        }

        try {
            const code = args.join(" ")
            let evaled = eval(code)

            if (typeof evaled !== 'string') {
                evaled = require("util").inspect(evaled);
            }
            if (tOutput == true) {
                const embed = new MessageEmbed()
                    .setTitle("Eval")
                    .setDescription("Code successfully evaluated.")
                    .addField("Input", `\`\`\`js\n${args.join(' ')}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n${clean(evaled)}\n\`\`\``)
                    .setFooter(`Processing...`)
                    .setTimestamp()
                    .setColor("RED")
                const msg = await message.channel.send(embed)
                const embedEd = new MessageEmbed()
                    .setTitle("Eval")
                    .setDescription("Code successfully evaluated.")
                    .addField("Input", `\`\`\`js\n${args.join(' ')}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n${clean(evaled)}\n\`\`\``)
                    .setFooter(`Executed in ${msg.createdAt - message.createdAt}ms (Does not account for ping)`)
                    .setTimestamp()
                    .setColor("GREEN")
                msg.edit(embedEd)
            }
        } catch (err) {
            const embed = new MessageEmbed()
                .setTitle("Error")
                .setDescription("Error while evaluating code.")
                .addField("Input", `\`\`\`js\n${args.join(' ')}\n\`\`\``)
                .addField("Output", `\`\`\`js\n${clean(err)}\n\`\`\``)
                .setFooter(`Processing...`)
                .setTimestamp()
                .setColor("RED")
            const msg = await message.channel.send(embed)
            const embedEd = new MessageEmbed()
                .setTitle("Error")
                .setDescription("Error while evaluating code.")
                .addField("Input", `\`\`\`js\n${args.join(' ')}\n\`\`\``)
                .addField("Output", `\`\`\`js\n${clean(err)}\n\`\`\``)
                .setFooter(`Executed in ${msg.createdAt - message.createdAt}ms (Does not account for ping)`)
                .setTimestamp()
                .setColor("GREEN")
            msg.edit(embedEd)
            return;
        }


        function clean(text) {
            if (typeof(text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        }
    }
}