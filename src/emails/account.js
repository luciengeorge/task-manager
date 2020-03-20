const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'luciengeorge95@gmail.com',
    subject: `Welcome ${name}`,
    text: `Welcome to the app, ${name}. Let us know how we can help` // can use html option as well instead of text
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'luciengeorge95@gmail.com',
    subject: `Sorry to see you go ${name}`,
    text: `Is there anything you want to say before you leave?` // can use html option as well instead of text
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
