const {
  test,
  register,
  login,
  getMentor,
  getMentorId,
  checkout,
  getData,
  bookSession,
  paymentStatus,
  getPaymentStatus
} = require("../controllers/controller");
const express = require("express");
const routes = express.Router();

routes.get("/test", test);
routes.post("/register", register);
routes.post("/login", login);
routes.get("/get-data", getData);
routes.get("/get-mentor", getMentor);
routes.get("/get-mentor/:id", getMentorId);
routes.post("/checkout", checkout);
routes.post("/bookSession/:id", bookSession);
routes.post("/payment-status/:id", paymentStatus);
routes.get("/get-payment-status/:id/:studentId", getPaymentStatus);

module.exports = routes;
