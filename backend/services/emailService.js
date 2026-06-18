const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a reusable transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendPriceDropEmail(userEmail, productName, targetPrice, currentPrice, productUrl) {
    const mailOptions = {
        from: `"PriceWise Alerts" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `🔔 Price Drop Alert: ${productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 16px;">
                <h2 style="color: #6366f1;">🎉 Price Drop Alert!</h2>
                <p>Good news! The price of a product you're tracking has dropped to your target price.</p>
                <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #f1f5f9;">${productName}</h3>
                    <p style="margin: 5px 0;">Your Target Price: <strong style="color: #94a3b8;">₹${targetPrice}</strong></p>
                    <p style="margin: 5px 0;">Current Price: <strong style="color: #22c55e; font-size: 20px;">₹${currentPrice}</strong></p>
                </div>
                <a href="${productUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">Buy Now →</a>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">You received this email because you set a price alert on PriceWise.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { sendPriceDropEmail };