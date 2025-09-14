import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, ActivityType, Collection, EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Shoukaku, Connectors } from 'shoukaku';
import { Kazagumo } from 'kazagumo';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Modern Discord Music Bot with Lavalink v4 and Discord.js v14
 * @class ElevenMusicBot
 * @extends {Client}
 */
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

        // Modern Collections
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.buttons = new Collection();
        this.selectMenus = new Collection();
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

        this.init();
    }

    /**
     * Initialize the bot
     */
    async init() {
        await this.setupLavalink();
        await this.loadHandlers();
        await this.connectDatabase();
        await this.login(this.config.token);
    }

    /**
     * Setup Lavalink v4 with Shoukaku and Kazagumo
     */
    async setupLavalink() {
        // Initialize Shoukaku for Lavalink v4
        this.shoukaku = new Shoukaku(
            new Connectors.DiscordJS(this), 
            this.config.nodes, 
            {
                moveOnDisconnect: false,
                resumable: false,
                resumableTimeout: 30,
                reconnectTries: 2,
                restTimeout: 10000
            }
        );

        // Initialize Kazagumo v4
        this.kazagumo = new Kazagumo({
            defaultSearchEngine: 'youtube_music',
            send: (guildId, payload) => {
                const guild = this.guilds.cache.get(guildId);
                if (guild) guild.shard.send(payload);
            }
        }, new Connectors.DiscordJS(this), this.config.nodes);

        // Setup Lavalink event handlers
        this.shoukaku.on('ready', (name) => {
            console.log(`✅ Lavalink node ${name} is ready!`);
        });

        this.shoukaku.on('error', (name, error) => {
            console.error(`❌ Lavalink node ${name} error:`, error);
        });

        this.shoukaku.on('close', (name, code, reason) => {
            console.log(`🔌 Lavalink node ${name} closed: ${code} - ${reason}`);
        });

        this.shoukaku.on('disconnect', (name, players, moved) => {
            console.log(`📡 Lavalink node ${name} disconnected`);
            if (moved) return;
            players.forEach(player => player.connection.disconnect());
        });
    }

    /**
     * Load all handlers
     */
    async loadHandlers() {
        const handlersPath = path.join(__dirname, 'src', 'handlers');
        
        if (fs.existsSync(handlersPath)) {
            const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

            for (const file of handlerFiles) {
                try {
                    const { default: handler } = await import(path.join(handlersPath, file));
                    await handler(this);
                    console.log(`✅ Loaded handler: ${file}`);
                } catch (error) {
                    console.error(`❌ Failed to load handler ${file}:`, error);
                }
            }
        }

        // Load slash commands
        await this.loadSlashCommands();
        
        // Load events
        await this.loadEvents();
        
        // Load components
        await this.loadComponents();
    }

    /**
     * Load slash commands
     */
    async loadSlashCommands() {
        const commandsPath = path.join(__dirname, 'slashCommands');
        
        if (!fs.existsSync(commandsPath)) return;

        const commandFolders = fs.readdirSync(commandsPath);
        let commandCount = 0;

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                try {
                    const { default: command } = await import(path.join(folderPath, file));
                    
                    if (command.data && command.execute) {
                        this.slashCommands.set(command.data.name, command);
                        commandCount++;
                    }
                } catch (error) {
                    console.error(`❌ Failed to load command ${file}:`, error);
                }
            }
        }

        console.log(`✅ Loaded ${commandCount} slash commands`);
    }

    /**
     * Load events
     */
    async loadEvents() {
        const eventsPath = path.join(__dirname, 'Events');
        
        if (!fs.existsSync(eventsPath)) return;

        const eventFolders = fs.readdirSync(eventsPath);
        let eventCount = 0;

        for (const folder of eventFolders) {
            const folderPath = path.join(eventsPath, folder);
            const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                try {
                    const { default: event } = await import(path.join(folderPath, file));
                    
                    if (event.name && event.execute) {
                        if (folder === 'Client') {
                            if (event.once) {
                                this.once(event.name, (...args) => event.execute(this, ...args));
                            } else {
                                this.on(event.name, (...args) => event.execute(this, ...args));
                            }
                        } else if (folder === 'Kazagumo') {
                            this.kazagumo.on(event.name, (...args) => event.execute(this, ...args));
                        }
                        eventCount++;
                    }
                } catch (error) {
                    console.error(`❌ Failed to load event ${file}:`, error);
                }
            }
        }

        console.log(`✅ Loaded ${eventCount} events`);
    }

    /**
     * Load components (buttons, select menus)
     */
    async loadComponents() {
        const componentsPath = path.join(__dirname, 'Components');
        
        if (!fs.existsSync(componentsPath)) return;

        const componentFiles = fs.readdirSync(componentsPath).filter(file => file.endsWith('.js'));
        let componentCount = 0;

        for (const file of componentFiles) {
            try {
                const { default: component } = await import(path.join(componentsPath, file));
                
                if (component.id && component.execute) {
                    if (component.type === 'button') {
                        this.buttons.set(component.id, component);
                    } else if (component.type === 'selectMenu') {
                        this.selectMenus.set(component.id, component);
                    }
                    componentCount++;
                }
            } catch (error) {
                console.error(`❌ Failed to load component ${file}:`, error);
            }
        }

        console.log(`✅ Loaded ${componentCount} components`);
    }

    /**
     * Connect to MongoDB
     */
    async connectDatabase() {
        try {
            await mongoose.connect(this.config.mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            process.exit(1);
        }
    }

    /**
     * Create embed with default styling
     */
    embed(data = {}) {
        return new EmbedBuilder({
            color: parseInt(this.config.embedColor.replace('#', ''), 16),
            ...data
        });
    }

    /**
     * Create button component
     */
    button(data = {}) {
        return new ButtonBuilder(data);
    }

    /**
     * Create action row
     */
    row(data = {}) {
        return new ActionRowBuilder(data);
    }

    /**
     * Create select menu
     */
    selectMenu(data = {}) {
        return new StringSelectMenuBuilder(data);
    }
}

// Create and start the bot
const bot = new ElevenMusicBot();

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    
    if (bot.kazagumo) {
        bot.kazagumo.players.forEach(player => player.destroy());
    }
    
    await mongoose.connection.close();
    bot.destroy();
    process.exit(0);
});

export default bot;