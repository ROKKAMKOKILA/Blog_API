const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Blog = require('./blogSchema')

mongoose
  .connect("mongodb://localhost:27017/blog")
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/posts", async (req, res) => {
  try {
    const results = await Blog.find();
    res.status(200).send(results);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/posts", async (req, res) => {
  const values = req.body;
  try {
    const newBlog = Blog({
      title: values.title,
      content: values.content,
      imageUrl: values.imageUrl,
    });
    await newBlog.save();
    res
      .status(201)
      .send({ added: true, message: "Successfully added a new post" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params; // To get the Object ID from route
  try {
    const deletedPost = await Blog.findByIdAndDelete(id);
    if (!deletedPost) {
      res.status(404).send({ deleted: false, message: "Post Not Found." });
    }
    res
      .status(200)
      .send({ deleted: true, message: "Post Deleted Successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ deleted: false, message: "Internal Server Error." });
  }
});

app.patch("/posts/:id", async (req, res) => {
  const { id } = req.params; // To get Object ID from the route
  const data = req.body;
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedBlog) {
      return res.status(404).send({ message: "Blog post not found." });
    }
    res.send({ updated: true, blog: updatedBlog });
  } catch (err) {
    res.status(500).send({ message: "Error updating blog post.", err });
  }
});

const port = 3000;
app.listen(port, (err) => {
  if (!err) {
    console.log(`Server is running on 'http://localhost:${port}'`);
  } else {
    console.log(`Error occurred, server can't start`, err);
  }
});