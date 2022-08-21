const userModels = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/nodemailer");
const Redis = require("ioredis");
const crypto = require("crypto");
const redisIO = new Redis({
	port: process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
});
const login = async (req, res) => {
	try {
		const userExist = await userModels.findOne({ email: req.body.email });
		if (!userExist)
			return res.status(403).json({ message: "Wrong email/password" });

		const validPassword = await bcrypt.compare(
			req.body.password,
			userExist.password
		);
		if (!validPassword)
			return res.status(403).json({ message: "Wrong email/password" });

		const token = jwt.sign(
			{
				_id: userExist._id,
				isAdmin: userExist.isAdmin,
				isEmailVerified: userExist.isEmailVerified,
			},
			process.env.TOKEN_KEY,
			{
				expiresIn: "2 days",
			}
		);
		return res.status(200).json({ token: token, user: userExist });
	} catch (err) {
		return res.status(500).json(err);
	}
};
const register = async (req, res) => {
	try {
		const userExist = await userModels.findOne({ email: req.body.email });
		if (userExist)
			return res.status(403).json({ message: "Email already exist" });

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		const newUser = new userModels({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: hashedPassword,
		});
		const savedUser = await newUser.save();
		const code = crypto
			.randomBytes(Math.ceil(6 / 2))
			.toString("hex")
			.slice(0, 6)
			.toUpperCase();
		redisIO.set(code, savedUser.email, "ex", 3600);
		await transporter.sendMail({
			from: "contact@wattpad-clone.com",
			to: savedUser.email,
			subject: "verify your account",
			html: `<p> ${code} </p>`,
		});
		return res.status(200).json({ message: "verify your account" });
	} catch (err) {
		return res.status(500).json(err);
	}
};
const verifyEmail = async (req, res) => {
	try {
		if (!req.query.code) {
			return res.status(403).json("no verification token provided");
		}
		const email = await redisIO.get(req.query.code);
		const user = await userModels.findOneAndUpdate(
			{ email: email },
			{ isEmailVerified: true },
			{ new: true }
		);
		return res.status(200).json("account verified");
	} catch (err) {
		return res.status(500).json(err);
	}
};
const forgotPassword = async (req, res) => {
	try {
		const userExist = await userModels.findOne({ email: req.body.email });
		if (!userExist)
			return res.status(200).json({
				message: "if your email valid check your inbox to reset password",
			});

		const code = crypto
			.randomBytes(Math.ceil(6 / 2))
			.toString("hex")
			.slice(0, 6)
			.toUpperCase();
		redisIO.set(code, userExist.email, "ex", 3600);

		await transporter.sendMail({
			from: "contact@wattpad-clone.com",
			to: userExist.email,
			subject: "reset password",
			html: `<p> ${code} </p>`,
		});
		return res.status(200).json({
			message: "if your email valid check your inbox to reset password",
		});
	} catch (err) {
		return res.status(500).json(err);
	}
};
const resetPassword = async (req, res) => {
	try {
		const email = await redisIO.get(req.body.code);
		const user = await userModels.findOne({ email: email });
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		user.password = hashedPassword;
		await user.save();
		return res.status(200).json({ message: "your password has changed" });
	} catch (err) {
		return res.status(500).json(err);
	}
};
module.exports.login = login;
module.exports.register = register;
module.exports.verifyEmail = verifyEmail;
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
