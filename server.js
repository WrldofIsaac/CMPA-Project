const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "trackwave_secret";
const users = [];

app.post("/register",(req,res)=>{
  const {username,password} = req.body;
  users.push({username,password});
  res.json({message:"Registered"});
});

app.post("/login",(req,res)=>{
  const {username,password} = req.body;
  const user = users.find(u=>u.username===username && u.password===password);
  if(!user) return res.status(401).json({message:"Invalid"});
  const token = jwt.sign({username},SECRET);
  res.json({token});
});

app.listen(3000,()=>console.log("Server running"));

app.post("/login", (req, res) => {
  try {
    console.log("LOGIN REQUEST:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });

    res.json({ token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});