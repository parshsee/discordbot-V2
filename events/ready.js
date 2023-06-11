import { Events, ActivityType } from 'discord.js';
import { scheduleJob } from 'node-schedule';
import * as helper from '../utils/helper.js';
import dbConnection from '../data/mongooseConnection.js';

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
const exportedMethods = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.user.setUsername('ImmatureBot V2');
		client.user.setActivity('you', { type: ActivityType.Watching });

		// Connect to database
		await dbConnection();

		/* TODO:
			Check if all necessary channels exist
			If not, send message to default/first channel asking to create required channels?
				- Could use buttons to confirm that 'x, y, z, etc' channels would be created
				- Could have message just say to use /create-required-channels command instead
					- make usable by admin/mods only
			Create job schedules for all necessary DB functions once implemented
				- Birthday, Event(?), Twitch Token, Streamer
		*/

		// Use node-scheduler to create a cron-job that runs every minute
		// Calls the twitch token validator, to check that the token is not expired (if it is, it will retrieve a new token as well)
		scheduleJob('*/1 * * * *', async () => helper.twitchTokenValidator());

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default exportedMethods;