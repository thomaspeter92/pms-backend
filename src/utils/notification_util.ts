import * as nodemailer from "nodemailer";
import Queue from "bull";

export class NotificationUtil {
  private static transporter;
  private static from: string;

  private static emailQueue = new Queue("emailQueue", "redis://127.0.0.1:6379");

  constructor(config) {
    if (!config) {
      throw new Error("Config not provided");
    }
    if (!NotificationUtil.transporter) {
      NotificationUtil.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_ACCOUNT,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    }
    NotificationUtil.from = config.email_config.from;
  }

  public static async sendEmail(to: string, subject: string, body: string) {
    try {
      const mailOptions = {
        from: NotificationUtil.from,
        to: to,
        subject: subject,
        html: body,
      };

      const status = await NotificationUtil.transporter.sendMail(mailOptions);
      if (status?.messageId) {
        return status.messageId;
      } else return false;
    } catch (error) {
      console.log("Error while sending email", error.message);
      return false;
    }
  }

  public static async enqueueEmail(to: string, subject: string, body: string) {
    await NotificationUtil.emailQueue.add({
      to,
      subject,
      body,
    });
  }
}
