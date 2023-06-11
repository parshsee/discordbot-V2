import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const commands = [];

// Grab all the command folders from the commands directory you created earlier
// Ignore the learning folder commands, they were used to understand Discord.js functions
const foldersPath = new URL('../commands/', import.meta.url);
const commandFolders = fs.readdirSync(foldersPath).filter(folder => !folder.includes('learning'));;

// Loop over the array of command folders
// Create the URL path and get the array of command files from each command folder
for (const folder of commandFolders) {
	const commandsPath = new URL(folder, foldersPath);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// Loop over the array of command files
	// Create the filePath for the file and import it
	// Check that the command file has the necessary 'data' and 'execute' functions before adding to commands array
	for (const file of commandFiles) {
		// Using ES6 await import to dynamically import command files
		const filePath = `${commandsPath.toString()}/${file}`;
		const { default: command } = await import((new URL(filePath)).toString());
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at asdasd is missing a requried "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

// Deploy the commands
(async () => {
	try {
		console.log(`Starting refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		// const data = await rest.put(
		// 	Routes.applicationGuildCommands(process.env.DISCORD_DEV_CLIENTID, process.env.DISCORD_DEV_GUILDID),
		// 	{ body: commands },
		// );

		// Global Commands
		// Will be available in all the guilds the application has the 'application.commands' scope authorized in, and in direct messages by default
		// Guild-based deployment of commands is best suited for development and testing in your own personal server. Once you're satisfied that it's ready, deploy the command globally to publish it to all guilds that your bot is in.
		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_DEV_CLIENTID),
			{ body: commands },
		);

		console.log(`Sucessfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// Catch any errors
		console.error(error);
	}
})();