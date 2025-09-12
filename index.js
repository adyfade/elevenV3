require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType, Collection } = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');
const { Kazagumo } = require('kazagumo');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

class ElevenMusicBot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.User,
                Partials.Reaction
            ],
            presence: {
                activities: [{ 
                    name: "/play | Eleven Music", 
                    type: ActivityType.Listening 
                }],
                status: 'online'
            }
        });

        // Collections
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.buttons = new Collection();
        this.cooldowns = new Collection();
        
        // Configuration
        this.config = {
            token: process.env.DISCORD_TOKEN,
            prefix: process.env.PREFIX || '!',
            mongoUri: process.env.MONGO_URI,
            embedColor: process.env.EMBED_COLOR || '#3498db',
            owners: process.env.OWNERS?.split(',') || [],
            nodes: [
                {
                    name: 'main',
                    url: process.env.LAVALINK_HOST || 'localhost:2333',
                    auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
                    secure: false
                }
            ]
        };

        // Initialize Lavalink
        this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), this.config.nodes, {
            moveOnDisconnect: false,
            resumable: false,
            resumableTimeout: 30,
            reconnectTries: 2,
            restTimeout: 10000
        });

        // Initialize Kazagumo
        this.kazagumo = new Kazagumo({
            defaultSearchEngine: 'youtube_music',
            send: (guildId, payload) => {
                const guild = this.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            }
        }, new Connectors.DiscordJS(this), this.config.nodes);

        this.init();
    }

    async init() {
        await this.loadHandlers();
        await this.connectDatabase();
        await this.login(this.config.token);
    }

    async loadHandlers() {
        // Load command handlers
        const handlersPath = path.join(__dirname, 'src', 'handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

        for (const file of handlerFiles) {
            const handler = require(path.join(handlersPath, file));
            await handler(this);
        }
    }

    async connectDatabase() {
        try {
            await mongoose.connect(this.config.mongoUri);
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            process.exit(1);
        }
    }

    embed(data = {}) {
        const { EmbedBuilder } = require('discord.js');
        return new EmbedBuilder({
            color: parseInt(this.config.embedColor.replace('#', ''), 16),
            ...data
        });
    }

    button(data = {}) {
        const { ButtonBuilder } = require('discord.js');
        return new ButtonBuilder(data);
    }

    row(data = {}) {
        const { ActionRowBuilder } = require('discord.js');
        return new ActionRowBuilder(data);
    }

    menu(data = {}) {
        const { StringSelectMenuBuilder } = require('discord.js');
        return new StringSelectMenuBuilder(data);
    }
}

// Create and start the bot
const bot = new ElevenMusicBot();

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = bot;