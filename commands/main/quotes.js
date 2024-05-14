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
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the quote in the DB. Use the list command to see all quotes and IDs').setRequired(true).setMinValue(0)))
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
				.addIntegerOption(option => option.setName('id').setDescription('The ID of the quote in the DB. Needed for \'Show One by ID\'').setMinValue(0))),
	async execute(interaction) {
		// Defer the reply to give the DB more than 3 seconds to respond
		await interaction.deferReply();

		if (interaction.options.getSubcommand() === 'add') {
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

		} else if (interaction.options.getSubcommand === 'remove') {

		} else if (interaction.options.getSubcommand === 'list') {

		}

		await interaction.editReply({ content: 'Boop' });
	},
};

export default exportedMethods;