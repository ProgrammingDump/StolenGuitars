const nodemailer = require('nodemailer')

let transporterPromise = (async () => {
	if (process.env.SMTP_HOST) {
		return nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT) || 587,
			secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		})
	} else {
		console.log(
			'No SMTP configuration in .env. Creating ephemeral Ethereal test account...',
		)
		const testAccount = await nodemailer.createTestAccount()
		return nodemailer.createTransport({
			host: testAccount.smtp.host,
			port: testAccount.smtp.port,
			secure: testAccount.smtp.secure,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		})
	}
})()

const sendVerificationEmail = async (
	email,
	username,
	token,
) => {
	try {
		const transporter = await transporterPromise
		const port = process.env.PORT || 5050
		const verificationLink = `http://localhost:${port}/api/auth/verify?token=${token}`

		const mailOptions = {
			from: '"Stolen Guitars" <noreply@stolenguitars.com>',
			to: email,
			subject: 'Verify your email address - Stolen Guitars',
			html: `
				<h2>Hello, ${username}!</h2>
				<p>Thank you for signing up on Stolen Guitars. Please verify your email address by clicking the link below:</p>
				<p style="margin: 20px 0;">
					<a href="${verificationLink}" style="padding: 10px 20px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
				</p>
				<p>Or copy and paste this link into your browser:</p>
				<p><a href="${verificationLink}">${verificationLink}</a></p>
				<p>This link is valid for 24 hours.</p>
			`,
		}

		const info = await transporter.sendMail(mailOptions)
		console.log(`Verification email sent to ${email}`)

		if (!process.env.SMTP_HOST) {
			console.log(
				`Preview URL: ${nodemailer.getTestMessageUrl(info)}`,
			)
		}
	} catch (error) {
		console.error('Error sending verification email:', error)
	}
}

module.exports = { sendVerificationEmail }
