import { Events } from 'discord.js';

// Every slash command is an interaction, so to respond to the command, create a listener for the Client#event:interactionCreate event
// that will exedcute code when your application recieves an interaciton
// Not every interaction is a slash command, exit the handler if another type is handled
const exportedMethods = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

			// Get the matching command from client.commands Collection based on the interaction.name
			// client is always available vis interaction.client
			const command = interaction.client.commands.get(interaction.commandName);

			// If no matching command is found, log an error and ignore the event
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
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
		} else if (interaction.isAutocompelete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
	},
};

export default exportedMethods;