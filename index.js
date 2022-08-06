//import section
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
//db connection
mongoose.connect("mongodb://localhost:27017/wattpad-clone");
mongoose.connection.on("connected", () => {
	console.log("DB connected");
});
mongoose.connection.on("error", (err) => {
	console.log("Mongodb failed with- ", err);
});
//import routes
const userRoutes = require("./routes/user.routes");
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
//router middleware
app.use("/users", userRoutes);
//server listening
const port = 8000;
app.listen(port, () => {
	console.log(`server yemchi jawou fesfes 3al port ${port}`);
});
