import { ActionRowBuilder, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { cancel, confirm } from '../../utils/helper.js';

const exportedMethods = {
	data: new SlashCommandBuilder()
		.setName('create-required-channels')
		.setDescription('Mod Command: Create necessary channels for various bot commands to work')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		const guild = interaction.guild;

		// Check if the guild is available to create channels
		if (!guild.available) {
			console.log('Error: Guild not available for creating required channels');
			return;
		}

		/* Static array of all the required channels for bot to work properly
			member-log			: For logging when members join/leave the server
			freestuff			: For containing all messages about adding, claiming, and listing free games
			reminders			: For sending message reminders to participants for events
			live-promotions		: For sending messages when a streamer goes live
		*/
		let reqChannels = ['member-log', 'freestuff', 'reminders', 'live-promotions'];

		// Check that every channel name is within the guilds channels
		// .filter() returns a new array filtering out the values that don't pass the condition inside
		// guild.channels.cache is a Collection which has some array functions, but not .includes()
		// Instead use .find() to iterate through the Collection of channels where the guild ch.name equals the channel name from reqChannel
		// 		.find() returns the Channel object if found, undefined otherwise, which is then converted to a bool value using truthy/falsy JS logic
		// 		If a Channel object is returned, it becomes true because its truthy
		// 		If undefined is returned, it becomes false because its falsy
		// Return the opposite (!) to filter the required array and get the channel names that AREN'T in the guild (otherwise it would return the names of those that are in the guild)
		reqChannels = reqChannels.filter(channel => !guild.channels.cache.find(ch => ch.name == channel));

		// Need to have confirm/cancel buttons for each channel being created

		// Check if all channels are present in guild (so filter would make reqChannels an empty array)
		if (reqChannels.length === 0) {
			// Log that all channels exist within guild
			console.log(`Guild ${guild.name} has all required channels, aborting comamnd`);
			// Return reply that all channels already exist
			return await interaction.reply({
				content: 'All required channels already exist within server',
				ephemeral: true,
			});
		}

		// Create an action row with confirm and cancel buttons
		const row = new ActionRowBuilder()
			.addComponents(confirm, cancel);

		const response = await interaction.reply({
			content: `Creating ${reqChannels.length} channel(s): ${reqChannels.join(' - ')}`,
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
				// Loop through the array of channels
				for (const channel of reqChannels) {
					// Check for each required channel
					// Create the channel if needed
					if (channel === 'member-log') {
						// Create member-log
						// Permission overwrite: Allow bot (using bot id) to send messages, Deny everyone else from sending messages
						guild.channels.create({
							name: 'member-log',
							type: ChannelType.GuildText,
							permissionOverwrites: [
								{
									id: interaction.client.user.id,
									allow: [PermissionFlagsBits.SendMessages],
								},
								{
									id: guild.roles.everyone,
									deny: [PermissionFlagsBits.SendMessages],
								},
							],
						});
					} else if (channel === 'freestuff') {
						// Create freestuff
						guild.channels.create({
							name: 'freestuff',
							type: ChannelType.GuildText,
						});
					} else if (channel === 'reminders') {
						// Create reminders
						guild.channels.create({
							name: 'reminders',
							type: ChannelType.GuildText,
						});
					} else if (channel === 'live-promotions') {
						// Create live-promotions
						guild.channels.create({
							name: 'live-promotions',
							type: ChannelType.GuildText,
						});
					}
				}
				// Update original message to say channels were created, remove the components
				await confirmation.update({
					content: 'Channels created',
					components: [],
				});
			} else if (confirmation.customId === 'cancel') {
				// If the cancel option is chosen, update original message to say cancelled and remove the components
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