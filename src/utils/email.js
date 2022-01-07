const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmEmail = async (user) => {
    const msg = {
        to: user.email, // Change to your recipient
        from: 'jana.teaching07@gmail.com', // Change to your verified sender
        subject: 'Confirm you email account',
        html: `
            <p style="color: lightgrey; margin-bottom: 10px;">Welcome, ${user.name}. Please confirm your email account by clicking the confirm link below.</p>
            <a href="${process.env.DOMAIN_URL}/confirm_account?userid=${user._id}">Confirm</a>
        `,
    }
    
    await sgMail.send(msg);
}

module.exports = {
    sendConfirmEmail: sendConfirmEmail
}
