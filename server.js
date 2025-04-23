// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const moment = require("moment");
const methodOverride = require("method-override");
const Customer = require("./models/customerSchema");
const path = require("path");

// Load environment variables from .env file (e.g., MongoDB URI)
dotenv.config();

// Initialize the Express application
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static("public"));

// Set EJS as the templating engine and set views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parse incoming request bodies (URL-encoded and JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow method override for PUT and DELETE from forms
app.use(methodOverride("_method"));

// Retrieve MongoDB connection string from environment variables
const url = process.env.MONGO_URI;

// Connect to MongoDB Atlas using Mongoose
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");

    // Start the server only after successful database connection
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes

// Home route - display all customers
app.get("/", (req, res) => {
  Customer.find()
    .then((result) => {
      res.render("index", { array: result, moment });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Route to display add user form
app.get("/user/add.html", (req, res) => {
  res.render("user/add");
});

// Route to display edit form for a specific user
app.get("/edit/:id", (req, res) => {
  Customer.findById(req.params.id)
    .then((result) => {
      res.render("user/edit", { obj: result, moment });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Route to display user details
app.get("/view/:id", (req, res) => {
  Customer.findById(req.params.id)
    .then((result) => {
      res.render("user/view", { obj: result, moment });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Route to handle user creation
app.post("/user/add.html", async (req, res) => {
  try {
    await Customer.create(req.body);
    res.redirect("/");
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).send("Internal Server Error");
  }
});

//  Fixed route: Route to handle search request and display results
app.post("/search", async (req, res) => {
  try {
    const result = await Customer.find({ firstName: req.body.name });
    res.render("user/search", { array:result, moment }); 
  } catch (err) {
    console.error("Error searching customers:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update customer data
app.put("/edit/:id", async (req, res) => {
  try {
    const result = await Customer.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send("Customer not found or no changes made.");
    }

    res.redirect("/");
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete customer
app.delete("/delete/:id", async (req, res) => {
  try {
    const result = await Customer.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).send("Customer not found.");
    }

    res.redirect("/");
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).send("Internal Server Error");
  }
});
