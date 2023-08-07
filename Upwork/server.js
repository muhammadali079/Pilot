import express from "express";
import bodyParser from "body-parser";
import mongodb from "mongodb";
import cors from "cors";

const app = express();
const port = 3003;
const mongoURI = "mongodb://127.0.0.1:27017/Upwork";

const client = new mongodb.MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(cors());

client.connect().then(() => {
  const db = client.db();
  const usersCollection = db.collection("Users");

  app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Received signup request:", { username, email, password });
    try {
      const user = await usersCollection.insertOne({ username, email, password });
      console.log("User object:", user);
      res.status(200).json({ message: "Signup successful" });
    } catch (err) {
      console.error("Error storing data:", err);
      res.status(500).json({ message: "Error signing up", error: err.message });
    }
  });

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email, password });

    if (user) {
      res.status(200).json({ message: "Login successful" });
    }
    else if (!user) {
      res.status(200).json({ message: "Invalid credentials" });
    }  
    else {
      res.status(401).json({ message: "Login not successful" });
    }
  });

    
  app.post("/profile-data", async (req, res) => {
    const {  email, profiledata } = req.body;

    try {
      const user = await usersCollection.findOne({  email });

      if (user) {
       
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: { profiledata } }
        );

        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Data stored Successfully" });
        } else {
          res.status(401).json({ message: "Data stored Unsuccessfully" });
        }
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Error storing profile data:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.post("/job-data", async (req, res) => {
    const {  email, jobData } = req.body;

    try {
      const user = await usersCollection.findOne({  email });

      if (user) {
       
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: { jobData } }
        );

        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Job Data stored Successfully" });
        } else {
          res.status(401).json({ message: "Job Data stored Unsuccessfully" });
        }
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Error storing Job data:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.post("/google-login", async (req, res) => {
    const { username, email } = req.body;
    const user = await usersCollection.insertOne({ username, email });

    if (user) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });


  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
