const mongoose = require('mongoose')

const guitarSchema = new mongoose.Schema({
	brand: {
		type: String,
		required: true,
	},
	model: {
		type: String,
		required: true,
	},
	serialNumber: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	images: [{
		type: String,
		required: true,
	}],
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Guitar', guitarSchema)
