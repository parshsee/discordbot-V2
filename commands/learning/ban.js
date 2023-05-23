import { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),
	async execute(interaction) {
		// Get the user value using the name of the option provided
		const target = interaction.options.getUser('target');
		// Get the string 'reason' value using the name of  the option provided
		// Since it's not required, have nullish coalescing operator to provide a value if it's not given
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		// Creating a confirm button
		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Ban')
			.setStyle(ButtonStyle.Danger);

		// Creating a cancel button
		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		// Creating a link button
		const linkExample = new ButtonBuilder()
			.setLabel('discord.js docs')
			.setURL('https://discord.js.org')
			.setStyle(ButtonStyle.Link);

		// Creating a disabled button
		const disabledExample = new ButtonBuilder()
			.setCustomId('disabled')
			.setLabel('I am disabled')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(true);

		// Creating an action row
		// The order you add components is the order they will show up
		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm, linkExample, disabledExample);

		// Replying with a message and components
		// Reply becomes an object, with content and components
		// Store the response as a variable (awaiting components topic)
		const response = await interaction.reply({
			content: `Banning ${target.username} for reason: ${reason}`,
			components: [row],
		});

		// Create a filter (function expression) to ensure that only the user who triggered the original interaction can use the buttons
		const collectorFilter = i => i.user.id === interaction.user.id;

		try {
			// Wait for an interaction with the message component (that passes the filter) in the given time
			// time: in milliseconds
			const confirmation = await response.awaitMessageComponent({
				filter: collectorFilter,
				time: 60000,
			});

			// If the confirmation is collected (passes filter in given time), check which button was clicked
			// Then perform the appropriate action
			if (confirmation.customId === 'confirm') {
				// Don't actually want to ban anyone lol
				// await interaction.guild.members.ban(target);
				await confirmation.update({
					content: `${target.username} has been banned for reason: ${reason}`,
					components: [],
				});
			} else if (confirmation.customId === 'cancel') {
				await confirmation.update({
					content: 'Action cancelled',
					components: [],
				});
			}
		} catch (error) {
			// If error is thrown (most likely timeout), edit the reply and remove the components
			await interaction.editReply({
				content: 'Confirmation not recieved within 1 minute, cancelling',
				components: [],
			});
		}
	},
};

export default exportedMethods;