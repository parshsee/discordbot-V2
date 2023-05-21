import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('pokemon')
		.setDescription('Choose your starter!'),
	async execute(interaction) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Bulbasaur')
					.setDescription('The dual-type Grass/Poison Seed Pokemon')
					.setValue('bulbasaur'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Charmander')
					.setDescription('The Fire-type Lizard Pokemon')
					.setValue('charmander'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Squirtle')
					.setDescription('The Water-type Tiny Turtle Pokemon')
					.setValue('squirtle'),
			);

		const row = new ActionRowBuilder()
			.addComponents(select);

		await interaction.reply({
			content: 'Choose your starter!',
			components: [row],
		});

		// This code shows multi-select on selecting users
		// const userSelect = new UserSelectMenuBuilder()
		// 	.setCustomId('users')
		// 	.setPlaceholder('Select multiple users.')
		// 	.setMinValues(1)
		// 	.setMaxValues(10);

		// const row1 = new ActionRowBuilder()
		// 	.addComponents(userSelect);

		// await interaction.reply({
		// 	content: 'Select users:',
		// 	components: [row1],
		// });
	},
};

export default exportedMethods;