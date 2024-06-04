import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

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