const express = require('express')
const multer = require('multer')
const Guitar = require('../models/Guitar')
const { upload, handleUploads } = require('../utils/upload')

const router = express.Router()

// Custom middleware to handle Multer upload validation errors gracefully
const runUpload = (req, res, next) => {
	upload.array('images', 5)(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return res.status(400).json({ message: 'Error: Each file size must be less than 10MB.' })
			}
			if (err.code === 'LIMIT_UNEXPECTED_FILE') {
				return res.status(400).json({ message: 'Error: Maximum of 5 images allowed.' })
			}
			return res.status(400).json({ message: `Upload error: ${err.message}` })
		} else if (err) {
			return res.status(500).json({ message: `Server upload error: ${err.message}` })
		}
		next()
	})
}

// GET ALL GUITARS (PAGINATED)
router.get(
	'/',
	async (req, res) => {
		try {
			const page = parseInt(req.query.page) || 1
			const limit = parseInt(req.query.limit) || 6
			const skip = (page - 1) * limit

			const total = await Guitar.countDocuments()
			const guitars = await Guitar.find()
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)

			const hasMore = skip + guitars.length < total

			return res.status(200).json({
				guitars,
				total,
				hasMore,
				page,
			})
		} catch (err) {
			console.error('Error fetching guitars:', err)
			return res.status(500).json({
				message: 'Server error while fetching guitars',
			})
		}
	},
)

// REPORT A STOLEN GUITAR (UPLOAD IMAGES)
router.post(
	'/',
	runUpload,
	async (req, res) => {
		try {
			const { brand, model, serialNumber, location, description } = req.body

			// Validation
			if (!brand || !model || !serialNumber || !location) {
				return res.status(400).json({
					message: 'Error: Brand, Model, Serial Number, and Last Seen Location are required.',
				})
			}

			if (!req.files || req.files.length === 0) {
				return res.status(400).json({
					message: 'Error: At least one guitar image is required.',
				})
			}

			// Handle uploads to Cloudinary or Local Fallback
			const imageUrls = await handleUploads(req.files)

			// Create database entry
			const newGuitar = await Guitar.create({
				brand,
				model,
				serialNumber,
				location,
				description,
				images: imageUrls,
			})

			return res.status(201).json({
				message: 'Stolen guitar reported successfully.',
				guitar: newGuitar,
			})
		} catch (err) {
			console.error('Error reporting stolen guitar:', err)
			return res.status(500).json({
				message: 'Server error while reporting guitar',
			})
		}
	},
)

module.exports = router
