const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true, // Allow cookies to be sent with requests
	}),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
