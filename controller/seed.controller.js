// api/runSeed.js

const { exec } = require("child_process");

exports.runSeed = (req, res) => {
  if (req.method === "POST") {
    exec("node scripts/seedDietMenu.js", (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: `Error: ${error.message}` });
      }
      if (stderr) {
        return res.status(500).json({ error: `stderr: ${stderr}` });
      }
      res.status(200).json({ message: "Seed successful", output: stdout });
    });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
