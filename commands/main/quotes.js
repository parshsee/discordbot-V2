import { SlashCommandBuilder } from 'discord.js';
import Guilds from '../../data/models/guilds.js';
import Quotes from '../../data/models/quotes.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('quotes')
		.setDescription('Add/Remove a quote from the DB, show all quotes, get a specific quote, or get a random quote')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add quote to the DB')
				.addStringOption(option => option.setName('quote').setDescription('The phrase or sentence you want to save').setRequired(true))
				.addUserOption(option => option.setName('user').setDescription('The person who said the quote').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a quote (by its ID) from the DB')
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the quote in the DB. Use the list command to see all quotes and IDs').setRequired(true).setMinValue(1)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows a list of all quotes in the DB')
				.addStringOption(option =>
					option
						.setName('choices')
						.setDescription('Show all quotes/Show all quotes by a single person/Show one quote by ID/Show one quote at random')
						.setRequired(true)
						.addChoices(
							{ name: 'Show All', value: 'list_all' },
							{ name: 'Show All by Name', value: 'list_name' },
							{ name: 'Show One by ID', value: 'list_id' },
							{ name: 'Show One by Random ', value: 'list_random' },
						))
				// These are optional selections used for Show All by Name or Show One By ID is selected
				.addUserOption(option => option.setName('user').setDescription('The person who said the quote. Needed for \'Show All by Name\''))
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the quote in the DB. Needed for \'Show One by ID\'').setMinValue(1))),
	async execute(interaction) {
		// Defer the reply to give the DB more than 3 seconds to respond
		await interaction.deferReply();

		if (interaction.options.getSubcommand() === 'add') {
			// Get the quote and user from options
			const givenQuote = interaction.options.getString('quote');
			const givenQuoteUser = interaction.options.getUser('user');

			try {
				// Get the guild id
				const guildId = interaction.guild.id;
				// Get the guild document from the database
				const guild = await Guilds.findById({ _id: guildId });

				console.log(`Guild DB called for ${interaction.guild.name}: Quotes - Add`);

				// Create the ID number for the new subdocument
				// based on amount of quotes (subdocs) already in array
				const idNumber = guild.quotes.length + 1;

				// Create new quote document
				const quote = new Quotes({
					id: idNumber,
					userId: givenQuoteUser.id,
					quote: givenQuote,
				});

				// Add the quote subdocument to the array of quotes
				// Save the guild document
				guild.quotes.push(quote);
				await guild.save();

				console.log(`Guild DB saved for ${interaction.guild.name}: Quotes - Add`);

				// Send response back saying success
				await interaction.editReply({
					content: 'Quote Added Successfully',
				});

				return;
			} catch (error) {
				console.log(error);
			}

		} else if (interaction.options.getSubcommand() === 'remove') {
			// Get the id from options
			const id = interaction.options.getInteger('id');
			// Get the guild id
			const guildId = interaction.guild.id;

			try {
				// Call the .findOneAndUpdate() function from Mongoose Models to remove the quote object from database (if it exists)
				// Takes 3 params, the search query, the actual operation, optional parameters
				// Search Query: Find where the guild id matches the _id AND quote subdoc id equals the id given
				// Operation: Pull (remove) the quote subdoc from that array where the quote id matches the id given
				// Optional Params:
				//	- Projection: return the specific values listed (0 for no 1 for yes), where the elements that match ($elemMatch) the id are in the quote array
				//	- returnDocument: Return the document (normally the entire Guild doc if projection is not specified) before the operation is done
				// || [] - Short-Circuit Operation to ensure that if can't destructure 'quotes' array from DB operation then try from an empty array (will result in undefined instead of an error)
				const { quotes } = await Guilds.findOneAndUpdate(
					{
						$and: [
							{ _id: guildId },
							{ 'quotes.id': id },
						],
					},
					{ $pull: { quotes: { id: id } } },
					{
						projection: { _id: 0, quotes: { $elemMatch: { id: id } } },
						returnDocument: 'before',
					}) || [];

				console.log(`Guild DB called for ${interaction.guild.name}: Quotes - Remove`);

				// Check if the quotes arr is undefined (no changes made in DB)
				if (!quotes) {
					await interaction.editReply({
						content: 'Error: Could not remove quote. Please make sure ID exists within the list of quotes',
						ephemeral: true,
					});
					return;
				}

				// Update other Ids in quote arr subdocs
				await helper.updateCollectionIDs(id, guildId, 'quotes');

				// Send message saying the remove operation was a success
				await interaction.editReply({
					content: 'Quote has been removed from the database',
				});

				return;
			} catch (error) {
				console.log(error);
			}
		} else if (interaction.options.getSubcommand() === 'list') {
			// Get the choice, id, and user from options
			const choice = interaction.options.getString('choices');
			const id = interaction.options.getInteger('id');
			const user = interaction.options.getUser('user');

			// Check if Show ID is selected but no id provided
			if (choice === 'list_id' && !id) {
				await interaction.editReply({
					content: 'Error: ID must be provided to use \'Search by ID\'',
				});
				return;
			}

			// Check if Show Name is selected but no user provided
			if (choice === 'list_name' && !user) {
				await interaction.editReply({
					content: 'Error: User must be provided to use \'Search by Name\'',
				});
				return;
			}

			try {
				// Get the guildId
				const guildId = interaction.guild.id;

				switch (choice) {
					case 'list_all': {
						// Destructure the quotes array from the guild document that is returned from the DB
						const { quotes } = await Guilds.findById(
							{ _id: guildId },
							{ _id: 0, quotes: 1 },
						);

						console.log(`Guild DB called for ${interaction.guild.name}: Quotes - List - All`);

						// Check if the quotes array is empty (no quotes in DB)
						if (!quotes.length) {
							await interaction.editReply({
								content: 'No quotes exist in database!',
							});
							return;
						}

						// Sort the quote array by ID (ascending) (maybe not needed since DB is already sorted?)
						quotes.sort((a, b) => a.id - b.id);

						// Craete all the embeds necessary to show all quotes
						const embedArr = createEmbed(interaction, quotes);

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
						break;
					}
					case 'list_name': {
						break;
					}
					case 'list_id': {
						break;
					}
					case 'list_random': {
						break;
					}
				}
			} catch (error) {
				console.log(error);
			}

		}

		await interaction.editReply({ content: 'Boop' });
	},
};

