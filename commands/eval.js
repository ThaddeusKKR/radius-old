const { ownerID, globalPrefix } = require('../config.json')
const { MessageEmbed } = require('discord.js')
const { exec } = require("child_process")
const hastebin = require('hastebin-gen')

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
        if (args[0] === '-exec' || args[0] === '-execute' || args[0] === '-cmd') {
            args.shift()
            const loadingEmbed = new MessageEmbed()
                .setDescription("Running command...")
                .setColor("RED")
            let msg = await message.channel.send(loadingEmbed)
            const embed = new MessageEmbed()
            exec(args.join(' '), async (error, data, getter) => {
                if (error) {
                    const haste = await hastebin(error, { extension: "txt" })
                    if (error.message.length > 2000) {
                        embed.setDescription(`Output is too long (${error.message.length} characters)\n${haste}`)
                        embed.setColor("RED")
                        return msg.edit(embed)
                    }
                    embed.setDescription(`\`\`\`\n${error.message}\n\`\`\`\n${haste}`)
                    embed.setColor("RED")
                    console.log(`${error}`)
                    return msg.edit(embed)
                }
                let result;
                if (getter) {
                    result = getter
                } else {
                    result = data
                }
                console.log(result)
                const haste = await hastebin(result, { extension: "txt" })
                if (result.length > 2040) {
                    embed.setDescription(`Output is too long (${result.length} characters)\n${haste}`)
                    embed.setColor("RED")
                    return msg.edit(embed)
                }
                embed.setDescription(`\`\`\`\n${result}\n\`\`\`\n${haste}`)
                embed.setColor("GREEN")
                return msg.edit(embed)
            })
            return;
        }

        try {
            const code = args.join(" ")
            let evaled = eval(code)

            if (typeof evaled !== 'string') {
                evaled = require("util").inspect(evaled);
            }
            const haste = await hastebin(evaled, { extension: "txt" })
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
                    .setDescription(`Code successfully evaluated. Click [here](${haste}) for the result.`)
                    .addField("Input", `\`\`\`js\n${args.join(' ')}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n${clean(evaled)}\n\`\`\``)
                    .setFooter(`Executed in ${msg.createdAt - message.createdAt}ms (Does not account for ping)`)
                    .setTimestamp()
                    .setColor("GREEN")
                msg.edit(embedEd)
            }
        } catch (err) {
            if (err.toString().includes("embed.fields[1].value: Must be 1024 or fewer in length")) {
                const code = args.join(" ")
                let evaled = eval(code)

                if (typeof evaled !== 'string') {
                    evaled = require("util").inspect(evaled);
                }
                const haste = await hastebin(evaled, { extension: "txt" })
                const embed = new MessageEmbed()
                    .setTitle("Error")
                    .setDescription(`Output too long - Click [here](${haste}) for the result.`)
                    .setColor("RED")
                message.channel.send(embed)
                return;
            }
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