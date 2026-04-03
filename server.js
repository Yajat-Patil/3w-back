const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DB CONNECTION ================= */

mongoose.connect("mongodb+srv://userw:userw@cluster0.5ja3aht.mongodb.net/social_app?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log(err));

/* ================= MODELS ================= */

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const postSchema = new mongoose.Schema({
  userId: String,
  username: String,
  text: String,
  image: String,
  likes: [String],
  comments: [
    {
      userId: String,
      text: String
    }
  ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

/* ================= AUTH ================= */

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({ username, email, password });
    await user.save();

    res.send("User registered ✅");
  } catch (err) {
    res.status(500).send("Signup error");
  }
});
//get users api
app.get("/users", async (req, res) => {
    const users = await User.find();
    res.send(users);
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).send("Invalid credentials ❌");
    }

    res.json({
      message: "Login successful ✅",
      user
    });

  } catch (err) {
    res.status(500).send("Login error");
  }
});

/* ================= POSTS ================= */

// CREATE POST
app.post("/posts", async (req, res) => {
  try {
    const { userId, username, text, image } = req.body;

    const post = new Post({
      userId,
      username,
      text,
      image,
      likes: [],
      comments: []
    });

    await post.save();

    res.send("Post created ✅");
  } catch (err) {
    res.status(500).send("Error creating post");
  }
});

// GET ALL POSTS (FEED)
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// LIKE POST
app.post("/posts/:id/like", async (req, res) => {
  const { userId } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
  }

  await post.save();

  res.send("Post liked ❤️");
});

// COMMENT POST
app.post("/posts/:id/comment", async (req, res) => {
  const { userId, text } = req.body;

  const post = await Post.findById(req.params.id);

  post.comments.push({ userId, text });

  await post.save();

  res.send("Comment added 💬");
});

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

/* ================= SERVER ================= */

app.listen(5001, () => {
  console.log("Server running on port 5001");
});