import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';
import * as helper from '../../utils/helper.js';
import { spoiler } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Get a meme from reddit or create one!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('get')
				.setDescription('Get a meme from a random subreddit (dankmemes, memes, me_irl) or a specified one!')
				.addStringOption(option =>
					option
						.setName('subreddit')
						.setDescription('A specific subreddit to get a meme from')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Create a simple meme by uploading an image')
				.addAttachmentOption(option => option.setName('image').setDescription('The image to make a meme of').setRequired(true))
				.addStringOption(option => option.setName('top-text').setDescription('The top text of the meme'))
				.addStringOption(option => option.setName('bottom-text').setDescription('The bottom text of the meme'))),
	async execute(interaction) {
		// Defer the reply to give both APIs more than 3 seconds to process
		await interaction.deferReply();

		if (interaction.options.getSubcommand() === 'get') {
			// Get the optional subreddit value or create an empty string
			const subreddit = interaction.options.getString('subreddit') ?? '';

			try {
				// Call the API from helper file
				const response = await helper.memeAPI(subreddit);
				// Create the image attachment from response
				// AttachmentBuilder must have a name to be able to use .setSpoiler()
				//	- name must end in .jpg or .png to show up as image, otherwise will not render image (will show as downloadable file only)
				const meme = new AttachmentBuilder(response.url).setName('meme.jpg').setSpoiler(response.nsfw || response.spoiler);
				// Since interaction was deferred initially, can't use .reply() need to use .editReply() to update the interaction with the info
				await interaction.editReply({
					content: (response.nsfw || response.spoiler) ? `__**NSFW or SPOILER**__ \n${response.title}` : `${response.title}`,
					files: [meme],
				});
			} catch (error) {
				console.error(error);
				await interaction.editReply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}

		} else if (interaction.options.getSubcommand() === 'create') {
			console.log('hello');
		}
	},
};

export default exportedMethods;