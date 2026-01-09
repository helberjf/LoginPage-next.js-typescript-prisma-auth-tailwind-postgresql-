import formData from "form-data";
import Mailgun from "mailgun.js";

const mg = new Mailgun(formData);

export const mailgun = mg.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!, // sua API KEY
  url: "https://api.mailgun.net",
});
