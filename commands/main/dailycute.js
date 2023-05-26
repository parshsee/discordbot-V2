import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import * as helper from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('dailycute')
		.setDescription('Sends a random cute animal image and fact'),
	async execute(interaction) {

		// Defer the reply to give API more than 3 seconds to process
		await interaction.deferReply();

		// Generate a random number from 0 to 8
		const randNum = Math.floor(Math.random() * 9);
		// Array of all animal endpoints
		const animalsArr = ['bird', 'cat', 'dog', 'fox', 'kangaroo', 'koala', 'panda', 'raccoon', 'red_panda'];
		// Get random animal for API call
		const randAnimal = animalsArr[randNum];

		try {
			// Call the API from helper file
			const response = await helper.dailyCuteAPI(randAnimal);
			// Create the image attachment from response
			const image = new AttachmentBuilder(response.image);
			// Since interaction was deferred initially, can't use .reply() need to use .editReply() to update the interaction with the info
			await interaction.editReply({
				content: response.fact,
				files: [image],
			});
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	},
};

export default exportedMethods;