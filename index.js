const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const mongo = require("./db");
const User = require("./faculty_Schema");
const multer = require("multer");
const File = require("./file_db");
var cors = require('cors')

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Request-With,Content-Type,Accept"
  );
  next();
});

app.use(cors());
app.use(express.json());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
mongo();
app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/signup", async (req, res) => {
  try {
    // Create a new user instance using the data from the request body
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      designation: req.body.designation,
      department: req.body.department,
      email: req.body.email,
      password: req.body.password,
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with a success message
    res.status(201).json({ message: "User successfully registered" });
  } catch (error) {
    // Handle any errors during user registration
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email in the database
    const user = await User.findOne({ email });

    // If the user is not found, return an authentication failure
    if (!user) {
      return res.status(401).json({
        error: "Authentication failed. User not found.",
        success: false,
      });
    }

    // Check if the provided password matches the stored hashed password
    if (user.password !== password) {
      return res.status(401).json({
        error: "Authentication failed. Incorrect password.",
        success: false,
      });
    }

    // If both email and password are correct, respond with success
    res
      .status(200)
      .json({ message: "Authentication successful", success: true });
  } catch (error) {
    // Handle any errors during the authentication process
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/get_details", async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email in the database
    const user = await User.findOne({ email });

    // If the user is not found, return an authentication failure
    if (!user) {
      return res
        .status(401)
        .json({ error: " User not found.", success: false });
    }

    // If both email and password are correct, respond with success
    res.status(200).json({ data: user, success: true });
  } catch (error) {
    // Handle any errors during the authentication process
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/get_prof", async (req, res) => {
  try {
    const { dept } = req.body;

    // Find professors with the specified department
    const professors = await User.find({
      department: dept,
      designation: "HOD",
    });

    // If no professors are found, return an error
    if (!professors || professors.length === 0) {
      return res.status(404).json({
        error: "No professors found for the specified department",
        success: false,
      });
    }

    // For simplicity, let's assume you want to return the email of the first professor found
    const firstProfessor = professors[0];

    res
      .status(200)
      .json({ data: { email: firstProfessor.email }, success: true });
  } catch (error) {
    // Handle any errors during the process
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/send_file", upload.single("file"), async (req, res) => {
    try {
      const { email, approved ,firstname, emailby} = req.body;
  
      if (!req.file || !email) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
  
      // Save the file to the database
      const newFile = new File({
        firstname:firstname,
        email: email,
        emailby:emailby,
        filename: req.file.originalname,
        filedata: req.file.buffer,
        approved: approved || false, // Default to false if not provided
      });
  
      await newFile.save();
  
      res.status(200).json({ message: "File saved successfully" });
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.post("/get_pending_approvals", async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find professors with the specified department
      const data_approv = await File.find({
        email: email,
        approved: false,
      });
  
      // If no professors are found, return an error
      if (!data_approv || data_approv === 0) {
        return res.status(320).json({
          error: "No pending Approvals",
          success: true,
        });
      }
      
  
      res
        .status(200)
        .json({ data:data_approv  , success: true });
    } catch (error) {
      // Handle any errors during the process
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

  app.get('/get_pdf_data/:fileId', async (req, res) => {
    const { fileId } = req.params;
  
    try {
      // Find the document in MongoDB based on the fileId
      const file = await File.findOne({ _id: fileId });
  
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      // Set the response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', file.filedata.length);
  
      // Send the binary data as a response
      res.end(file.filedata);
    } catch (error) {
      console.error('Error fetching PDF file from MongoDB:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/approve", async (req, res) => {
    try {
      const {id} = req.body;
   console.log(id);
      if (!id) {
        return res.status(400).json({ error: "File ID is required" });
      }
  
      // Update only the 'approved' field to true
      await File.findByIdAndUpdate(id, { approved: true });
  
      res.status(200).json({ message: "File approved successfully" });
    } catch (error) {
      console.error("Error approving file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/status", async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
  
      // Check if there is a file associated with the provided email
      const file = await File.findOne({ email });
  
      if (!file) {
        return res.status(200).json({ message: "You didn't submit the form yet" });
      }
  
      // Check the approval status
      if (file.approved) {
        return res.status(200).json({ status: "Approved" });
      } else {
        return res.status(200).json({ status: "Processing" });
      }
    } catch (error) {
      console.error("Error checking status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


app.listen(port, () => {
  console.log("Running on server");
});
