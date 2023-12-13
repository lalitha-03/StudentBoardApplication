const nodemailer = require("nodemailer");

const fromEmail = "lalitha12032014@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: fromEmail,
    pass: "fsmvfpytdrnswbqc",
  },
});

const sendEmail = async (toEmail, subject, text) => {
  console.log(toEmail, "toEmail");
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.log("Error occurred while sending email:", error.message);
  }
};

module.exports = sendEmail;
