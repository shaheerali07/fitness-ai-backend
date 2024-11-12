exports.video_load = async (req, res) => {
  const path = require("path");
  const data = req.query;

  // Decode URL-encoded parameters
  const category = decodeURIComponent(data.category);
  const exercise = decodeURIComponent(data.exercise);
  const index = decodeURIComponent(data.index);
  const subcategory = data.subcategory
    ? decodeURIComponent(data.subcategory)
    : "";

  let videoPath;

  if (subcategory) {
    videoPath = path.join(
      __dirname,
      `../sample_video/${index}/${category}/${subcategory}`,
      `${exercise}.mp4`
    );
  } else {
    videoPath = path.join(
      __dirname,
      `../sample_video/${index}/${category}`,
      `${exercise}.mp4`
    );
  }

  res.sendFile(videoPath, (err) => {
    if (err) {
      console.log("Error sending file:", err);
      res.status(500).send("Internal Server Error");
    }
  });
};
