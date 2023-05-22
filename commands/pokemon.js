import { ActionRowBuilder, ComponentType, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('pokemon')
		.setDescription('Choose your starter!'),
	async execute(interaction) {
		const select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection!')
			.setMinValues(2)
			.setMaxValues(3)
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

		// Store the response as a variable (awaiting components topic)
		const response = await interaction.reply({
			content: 'Choose your starter!',
			components: [row],
		});

		// Create a ComponentCollector that collects from the String type
		// Will listen for multiple StringSelectMenuInteractions
		// Set the timout in milliseconds
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 3_600_000,
		});

		// When the collect event triggers for the collector
		collector.on('collect', async i => {
			// i.values is an array of the options the user selected
			const selection = i.values[0];
			await i.reply(`${i.user} has selected ${selection} and ${i.values[1]}`);
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