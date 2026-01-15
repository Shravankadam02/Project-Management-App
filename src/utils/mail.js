import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: { 
            name: "Project Management App",
            link: "https://projectmanagementapp.com/"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent
    );

    const emailHTML = mailGenerator.generate(
        options.mailgenContent
    );

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRP_SMTP_HOST,
        port: process.env.MAILTRP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRP_SMTP_USER,
            pass: process.env.MAILTRP_SMTP_PASS
        }
    });

    const mail = {
        from: "mail.taskmanager@projectmanagementapp.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    };

    try {
        await transporter.sendMail(mail);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const emailVerificationMailgenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Project Management App! We're very excited to have you on board.",
            action: {
                instructions: "To get started with your account, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Verify your email", 
                    link: verificationURL
                }
            },
            outro: "Need help? Contact us at support@projectmanagement.com, we're here to assist you."
        }
    };
};

const forgotPasswordMailgenContent = (username, passwordResetURL) => {
    return {
        body: {
            name: username,
            intro: "You have requested a password reset for your account.",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Reset Password", 
                    link: passwordResetURL
                }
            },
            outro: "Need help? Contact us at support@projectmanagement.com, we're here to assist you."
        }
    };
};

export { 
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
};
