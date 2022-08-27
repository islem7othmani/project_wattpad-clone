const { Worker } = require("bullmq");
const {
	EMAIL_QUEUE,
	SEND_EMAIL_VERIFICATION,
	SEND_RESET_EMAIL,
} = require("../constants");
const { sendMail } = require("../jobs/email");
const dotenv = require("dotenv");
dotenv.config();
const emailWorker = new Worker(
	EMAIL_QUEUE,
	async (job) => {
		switch (job.name) {
			case SEND_EMAIL_VERIFICATION:
				await sendMail(job.data);
				break;
			case SEND_RESET_EMAIL:
				await sendMail(job.data);
			default:
				break;
		}
	},
	{
		connection: {
			port: process.env.REDIS_PORT,
			host: process.env.REDIS_HOST,
		},
	}
);

emailWorker.on("completed", (job) => {
	console.log(`${job.name} is completed`);
});
emailWorker.on("error", (err) => {
	console.log(`error with ${err}`);
});
emailWorker.on("failed", (job, err) => {
	console.log(`${job.name} is failed with ${err}`);
});
