import * as nodemailer from "nodemailer";
import * as config from "../../server_config.json";

export const sendMail = async (to: string, subject: string, body: string) => {
  try {
    // Create nodemailer transporter with gmail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    console.log(process.env.GMAIL_ACCOUNT);
    console.log(process.env.GMAIL_APP_PASSWORD);

    // define email options
    const mailOptions = {
      from: "pms-support@pms.com",
      to: to,
      subject: subject,
      html: body,
    };

    // Send the email
    const status = await transporter.sendMail(mailOptions);
    if (status?.messageId) {
      return status.messageId;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error when sending email => ", error.message);
    return false;
  }
};
