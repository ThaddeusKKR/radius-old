const { MessageEmbed } = require('discord.js')
const { globalPrefix } = require('../config.json')
const Keyv = require('keyv')
const fs = require('fs')

module.exports = {
    name: 'changelog',
    description: 'Shows the most recent changelog.',
    aliases: ['cl'],
    category: 'info',
    modOnly: false,
    ownerOnly: false,
    async execute(message, args) {
        const changelog = fs.readFileSync('../changelog.txt')
        message.channel.send(`Changelog: \`\`\`diff\n${changelog}\n\`\`\``)
    }
}