import { Events } from 'discord.js';
import Guild from '../data/models/guilds.js';
import { getGuildBackupChannel } from '../utils/helper.js';

// When client (bot) joins a guild, create necessary DB collection/tables for them
const exportedMethods = {
	name: Events.GuildCreate,
	async execute(guild) {
		const id = guild.id;

		// Check MongoDB if guild already exists with ID
		// .exists() returns either the document if it matches or null
		const guildExists = await Guild.exists({ _id: id });
		if (guildExists) {
			console.log(`Guild ${guild.name} already exists in DB`);
			return;
		}

		// Create the initial guild document for new guild
		// The subdocuments will be created as empty arrays
		const guildDoc = new Guild({
			_id: id,
		});

		// Save the document in the Guild Collection
		await guildDoc.save();
		console.log(`Guild ${guild.name} added to DB`);

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

		// If there are required channels that aren't in the guild, reqChannel array will have the names of them
		if (reqChannels.length) {
			console.log(`On guildCreate: ${guild.name} is missing ${reqChannels.join(' - ')}`);

			// Get the system channel (channel where default messages go to)
			const sysChannel = guild.systemChannel;

			// If the system channel is null (deleted/disabled/removed from guild)
			if (!sysChannel) {
				// Get a backup channel, any channel bot has permission to send messages to
				const backupChannel = getGuildBackupChannel(guild);

				// If there are no text channels that the bot can send messages to, log an additional error message and exit
				if (!backupChannel) {
					console.log(`Error: ${guild.name} Guild has no text channels that bot can send messages to. *** CANNOT INFORM GUILD TO CREATE REQUIRED CHANNELS ***`);
					return;
				}
				// Send error message to backup channel that required channels are not available
				return backupChannel.send({
					content: `This bot requires several specifically named channels to function properly. 
												\nmember-log			: For logging when members join/leave the server
												\nfreestuff				: For containing all messages about adding, claiming, and listing free games
												\nreminders				: For sending message reminders to participants for events
												\nlive-promotions		: For sending messages when a streamer goes live
												\nA moderator can run the slash command '/create-required-channels' to create the necessary channels` });
			}

			// Send error message to backup channel that required channels are not available
			sysChannel.send({
				content: `This bot requires several specifically named channels to function properly. 
												member-log			: For logging when members join/leave the server
												freestuff				: For containing all messages about adding, claiming, and listing free games
												reminders				: For sending message reminders to participants for events
												live-promotions		: For sending messages when a streamer goes live
												\nA moderator can run the slash command '/create-required-channels' to create the necessary channels` });
			// Exit out of function
			return;
		}

		return;
	},
};

export default exportedMethods;