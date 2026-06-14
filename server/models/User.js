const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores (no spaces)'],
		minlength: [3, 'Username must be at least 3 characters'],
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	verificationToken: {
		type: String,
	},
	verificationTokenExpires: {
		type: Date,
	},
	timestamps: {
		type: Date,
		default: Date.now,
	},
})
module.exports = mongoose.model(
	'User',
	userSchema,
)
