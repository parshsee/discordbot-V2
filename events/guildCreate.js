import { Events } from 'discord.js';
import Guild from '../data/models/guilds.js';

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

	},
};

export default exportedMethods;