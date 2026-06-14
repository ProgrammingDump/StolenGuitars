const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const { sendVerificationEmail } = require('../utils/emailer')

const router = express.Router()

// SIGN UP ROUTE

router.post(
	'/signup',
	async (req, res) => {
		try {
			const {
				username,
				email,
				password,
			} = req.body

			// Validate username format (single word, alphanumeric + underscores, min 3 chars)
			if (!username || username.length < 3 || /\s/.test(username) || !/^[a-zA-Z0-9_]+$/.test(username)) {
				return res.status(400).json({
					message: 'Error: Username must be at least 3 characters and contain only letters, numbers, and underscores (no spaces)',
				})
			}

			const existingUser =
				await User.findOne({
					$or: [
						{ email },
						{ username },
					],
				})
			if (existingUser) {
				return res.status(400).json({
					message:
						'Error: User already exists',
				})
			}

			const hashedPassword =
				await bcrypt.hash(password, 10)

			// Generate verification token
			const verificationToken = crypto.randomBytes(32).toString('hex')
			const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

			// Create a new user (unverified)
			const user = await User.create({
				username,
				email,
				password: hashedPassword,
				isVerified: false,
				verificationToken,
				verificationTokenExpires,
			})

			// Send verification email
			await sendVerificationEmail(user.email, user.username, verificationToken)

			return res.status(201).json({
				message: 'Signup successful! Please check your email to verify your account.',
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({
				message: 'Server error',
			})
		}
	},
)

// VERIFY EMAIL ROUTE

router.get(
	'/verify',
	async (req, res) => {
		try {
			const { token } = req.query

			if (!token) {
				return res.redirect('http://localhost:5173/login?verified=false')
			}

			const user = await User.findOne({
				verificationToken: token,
				verificationTokenExpires: { $gt: Date.now() },
			})

			if (!user) {
				return res.redirect('http://localhost:5173/login?verified=false')
			}

			// Mark as verified and clear verification fields
			user.isVerified = true
			user.verificationToken = undefined
			user.verificationTokenExpires = undefined
			await user.save()

			return res.redirect('http://localhost:5173/login?verified=true')
		} catch (err) {
			console.error(err)
			return res.redirect('http://localhost:5173/login?verified=false')
		}
	},
)

// LOGIN ROUTE

router.post(
	'/login',
	async (req, res) => {
		try {
			const { email, password } =
				req.body

			//find user by email
			const user = await User.findOne({
				email,
			})
			if (!user) {
				return res.status(400).json({
					message:
						'Error: Invalid credentials',
				})
			}

			//compare password
			const isMatch =
				await bcrypt.compare(
					password,
					user.password,
				)
			if (!isMatch) {
				return res.status(400).json({
					message:
						'Error: Invalid credentials',
				})
			}

			// Check email verification status
			if (!user.isVerified) {
				return res.status(401).json({
					message: 'Error: Please verify your email first before logging in.',
				})
			}

			//generate JWT token
			const token = jwt.sign(
				{ id: user._id },
				process.env.JWT_SECRET,
				{
					expiresIn: '7d',
				},
			)

			return res.status(200).json({
				message: 'Login successful',
				token,
				user: {
					id: user._id,
					username: user.username,
					email: user.email,
				},
			})
		} catch (err) {
			console.error(err)
			return res.status(500).json({
				message: 'Server error',
			})
		}
	},
)

module.exports = router
