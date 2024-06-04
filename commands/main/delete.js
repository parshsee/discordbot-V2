import { ActionRowBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { confirm, cancel } from '../../utils/helper.js';

// Set DefaultMemberPermission so only Admin/Moderators can use it
const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Deletes the last message or up to 100 messages in the channel from the last two weeks')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('The channel to delete from. If none selected, will delete messages from channel command is ran from'))
		.addIntegerOption(option =>
			option
				.setName('amount')
				.setDescription('The amount of messages to delete. If none given, will delete the last message from the channel')
				.setMinValue(1)
				.setMaxValue(99)),
	async execute(interaction) {
		// Get the channel selected from the options OR if options return null (none selected), get the current channel from interaction
		const channel = interaction.options.getChannel('channel') || interaction.channel;
		// Get the amount to remove from options OR if the options return null (none given), set it to 1 message
		const removeAmount = interaction.options.getInteger('amount') || 1;

		// Add a confirmation followup if amount to delete is greater than 5
		if (removeAmount > 5) {
			// Create an action row with confirm and cancel buttons
			const row = new ActionRowBuilder()
				.addComponents(confirm, cancel);

			const response = await interaction.reply({
				content: `Are you sure you want to delete ${removeAmount} messages from ${channel.name}`,
				components: [row],
				ephemeral: true,
			});

			// Create a filter (function expression) to ensure that only the user who triggered the original interaction can use the buttons
			const collectorFilter = i => i.user.id === interaction.user.id;

			try {
				// Wait for an interaction (that passes the collection filter) within the given time
				const confirmation = await response.awaitMessageComponent({
					filter: collectorFilter,
					time: 60000,
				});

				// If the confirmation is collected (passed the filter) within the given time, check which button was clicked
				if (confirmation.customId === 'confirm') {
					console.log(`Guild: ${interaction.guild.id} deleting ${removeAmount} messages from Channel: ${channel.name}`);

					// Call bulkDelete() to remove the amount of messages, including those older than 2 weeks (second param true)
					await channel.bulkDelete(removeAmount, true);

					// Update original message to say messages were deleted, remove the components
					await confirmation.update({
						content: `Deleted ${removeAmount} messages from Channel: ${channel.name}`,
						components: [],
					});

					return;
				} else if (confirmation.customId === 'cancel') {
					// If the cancel option is chosen, update original message to say cancelled and remove the components
					await confirmation.update({
						content: 'Action cancelled',
						components: [],
					});

					return;
				}
			} catch (error) {
				// If error is thrown (most likely timeout), edit the reply and remove the components
				await interaction.editReply({
					content: 'Confirmation not recieved within 1 minute, cancelling',
					components: [],
				});

				return;
			}
		}

		// Call bulkDelete() to remove the amount of messages, including those older than 2 weeks (second param true)
		await channel.bulkDelete(removeAmount, true);

		console.log(`Guild: ${interaction.guild.id} deleted ${removeAmount} messages from Channel: ${channel.name}`);

		// Send reply to user who gave command to delete messages
		await interaction.reply({
			content: `Deleted ${removeAmount} messages from Channel: ${channel.name}`,
			ephemeral: true,
		});
		return;
	},
};

export default exportedMethods;