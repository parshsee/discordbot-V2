import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('game-info')
		.setDescription('Get information about the specified game with optional searching for specific year')
		.addStringOption(option =>
			option
				.setName('game')
				.setDescription('The game to get info for')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('year')
				.setDescription('The specific year the game came out')),
	async execute(interaction) {
		// Defer the reply to give the API more than 3 seconds to process
		await interaction.deferReply();

		const gameName = interaction.options.getString('game');
		const gameYear = interaction.options.getInteger('year');

		try {
			const response = await helper.gameAPI(gameName, gameYear);

			// If error during API call
			// Return the error message
			if (response.error) {
				return await interaction.editReply({
					content: response.errorMessage,
				});
			}

			// If the summary is longer than 1024 characters
			// Get a new length within 1024 characters that ends in a newline
			// Set the summary to the shorten version
			if (response.summary.length > 1024) {
				const newLength = response.summary.substr(0, 1024).lastIndexOf('\n');
				response.summary = response.summary.substr(0, newLength);
			}

			// Create the embed layout
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTimestamp()
				.setAuthor({ name: 'Immature Bot', iconURL: interaction.client.user.avatarURL(), url: 'https://github.com/parshsee/discordbot-V2' })
				.setFooter({ text: 'Immature Bot' })
				.setThumbnail(response.cover)
				.setTitle(response.name)
				.addFields(
					{ name: 'Game Information', value: response.summary },
					{ name: 'Game Modes', value: response.game_modes.join(' | ') },
				);


			// Send the embed
			await interaction.editReply({
				embeds: [embed],
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	},
};

export default exportedMethods;