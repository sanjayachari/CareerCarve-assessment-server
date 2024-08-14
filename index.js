
// mongodb+srv://argonquber:ocd8NtJyEki6AMTi@cluster0.mwmor.mongodb.net/database
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const { urlencoded } = require("express");

app.use(express.json());

app.use(cors({
    // origin:"http://localhost:5173",
    origin:"https://careercarve-assessment-server.onrender.com",
    // origin:"http://localhost:5173",
    credentials:true,
}))

app.use(cookieParser());
app.use(urlencoded({ extended: true }));

require("./db/db");
app.use("/server/v1", require("./routes/route"));

// app.use(urlencoded({ extended: true }));
app.listen(5000, () => {
  console.log("server running at 5000");
});
