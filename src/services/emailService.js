const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderConfirmation = async (userEmail, order) => {
  const mailOptions = {
    from: '"LED Screen Rental" <noreply@ledrental.com>',
    to: userEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <h2>Order Details:</h2>
      <ul>
        <li>Order Number: ${order.orderNumber}</li>
        <li>LED Type: ${order.ledType}</li>
        <li>Square Meters: ${order.squareMeters}</li>
        <li>Total Price: ${order.totalPrice} ETB</li>
        <li>Event Date: ${new Date(order.programDate).toLocaleDateString()}</li>
        <li>Location: ${order.location.venue}, ${order.location.city}</li>
      </ul>
      <p>We will contact you shortly to confirm the details.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderStatusUpdate = async (userEmail, order) => {
  const mailOptions = {
    from: '"LED Screen Rental" <noreply@ledrental.com>',
    to: userEmail,
    subject: `Order Status Update - ${order.orderNumber}`,
    html: `
      <h1>Order Status Update</h1>
      <p>Your order status has been updated to: <strong>${order.status}</strong></p>
      <p>Order Number: ${order.orderNumber}</p>
      <p>Check your dashboard for more details.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendTaskAssignment = async (staffEmail, task) => {
  const mailOptions = {
    from: '"LED Screen Rental" <noreply@ledrental.com>',
    to: staffEmail,
    subject: `New Task Assignment - ${task.taskNumber}`,
    html: `
      <h1>New Task Assigned</h1>
      <p>You have been assigned a new task:</p>
      <h2>Task Details:</h2>
      <ul>
        <li>Task Number: ${task.taskNumber}</li>
        <li>Title: ${task.title}</li>
        <li>Type: ${task.taskType}</li>
        <li>Priority: ${task.priority}</li>
        <li>Start Date: ${new Date(task.schedule.startDate).toLocaleDateString()}</li>
        <li>Location: ${task.location.venue}, ${task.location.city}</li>
      </ul>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendTaskAssignment
};