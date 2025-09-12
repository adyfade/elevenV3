const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    let commandCount = 0;

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            if (command.data && command.execute) {
                client.slashCommands.set(command.data.name, command);
                commandCount++;
            } else {
                console.warn(`⚠️  Command at ${filePath} is missing required properties`);
            }
        }
    }

    console.log(`✅ Loaded ${commandCount} slash commands`);
};