const multer = require('multer')
const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')

// Cloudinary config
const isCloudinaryConfigured = !!(
	process.env.CLOUDINARY_CLOUD_NAME &&
	process.env.CLOUDINARY_API_KEY &&
	process.env.CLOUDINARY_API_SECRET
)

if (isCloudinaryConfigured) {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	})
	console.log('Cloudinary successfully configured!')
} else {
	console.log('Cloudinary credentials missing. Falling back to local disk storage.')
}

// Multer memory storage (keeps file buffers in memory)
const storage = multer.memoryStorage()
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit per file
	},
})

// Helper function to upload to Cloudinary via stream
const uploadToCloudinary = (fileBuffer) => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{ folder: 'stolen_guitars' },
			(error, result) => {
				if (error) return reject(error)
				resolve(result.secure_url)
			}
		)
		uploadStream.end(fileBuffer)
	})
}

// Helper to save to local disk
const saveToLocalDisk = (file) => {
	const publicDir = path.join(__dirname, '..', 'public')
	const uploadsDir = path.join(publicDir, 'uploads')

	// Ensure directories exist
	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir, { recursive: true })
	}
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true })
	}

	const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
	const ext = path.extname(file.originalname) || '.jpg'
	const filename = file.fieldname + '-' + uniqueSuffix + ext
	const filepath = path.join(uploadsDir, filename)

	fs.writeFileSync(filepath, file.buffer)
	return `/uploads/${filename}`
}

// Main upload handler
const handleUploads = async (files) => {
	if (!files || files.length === 0) return []

	const uploadPromises = files.map((file) => {
		if (isCloudinaryConfigured) {
			return uploadToCloudinary(file.buffer)
		} else {
			return Promise.resolve(saveToLocalDisk(file))
		}
	})

	return Promise.all(uploadPromises)
}

module.exports = {
	upload,
	handleUploads,
}
