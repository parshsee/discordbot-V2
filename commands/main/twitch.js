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
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the streamer').setMinValue(1).setRequired(true)))
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

				console.log('Guild DB called for: Streamers - Add');

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

				console.log('Guild DB saved for: Streamers - Add');

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
			// Get the id from the options
			const id = interaction.options.getInteger('id');
			// Get the guild id
			const guildId = interaction.guild.id;
			// Get the guild document from the database
			const guild = await Guild.findById({ _id: guildId });

			console.log('Guild DB called for: Streamers - Remove');

			// Check if ID is greater than IDs in DB, return error
			if (id > guild.streamers.length) {
				await interaction.editReply({
					content: 'Error: ID could not be found. Please make sure it exists within the list of streamers',
					ephemeral: true,
				});
				return;
			}

			// replace this with https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
			// https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
			// const test = guild.streamers.pull({ id: id });

			// Create an array of only the IDs, then find the index of the specified ID
			const test = guild.streamers.map(streamer => streamer.id).indexOf(id);
			// Splice (modifies the original array instead of creating a copy of it like slice) the array removing the object at the index of
			// .splice(index of object to remove, # of items afterwards to remove (1 means only that object))
			// Returns an array of the deleted items, or an empty array if nothing was deleted
			const removedStreamerArr = guild.streamers.splice(test, 1);

			// Check that the removed streamer arr is empty (no streamer removed)
			if (!removedStreamerArr.length) {
				await interaction.editReply({
					content: 'Error: Could not remove streamer. Please make sure ID exists within the list of streamers',
					ephemeral: true,
				});
			}
			// Get the removed streamer obj
			const removedStreamer = removedStreamerArr[0];

			// TODO:
			// Update other IDs in streamer arr subdocs

			// Save the changes to the streamers array
			await guild.save();

			console.log('Guild DB saved for: Streamers - Remove');

			await interaction.editReply({
				content: `${removedStreamer.streamerName} has been removed from the database`,
			});


		} else if (interaction.options.getSubcommand() === 'list') {
			// Get the guild id
			const guildId = interaction.guild.id;
			// Get the guild document from the database
			const guild = await Guild.findById({ _id: guildId });
			// Get the streamers array
			const streamersArr = guild.streamers;

			console.log('Guild DB called for: Streamers - List');

			// Check the the streamers array is empty (no streamers in DB)
			if (!streamersArr.length) {
				await interaction.editReply({
					content: 'No streamers exist in database!',
				});
			}

			// Sort the streamer array by ID (ascending)
			streamersArr.sort((a, b) => a._id - b._id);

			// Call helper function to create intiial embed
			let embed = helper.createIntitialEmbed(interaction);
			// The limit of how many stremers can be in an embed
			// Only have 25 fields
			// Need to set the ID, Streamer, and Twitch Url each column is a different field (so 3)
			// 8 * 3 = 24, Only 8 streamers can be in an embed at a time
			let limit = 8;
			// Create an array to hold all the embeds
			const embedArr = [];
			// Loop through the array of docs getting the streamer object and index
			streamersArr.forEach((streamer, index) => {
				// If the index = the limit
				if (index === limit) {
					// Set initial title for first embed and the titles for the others
					embed.setTitle(index === 8 ? 'All Streamers' : 'All Streamers Cont.');
					// Increase the limit
					limit += 8;
					// Add the embed to the array of embeds
					embedArr.push(embed);
					// Clear all fields from the embed
					// Allows me to add another 25 fields
					embed = helper.createIntitialEmbed(interaction);
				}

				// If the remainder is 0, indicates that this will be the first row in embed, set titles
				if (index % 8 === 0) {
					embed.addFields({ name: 'ID', value: `${streamer.id}`, inline: true });
					embed.addFields({ name: 'Streamer', value: `${streamer.streamerName}`, inline: true });
					embed.addFields({ name: 'Twitch URL', value: `[twitch.tv/${streamer.streamerName}](https://twitch.tv/${streamer.streamerName})`, inline: true });
					// Else its not the first row, titles can be blank
				} else {
					embed.addFields({ name: '\u200b', value: `${streamer.id}`, inline: true });
					embed.addFields({ name: '\u200b', value: `${streamer.streamerName}`, inline: true });
					embed.addFields({ name: '\u200b', value: `[twitch.tv/${streamer.streamerName}](https://twitch.tv/${streamer.streamerName})`, inline: true });
				}
			});
			// Add the remaining embed after it exits for loop
			// Ensures that the last streamers are added
			// I.e if 28 streamers in db, 24 will get added with code above, last 4 will get added with this
			embedArr.push(embed);

			// Create the chunksize, this is the amount of embeds that can be sent in one interaction (10)
			const chunkSize = 10;
			// Loop through the array of embeds, sending messages for every 10 embeds
			for (let index = 0; index < embedArr.length; index += chunkSize) {
				// Slice (create shallow copy of portion of array) the embed array to get 10 embeds
				// Will be from (0, 9), (10, 19), etc depending on amount of embeds created
				const chunk = embedArr.slice(index, index + chunkSize);

				// Send a followUp interaction with the embed chunk
				await interaction.followUp({
					embeds: chunk,
				});

			}
		}
	},
};

export default exportedMethods;