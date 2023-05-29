import { Events, ActivityType } from 'discord.js';

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
const exportedMethods = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.user.setUsername('ImmatureBot V2');
		client.user.setActivity('you', { type: ActivityType.Watching });

		/* TODO:
			Check if all necessary channels exist
			If not, send message to default/first channel asking to create required channels?
				- Could use buttons to confirm that 'x, y, z, etc' channels would be created
				- Could have message just say to use /create-required-channels command instead
					- make usable by admin/mods only
			Create job schedules for all necessary DB functions once implemented
				- Birthday, Event(?), Twitch Token, Streamer
		*/

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default exportedMethods;