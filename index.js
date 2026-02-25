const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend")));

// Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://clearandconnect-7f1f2.firebaseio.com",
  storageBucket: "clearandconnect-7f1f2.appspot.com"
});

const db = admin.firestore();

// ✅ Save Profile
app.post("/save-profile", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const docRef = await db.collection("users").add({
      name,
      email,
      phone,
      greenPoints: 0,
      history: [],
      createdAt: new Date()
    });
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Add Recycling Entry (Calculator)
app.post("/add-calculation", async (req, res) => {
  try {
    const { userId, plastic, paper, metal, glass, ewaste } = req.body;

    const points = (plastic * 10) + (paper * 10) +
                   (Math.floor(metal / 5) * 10) +
                   (Math.floor(glass / 5) * 10) +
                   (Math.floor(ewaste / 10) * 10);

    const entry = {
      material: "Mixed",
      kg: { plastic, paper, metal, glass, ewaste },
      points,
      date: new Date()
    };

    const userRef = db.collection("users").doc(userId);
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) throw new Error("User not found");

      const current = doc.data();
      const newPoints = (current.greenPoints || 0) + points;
      const newHistory = [...(current.history || []), entry];

      t.update(userRef, { greenPoints: newPoints, history: newHistory });
    });

    res.json({ success: true, entry, points });
  } catch (err) {
    console.error("Error adding calculation:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get Profile
app.get("/get-profile/:id", async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, profile: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
