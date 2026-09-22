import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const mailOptions = {
    from: `"New Yuwa Boys Mandal Book" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `MandalBook — आपला लॉगिन OTP: [${otp}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MandalBook OTP</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9FAFB; margin: 0; padding: 20px; }
          .container { max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #FED7AA; box-shadow: 0 4px 15px rgba(246,112,32,0.1); }
          .header { background: linear-gradient(135deg, #F67020 0%, #EA580C 100%); padding: 24px; text-align: center; color: white; }
          .title { font-size: 20px; font-weight: 800; margin: 0; }
          .sub { font-size: 12px; color: #FEF3C7; margin-top: 4px; }
          .body { padding: 30px 24px; text-align: center; }
          .otp-box { background: #FFF7ED; border: 2px dashed #F97316; border-radius: 14px; padding: 18px; margin: 20px 0; display: inline-block; width: 80%; }
          .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #C2410C; margin: 0; }
          .note { font-size: 13px; color: #6B7280; line-height: 1.6; }
          .footer { background: #F3F4F6; padding: 16px; text-align: center; font-size: 11px; color: #9CA3AF; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 12px; letter-spacing: 2px; margin-bottom: 4px;">॥ श्री गणेश प्रसन्न ॥</div>
            <h1 class="title">New Yuwa Boys Mandal Book</h1>
            <div class="sub">न्यू युवा गणेश मंडळ, केऱ्हाळे बु.</div>
          </div>
          <div class="body">
            <p style="font-size: 15px; color: #1F2937; margin: 0; font-weight: 600;">
              सप्रेम नमस्कार! 🙏
            </p>
            <p class="note" style="margin-top: 8px;">
              आपल्या डिजिटल बहीखात्यामध्ये लॉगिन करण्यासाठी आपला ६-अंकी वन-टाईम पासवर्ड (OTP) खालीलप्रमाणे आहे:
            </p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="note">
              हा OTP पुढील <b>१० मिनिटांसाठी</b> वैध राहील.<br>
              सुरक्षेच्या कारणास्तव हा कोड कोणाशीही शेअर करू नका.
            </p>
          </div>
          <div class="footer">
            © २०२६ न्यू युवा गणेश मंडळ, केऱ्हाळे बुद्रुक • सर्व हक्क राखीव.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}
