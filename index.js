// Import the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
// Import the .env file
import * as dotenv from 'dotenv';
// Import the filesystem
import * as fs from 'fs';
// Configure the .env file
dotenv.config();

// Create a new client instance
// GatewayIntentBits.Guilds intents is necessary for discord.js client to ensure that it
// caches for guilds, channels, and rolesw are populated and available
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// The Collection class extends JS's native Map class, and includes more extensive, useful functionality
// Collection is used to store and efficently retrieve commands for execution
client.commands = new Collection();

// Dynamically retrieve command files
const commandsPath = new URL('commands', import.meta.url);
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Loop over array of command files and dynamically set each command into client.commands Collection
// Also checks that each command file has at least the 'data' and 'execute' properties
for (const file of commandFiles) {
	const filePath = `${commandsPath.toString()}/${file}`;
	const { default: command } = await import((new URL(filePath)).toString());
	// Set a new item in the Collection with the key as the command name and vthe value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[Warning] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Every slash command is an interaction, so to respond to the command, create a listener for the Client#event:interactionCreate event
// that will exedcute code when your application recieves an interaciton
// Not every interaction is a slash command, exit the handler if another type is handled
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	// Get the matching command from client.commands Collection based on the interaction.name
	// client is always available vis interaction.client
	const command = interaction.client.commands.get(interaction.commandName);

	// If no matching command is found, log an error and ignore the event
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
	}

	// Try to execute the command
	// Catch and log any error the console
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
