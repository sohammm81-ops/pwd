const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://soham:<db_password>@cluster0.abuxbhs.mongodb.net/?appName=Cluster0");

const PasswordSchema = new mongoose.Schema({
    password: String,
    score: Number,
    strength: String,
    feedback: [String],
    date: { type: Date, default: Date.now }
});

const Password = mongoose.model("Password", PasswordSchema);

function checkPassword(password) {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 20;
    else feedback.push("Use at least 8 characters");

    if (password.length >= 12) score += 20;

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Add uppercase letters");

    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Add lowercase letters");

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push("Include numbers");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else feedback.push("Use special characters");

    let strength = score <= 30 ? "Weak" : score <= 70 ? "Medium" : "Strong";

    return { score, strength, feedback };
}

app.post("/check", async (req, res) => {
    const { password } = req.body;
    const result = checkPassword(password);
    await Password.create({ password, ...result });
    res.json(result);
});

app.get("/history", async (req, res) => {
    const data = await Password.find().sort({ date: -1 });
    res.json(data);
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