// =============================== Quotes Specific Helper Function ===============================

const createEmbed = (interaction, quotesArr) => {
	// Call the helper function to create the initial embed
	let embed = helper.createIntitialEmbed(interaction.client);
	// The limit of how many quotes can be in an embed
	// Only have 25 fields
	// Need to set the ID, Quote, and User Name each column is a different field (so 3)
	// 8 * 3 = 24, Only 8 quotes can be in an embed at a time
	let limit = 8;
	// Create an array to hold all the embeds
	const embedArr = [];
	// Loop through the array getting the quote object and index
	quotesArr.forEach((quote, index) => {
		// If the index = the limit
		if (index === limit) {
			// Set initial title for first embed and the titles for the others
			embed.setTitle(index === 8 ? 'All Quotes' : 'All Quotes Cont.');
			// Increase the limit
			limit += 8;
			// Add the embed to the array of embeds
			embedArr.push(embed);
			// Clear all fields from the embed
			// Allows me to add another 25 fields
			embed = helper.createIntitialEmbed(interaction.client);
		}

		// Get the guild user from guild members cache where the member id matches the userId in DB
		const guildUser = interaction.guild.members.cache.find(member => member.id === quote.userId);

		// If the guildUser returns undefined/null, set name to default
		// Edge case if user who has quotes in DB leaves the server/guild
		if (!guildUser) {
			guildUser.user.globalName = 'Unknown User';
		}

		// If the remainder is 0, indicates that this will be the first row in embed, set titles
		if (index % 8 === 0) {
			embed.addFields({ name: 'ID', value: `${quote.id}`, inline: true });
			embed.addFields({ name: 'Quote', value: `${quote.quote}`, inline: true });
			embed.addFields({ name: 'User', value: `${guildUser.user.globalName}`, inline: true });
			// Else its not the first row, titles can be blank
		} else {
			embed.addFields({ name: '\u200b', value: `${quote.id}`, inline: true });
			embed.addFields({ name: '\u200b', value: `${quote.quote}`, inline: true });
			embed.addFields({ name: '\u200b', value: `${guildUser.user.globalName}`, inline: true });
		}
	});
	// Add the remaining embed after it exits for loop
	// Ensures that the last streamers are added
	// I.e if 28 streamers in db, 24 will get added with code above, last 4 will get added with this
	embedArr.push(embed);

	return embedArr;
};

export default exportedMethods;