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
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,			// Priviledged Intents
		GatewayIntentBits.GuildPresences		// Priviledged Intents
	]
});

// The Collection class extends JS's native Map class, and includes more extensive, useful functionality
// Collection is used to store and efficently retrieve commands for execution
client.commands = new Collection();

// Dynamically retrieve command folders
// Ignore the learning folder commands, they were used to understand Discord.js functions
const foldersPath = new URL('commands/', import.meta.url);
const commandFolders = fs.readdirSync(foldersPath).filter(folder => !folder.includes('learning'));

// Loop over the array of command folders
// Create the URL path and get the array of command files from each command folder
for (const folder of commandFolders) {
	const commandsPath = new URL(folder, foldersPath);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// Loop over the array of command files
	// Create the filePath for the file and import it
	for (const file of commandFiles) {
		// Using ES6 await import to dynamically import command files
		const filePath = `${commandsPath.toString()}/${file}`;
		const { default: command } = await import((new URL(filePath)).toString());
		// Set a new item in the Collection with the key as the command name and vthe value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[Warning] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


// Dynamically retrieve event files
const eventsPath = new URL('events', import.meta.url);
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Loop over array of event files and dynamically check if the event used with the .once and .on event listeners
for (const file of eventFiles) {
	// Dynamically import each event file
	const filePath = `${eventsPath.toString()}/${file}`;
	const { default: event } = await import((new URL(filePath)).toString());

	// Client class extends the EventEmitter class, therefore the client object exposes the .on() and .once() methods used to register event listeners
	// They take two arguments, the name and a callback function, both are defined in each event file as 'name' and 'execute'
	// The callback function passed takes argument(s) returned by its respective event, collects them in an args array 
	// 		using the ... rest parameter syntax, then calls event.execute() while passing in the args array using the ... spread syntax. They are used here because different events in discord.js have different numbers of arguments. 
	//		The rest parameter collects these variable number of arguments into a single array, and the spread syntax then takes these elements and passes them to the execute function.
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
