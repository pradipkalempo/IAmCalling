import express from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get("/photos/all", async (req, res) => {
  try {
    const ideologies = ["fascist", "communist", "leftist", "rightist", "neutral"];
    const results = {};

    for (const ideology of ideologies) {
      const folderPath = `ideology_photos/${ideology}`;
      const response = await cloudinary.search
        .expression(`folder:${folderPath}`)
        .max_results(20)
        .execute();

      results[ideology] = response.resources.map(r => ({
        id: r.public_id,
        name: r.public_id.split('/').pop(),
        src: r.secure_url,
        ideology: ideology
      }));
    }

    res.json(results);
  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

export default router;