import { EmbedBuilder, Events, PermissionFlagsBits } from 'discord.js';

const exportedMethods = {
	name: Events.GuildMemberAdd,
	async execute(guildMember) {
		const guild = guildMember.guild;

		// Check if the guild is available to send message to
		if (!guild.available) {
			console.log('Error: Guild not available for member logging (add)');
			return;
		}

		// Check that the member log channel exists within guild
		// Will return the channel info or undefined
		const memberLogChannel = guild.channels.cache.find(channel => channel.name === 'member-log');

		// If there is no member-log channel
		if (!memberLogChannel) {
			// Log that the guild doesn't have a member-log channel
			console.log(`Error: ${guild.name} Guild does not have member-log channel for logging (add)`);

			// Get the system channel (channel where default messages go to)
			const sysChannel = guild.systemChannel;

			// If the system channel is null (deleted/disabled/removed from guild)
			if (!sysChannel) {
				// Find another channel to send error message to
				//		- Check that the channel is type 0 --- TextChannel type
				//		- Check that the permissions for the bot (using bots id) for the channel includes SendMessages (check that the bot can send messages to this text channel)
				const backupChannel = guild.channels.cache.find(channel => channel.type === 0 && channel.permissionsFor(guild.client.user.id).any(PermissionFlagsBits.SendMessages));

				// If there are no text channels that the bot can send messages to, log an additional error message and exit
				if (!backupChannel) {
					console.log(`Error: ${guild.name} Guild has no text channels that bot can send messages to. member-logging (add) not performed`);
					return;
				}
				// Send error message to backup channel that required channels are not available
				return backupChannel.send({ content: `Error: ${guild.name} does not have a member-log channel for logging (add).\nA moderator can run the slash command '/create-required-channels' to create the necessary channels` });
			}

			// Send error message to backup channel that required channels are not available
			sysChannel.send({ content: `Error: ${guild.name} does not have a member-log channel for logging (add).\nA moderator can run the slash command '/create-required-channels' to create the necessary channels` });

			// Exit out of function
			return;
		}

		// Create and send an embed that the user has joined
		const embed = new EmbedBuilder()
			.setFooter({
				text: `${guildMember.user.tag} has joined`,
				iconURL: guildMember.user.displayAvatarURL(),
			});


		console.log(`${guildMember.user.tag} has joined ${guild.name}`);

		// Send the embed in the member-log channel
		memberLogChannel.send({ embeds: [embed] });

	},
};

export default exportedMethods;