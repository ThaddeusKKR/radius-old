Command file template
```js
const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: '',
    description: '',
    aliases: [],
    category: '',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {

    }
}
```

Music Commands Template
```js
const { MessageEmbed } = require('discord.js')
const Keyv = require('keyv')

module.exports = {
    name: '',
    description: '',
    aliases: [],
    category: 'music',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args, prefix) {
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
    }
}
```
