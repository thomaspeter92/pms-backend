import * as nodemailer from "nodemailer";

export class NotificationUtil {
  private static transporter;
  private static from: string;

  constructor(config) {
    if (!config) {
      throw new Error("Config not provided");
    }
    if (!NotificationUtil.transporter) {
      NotificationUtil.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email_config.user,
          pass: config.email_config.password,
        },
      });
      NotificationUtil.from = config.email_config.from;
    }
  }

  public async sendEmail(to: string, subject: string, body: string) {
    try {
      const mailOptions = {
        from: NotificationUtil.from,
        to: to,
        subject: subject,
        html: body,
      };

      const status = await NotificationUtil.transporter.sendEmail(mailOptions);
      if (status?.messageId) {
        return status.messageId;
      } else return false;
    } catch (error) {
      console.log("Error while sending email", error.message);
      return false;
    }
  }
}
