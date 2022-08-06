const {
	getUsers,
	getUser,
	createUser,
	deleteUser,
	updateUser,
} = require("../controllers/user.controllers");

const router = require("express").Router();

router.get("/", getUsers);
router.get("/:userId", getUser);
router.post("/", createUser);
router.delete("/:userId", deleteUser);
router.put("/:userId", updateUser);

module.exports = router;
