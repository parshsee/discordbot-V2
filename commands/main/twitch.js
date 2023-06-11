import { SlashCommandBuilder } from 'discord.js';
import Guild from '../../data/models/guilds.js';
import Streamer from '../../data/models/streamers.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('Add/Remove a streamer from the DB or show all streamers')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a streamer to keep track of when they come online')
				.addStringOption(option => option.setName('streamer').setDescription('The name of the streamer').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a streamer (by their ID) to stop tracking them')
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the streamer').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all the streamers currently tracking and their IDs')),
	async execute(interaction) {
		// Defer the reply to give the API and DB more than 3 seconds to process
		await interaction.deferReply();

		if (interaction.options.getSubcommand() === 'add') {
			// Get the streamer name from the options
			const streamerName = interaction.options.getString('streamer');

			try {
				// Call the API from the helper file
				const response = await helper.twitchUserAPI(streamerName);

				// If no search results were found
				if (response.length === 0) {
					await interaction.editReply({
						content: 'No Twitch user found with that name!',
						ephemeral: true,
					});
					return;
				}

				// Get the streamer information from the response
				// Should be the only object in the array
				const streamerInfo = response[0];
				// Get the guild id
				const guildId = interaction.guild.id;
				// Get the guild document from the database
				const guild = await Guild.findById({ _id: guildId });

				// Check if the streamer is already in database
				// Return error if object is returned, otherwise null
				if (guild.streamers.find(streamer => streamer.streamerName === streamerInfo.display_name)) {
					await interaction.editReply({
						content: `Twitch user ${streamerInfo.display_name} already exists in database!`,
						ephemeral: true,
					});
					return;
				}

				// Create the ID number for the new document
				// 	based on amount of streamers (documents) already in array
				const idNumber = guild.streamers.length + 1;

				// Create new streamer document
				const streamer = new Streamer({
					id: idNumber,
					streamerName: streamerInfo.display_name,
					gameTitle: '',
					status: 'Offline',
				});

				// Add the streamer subdocument to the array of streamers
				// Save the guild document
				guild.streamers.push(streamer);
				await guild.save();

				console.log('Streamer added to Database');

				await interaction.editReply({
					content: 'Streamer Added Successfully',
				});

			} catch (error) {
				console.error(error);
				await interaction.editReply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			const id = interaction.options.getInteger('id');
		} else if (interaction.options.getSubcommand() === 'list') {

		}
	},
};

export default exportedMethods;