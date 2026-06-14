const express = require('express')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const Guitar = require('../models/Guitar')
const { upload, handleUploads } = require('../utils/upload')

const router = express.Router()

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
	const token = req.cookies.token
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized: No token provided' })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.userId = decoded.id
		next()
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized: Invalid token' })
	}
}

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
				.populate('userId', 'username')

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
	verifyToken,
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

			// Create database entry with userId
			const newGuitar = await Guitar.create({
				userId: req.userId,
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

// UPDATE A GUITAR (ONLY OWNER)
router.put(
	'/:id',
	verifyToken,
	runUpload,
	async (req, res) => {
		try {
			const guitar = await Guitar.findById(req.params.id)

			if (!guitar) {
				return res.status(404).json({
					message: 'Guitar not found',
				})
			}

			// Check if user is the owner
			if (guitar.userId.toString() !== req.userId) {
				return res.status(403).json({
					message: 'Forbidden: You can only edit your own guitars',
				})
			}

			const { brand, model, serialNumber, location, description, keptImages } = req.body

			// Validation
			if (!brand || !model || !serialNumber || !location) {
				return res.status(400).json({
					message: 'Error: Brand, Model, Serial Number, and Last Seen Location are required.',
				})
			}

			// Handle new uploads if provided
			let imageUrls = []
			if (req.files && req.files.length > 0) {
				imageUrls = await handleUploads(req.files)
			}

			// Combine kept images with new images
			const keptImageArray = keptImages ? JSON.parse(keptImages) : []
			const finalImages = [...keptImageArray, ...imageUrls]

			// Validate at least one image
			if (finalImages.length === 0) {
				return res.status(400).json({
					message: 'Error: At least one image is required.',
				})
			}

			// Update guitar
			guitar.brand = brand
			guitar.model = model
			guitar.serialNumber = serialNumber
			guitar.location = location
			guitar.description = description
			guitar.images = finalImages

			await guitar.save()

			return res.status(200).json({
				message: 'Guitar updated successfully.',
				guitar,
			})
		} catch (err) {
			console.error('Error updating guitar:', err)
			return res.status(500).json({
				message: 'Server error while updating guitar',
			})
		}
	},
)

// DELETE A GUITAR (ONLY OWNER)
router.delete(
	'/:id',
	verifyToken,
	async (req, res) => {
		try {
			const guitar = await Guitar.findById(req.params.id)

			if (!guitar) {
				return res.status(404).json({
					message: 'Guitar not found',
				})
			}

			// Check if user is the owner
			if (guitar.userId.toString() !== req.userId) {
				return res.status(403).json({
					message: 'Forbidden: You can only delete your own guitars',
				})
			}

			await Guitar.findByIdAndDelete(req.params.id)

			return res.status(200).json({
				message: 'Guitar deleted successfully.',
			})
		} catch (err) {
			console.error('Error deleting guitar:', err)
			return res.status(500).json({
				message: 'Server error while deleting guitar',
			})
		}
	},
)

module.exports = router
