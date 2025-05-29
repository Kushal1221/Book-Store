import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Books.js";
import protectedRoute from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectedRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "All field required" });
    }

    const uploaded = await cloudinary.uploader.upload(image);
    const imageUrl = uploaded.secure_url;

    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id,
    });

    await newBook.save();
    res.status(201).json({ message: "book saved" });
  } catch (error) {
    console.log("Erorr creating book", error);
    res.status(500).json({ message: "Erorr creating book" });
  }
});

router.get("/", protectedRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in getting books", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user", protectedRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).send(books);
  } catch (error) {
    console.log("Error in getting books", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:id", protectedRoute, async (req, res) => {
  try {
    const book = await Book.findOne(req.params.id);
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("error in deleting image in cloudinary", error);
      }
    }

    await book.deleteOne();
    return res.status(201).json({ message: "Book deleted" });
  } catch (error) {
    console.log("Error in deleting book");
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
