import { SlashCommandBuilder } from 'discord.js';
import Guilds from '../../data/models/guilds.js';
import Games from '../../data/models/games.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('freestuff')
		.setDescription('Add/Remove a game from the DB, or show all games')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a game to the DB')
				.addStringOption(option => option.setName('game-name').setDescription('The full name of the game').setRequired(true))
				.addStringOption(option => option.setName('game-key').setDescription('The key to redeem the game').setRequired(true))
				.addStringOption(option =>
					option
						.setName('type')
						.setDescription('The type of game it is')
						.setRequired(true)
						.addChoices(
							{ name: 'Game', value: 'Game' },
							{ name: 'DLC', value: 'DLC' },
							{ name: 'Other', value: 'Other' },
						))
				.addStringOption(option =>
					option
						.setName('platform')
						.setDescription('Where to redeem the game key')
						.setRequired(true)
						.addChoices(
							{ name: 'Steam', value: 'Steam' },
							{ name: 'Microsoft', value: 'Microsoft' },
							{ name: 'GOG', value: 'GOG' },
							{ name: 'Origin', value: 'Origin' },
							{ name: 'Epic', value: 'Epic' },
							{ name: 'Uplay', value: 'Uplay' },
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('claim')
				.setDescription('Claim a game from the DB. Game key and info will be sent in DM')
				.addStringOption(option => option.setName('game-name').setDescription('The full name of the game. Must be spelt the exact same as shown in list.').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('Shows a list of all games in the DB')),
	async execute(interaction) {
		// Defer the reply to give the DB more than 3 seconds to respond
		await interaction.deferReply();


		// TODO: Delete
		await interaction.editReply({
			content: 'Boop',
		});
	},
};

export default exportedMethods;