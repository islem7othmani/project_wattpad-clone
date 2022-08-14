//import section
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const tagModels = require("../models/tag.models");
const categoryModels = require("../models/category.model");
const userModels = require("../models/user.models");
const path = require("path");
const fs = require("fs/promises");
mongoose.connect(process.env.MONGO_DB_URI);
mongoose.connection.on("connected", async () => {
	try {
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash("azerty123", salt);
		const newUser = new userModels({
			firstName: "raed",
			lastName: "bahri",
			email: "raedbahri90@gmail.com",
			password: hashedPassword,
		});
		await newUser.save();
		const tagsJson = await fs.readFile(
			path.resolve("./", "scripts", "tags.json")
		);
		const tags = JSON.parse(tagsJson);
		await tagModels.insertMany(tags);
		const catJson = await fs.readFile(
			path.resolve("./", "scripts", "categories.json")
		);
		const categories = JSON.parse(catJson);
		await categoryModels.insertMany(categories);
		process.exit(0);
	} catch (err) {
		console.log("script end with error -", err);
		process.exit(1);
	}
});

mongoose.connection.on("error", (err) => {
	console.log("Mongodb failed with- ", err);
});
