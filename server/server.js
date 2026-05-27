const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()

const authRoutes = require('./routes/authRoutes')

// CORS
app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
		methods: [
			'GET',
			'POST',
			'PUT',
			'DELETE',
		],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
		],
	}),
)

// middleware
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/api/auth', authRoutes)

// DB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() =>
		console.log('MongoDB Connected'),
	)
	.catch((err) =>
		console.log('Error:', err),
	)

// test
app.get('/', (req, res) => {
	res.send('API Running')
})

// start
app.listen(process.env.PORT, () => {
	console.log(
		`Server running on port ${process.env.PORT}`,
	)
})
