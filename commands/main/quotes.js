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

		} else if (interaction.options.getSubcommand() === 'list') {

		}

		await interaction.editReply({ content: 'Boop' });
	},
};

export default exportedMethods;