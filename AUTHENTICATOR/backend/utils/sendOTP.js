import nodemailer from 'nodemailer';


const sendOTP =  async (email, otp) => {
        try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                // replace with user email and password 
                user: 'hruthikesh2008@gmail.com',
                pass: 'gtss miyh edws ufyq',
            },
        });

        const mailOptions = {
            from: 'hruthikesh2008@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
        };

        const info =
            await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export { sendOTP };

