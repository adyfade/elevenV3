import { REST, Routes } from 'discord.js';

export default {
    name: 'ready',
    once: true,

    /**
     * Execute when client is ready
     * @param {import('../../index.js').default} client 
     */
    async execute(client) {
        console.log(`✅ ${client.user.tag} is online and ready!`);
        console.log(`🎵 Serving ${client.guilds.cache.size} servers`);
        console.log(`👥 Serving ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users`);

        // Register slash commands
        await this.registerSlashCommands(client);

        // Set bot activity
        this.updateActivity(client);
        
        // Update activity every 30 seconds
        setInterval(() => this.updateActivity(client), 30000);
    },

    /**
     * Register slash commands with Discord
     * @param {import('../../index.js').default} client 
     */
    async registerSlashCommands(client) {
        try {
            const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());
            
            if (commands.length === 0) {
                console.log('⚠️ No slash commands to register');
                return;
            }

            const rest = new REST({ version: '10' }).setToken(client.config.token);

            console.log(`🔄 Started refreshing ${commands.length} application (/) commands...`);

            // Register commands globally
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );

            console.log(`✅ Successfully reloaded ${data.length} application (/) commands`);

        } catch (error) {
            console.error('❌ Failed to register slash commands:', error);
        }
    },

    /**
     * Update bot activity status
     * @param {import('../../index.js').default} client 
     */
    updateActivity(client) {
        const activities = [
            { name: '/play | Eleven Music', type: 2 }, // LISTENING
            { name: `${client.guilds.cache.size} servers`, type: 3 }, // WATCHING
            { name: 'High Quality Music', type: 2 }, // LISTENING
            { name: '/help for commands', type: 3 }, // WATCHING
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        client.user.setActivity(activity.name, { 
            type: activity.type,
            status: 'online'
        });
    }
};