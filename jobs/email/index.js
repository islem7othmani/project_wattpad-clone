const transporter = require("../../utils/nodemailer");
module.exports.sendMail = async (data) => {
	await transporter.sendMail({
		from: data.from,
		to: data.to,
		subject: data.subject,
		html: data.body,
	});
};
