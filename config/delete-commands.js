import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

const rest = new REST().setToken(process.env.TOKEN);

// Delete the commands
(async () => {
	try {
		console.log('Starting deleting application (/) commands.');

		// Delete a command from a guild
		await rest.delete(
			Routes.applicationGuildCommand(process.env.DISCORD_DEV_CLIENTID, process.env.DISCORD_DEV_GUILDID, 'commandId'),
		);

		// // Delete a command from all guilds
		// await rest.delete(
		// 	Routes.applicationCommand(process.env.DISCORD_DEV_CLIENTID, 'commandId'),
		// );

		// // Delete all commands from a guild
		// await rest.delete(
		// 	Routes.applicationGuildCommands(process.env.DISCORD_DEV_CLIENTID, process.env.DISCORD_DEV_GUILDID),
		// 	{ body: [] }
		// );

		// // Delete all commands from all guilds
		// await rest.delete(
		// 	Routes.applicationCommands(process.env.DISCORD_DEV_CLIENTID),
		// 	{ body: [] }
		// );

		console.log('Successfully deleted command');
	} catch (error) {
		// Catch any errors
		console.error(error);
	}
})();