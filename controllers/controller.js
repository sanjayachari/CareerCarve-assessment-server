const exportSchema = require("../db/schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
  console.log("Test working..");
  return res.json("Test working..");
};

const getData = (req, res) => {
  //   console.log("Test working..", req.cookies);
  const { token } = req.cookies;
  const user = jwt.verify(token, "san", (err, data) => {
    if (data) {
      return res.json(data);
    } else {
      return res.status(402).json(err);
    }
  });
};
const getMentor = async (req, res) => {
  //   console.log("Test working..", req.cookies);
  const { token } = req.cookies;
  const user = jwt.verify(token, "san", async (err, data) => {
    if (data) {
      const getMentors = await exportSchema.find({ userType: "mentor" });
      //   console.log(getMentors);
      return res.json(getMentors);
    } else {
      return res.status(402).json(err);
    }
  });
};

const getMentorId = async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  try {
    const user = jwt.verify(token, "san", async (err, data) => {
      if (data) {
        const response = await exportSchema.findById({ _id: id });

        console.log("response", id, response);
        return res.status(200).json({ response, data });
      } else {
        return res.status(402).json(err);
      }
    });
  } catch (error) {
    res.status(403).json(error);
  }
};

const login = async (req, res) => {
  console.log("rendered!");
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await exportSchema.findOne({ email });
    if (!user) {
      return res.json({ message: "User not exist" });
    }
    console.log("user::", user);
    const hashedPassword = await bcrypt.compare(password, user.password);
    console.log("hashedPassword", hashedPassword);
    if (hashedPassword) {
      const jwtSign = jwt.sign({ user }, "san");
      res.cookie("token", jwtSign, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 3600000, // Expiration time in milliseconds

      });
      res.json(user);
    } else {
      return res.status(403).json({ message: "Wrong credentials" });
    }
  } catch (error) {
    return res.status(403).json({ message: "somthing went wrong" });
  }
};

const salt = 10;
const register = async (req, res) => {
  try {
    const { fullName, email, expertise, password, userType } = req.body;

    const isExist = await exportSchema.findOne({ email });
    if (isExist) {
      return res.status(405).json({ message: "email already registered!" });
    }
    const hashedPassword = await bcrypt.hash(password, salt);
    const registerUser = await exportSchema.create({
      fullName,
      email,
      expertise,
      password: hashedPassword,
      userType,
    });
    console.log(registerUser);
    return res.status(200).json(registerUser);
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
};

const stripe = require("stripe")(
  "sk_test_51PiwzFDao70MZ3nrEdoit4vLz6UmkRlPCyO2LLGK4KzKzE1HZgkDi5T54qrLy96PAlwpzUgaCRnrTFUn7I4ep3KP00CRrNyCVR"
);
const YOUR_DOMAIN = "https://careercarve-assessment-client.onrender.com";

const checkout = async (req, res) => {
  const { amount, id, studentId } = req.body; // Assuming amount is sent in INR

  try {
    // Convert amount to paise if it's not already in paise
    const amountInPaise = 34 * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "CareerCarve",
            },
            // unit_amount: amountInPaise, // Now in paise
            unit_amount: amount * 100, // Now in paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success/${id}/${studentId}`,
      cancel_url: `${YOUR_DOMAIN}/cancelled`,
    });

    res.status(200).json({ url: session.url }); // Redirect to the Stripe-hosted payment page
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bookSession = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  console.log("payload", payload, id);
  try {
    const data = await exportSchema.findByIdAndUpdate(
      { _id: id },
      { $push: { events: payload } },
      { new: true }
    );
    console.log(data);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(403).json(error);
  }
};

const paymentStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const getProfile = await exportSchema.findOne({ _id: id });
    // getProfile.events(())
    res.json(getProfile);
  } catch (error) {
    console.log(error);
    return res.status(403).json(error);
  }
};

const getPaymentStatus = async (req, res) => {
  const { id, studentId } = req.params;

  try {
    // Find the document by its ID
    const updatePayment = await exportSchema.findById(id);

    if (!updatePayment) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Find the specific event in the events array
    const event = updatePayment.events.find((e) => e.studentId == studentId);

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found for the specified student" });
    }

    // Update the isPayment field to true
    event.isPayment = true;

    // Mark the 'events' array as modified
    updatePayment.markModified("events");

    // Save the updated document
    await updatePayment.save();

    // Respond with the updated document
    res.json({ event, updatePayment });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: "An error occurred", error });
  }
};

module.exports = {
  test,
  getData,
  getMentorId,
  getMentor,
  checkout,
  login,
  register,
  bookSession,
  paymentStatus,
  getPaymentStatus,
};
