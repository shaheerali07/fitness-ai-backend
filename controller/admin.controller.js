require("dotenv").config();
const nodemailer = require("nodemailer");
const { exec } = require("child_process");
const jwt = require("jsonwebtoken");
exports.test = (req, res) => {
  res.send("Welcome to fitness 1.3");
};

exports.signup = async (req, res) => {
  const user = require("../model/users");
  const parseExcelData = require("../utils/excelParser");
  const jsonData = parseExcelData();
  const newData = req.body;
  const { username, password, email, height, weight } = newData;
  // Check if the username or email is already in use
  const existingUser = await user.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return res.status(400).json({
      message:
        existingUser.email === email
          ? "Email is already in use"
          : "Username is already in use",
    });
  }
  user.findOne({ email }).then((response) => {
    if (response) {
      res.send({
        message: "User is already existed",
      });
    } else {
      const newUser = new user(newData);
      newUser
        .save()
        .then(async (savedUser) => {
          // Generate JWT token without expiry
          const token = jwt.sign(
            {
              id: savedUser._id,
              email: savedUser.email,
            },
            process.env.JWT_SECRET // Secret key from environment variables
          );

          // for (const row of jsonData) {
          //   // Accessing columns with exact key names (based on inspection of console logs)
          //   const foodName = row["__EMPTY_1"] || "";
          //   const kcal = row["Energi (kcal)"] || null;
          //   const protein = row["Protein"] || null;
          //   const water = row["Vand"] || null;
          //   const mineral = row["Mineral"] || 0;

          //   // Check if all values are non-null and have valid data
          //   if (
          //     foodName &&
          //     kcal !== null &&
          //     protein !== null &&
          //     water !== null &&
          //     mineral !== null
          //   ) {
          //     // Create and save only if all fields have valid values
          //     const newDietItem = new dietMenu({
          //       foodName,
          //       kcal,
          //       protein,
          //       water,
          //       mineral,
          //     });
          //     await newDietItem.save();
          //   } else {
          //     // Log rows that are incomplete
          //     console.log("Incomplete Data Skipped:", {
          //       foodName,
          //       kcal,
          //       protein,
          //       water,
          //       mineral,
          //     });
          //   }
          // }
          res.send({
            message: "success",
            token,
          });
        })
        .catch((err) => {
          console.log("err: ", err);
        });
    }
  });
};
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const user = require("../model/users");

  user
    .findOne({ email })
    .then((response) => {
      if (response) {
        response.password = newPassword;
        response
          .save()
          .then(() => {
            res.send({
              message: "Password updated successfully",
            });
          })
          .catch((err) => {
            console.log("err: ", err);
            res.status(500).send({
              message: "Error updating password",
            });
          });
      } else {
        res.status(404).send({
          message: "Email not found",
        });
      }
    })
    .catch((err) => {
      console.log("err: ", err);
      res.status(500).send({
        message: "Error finding user",
      });
    });
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = require("../model/users");
  // Create the nodemailer transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  try {
    // Find user by email
    const userRecord = await user.findOne({ email });
    if (!userRecord) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?email=${email}`;

    // Send email with reset link
    await transporter.sendMail({
      from: "smtp@innovation-insight.com",
      to: email, // recipient
      subject: "Password Reset Request", // Subject line
      html: `<p>Please click the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`, // html body
    });

    // Send success response
    res.send({
      message: "Please check your email for the password reset link.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).send({
      message: "Error processing request",
      error: error.message,
    });
  }
};
exports.signupUpdate = async (req, res) => {
  const user = require("../model/users");
  const updateData = req.body.updateData;
  const { email } = req.body.updateData;
  user
    .findOneAndUpdate(
      {
        email: email,
      },
      updateData,
      { new: true }
    )
    .then((response) => {
      if (response) {
        res.send({
          message: "success",
        });
      } else {
        res.send({
          message: "Email or password is not correct.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.signin = async (req, res) => {
  const users = require("../model/users");
  const newData = req.query;
  const { email, password } = newData;
  users
    .findOne({ email, password })
    .then((result) => {
      if (result) {
        // Generate JWT token without expiry
        const token = jwt.sign(
          {
            id: result._id,
            email: result.email,
          },
          process.env.JWT_SECRET // Secret key from environment variables
        );
        res.json({
          name: result.username,
          profilePic: result.profilePicture,
          token,
          message: "success",
        });
      } else {
        res.json({
          name: "",
          message: "failed",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getUserByEmail = async (req, res) => {
  const user = require("../model/users");
  const { email } = req.query;
  user.findOne({ email }).then((response) => {
    if (response) {
      res.send({
        message: "success",
        data: response,
      });
    } else {
      res.send({
        message: "User not found",
      });
    }
  });
};

exports.changePassword = async (req, res) => {
  const user = require("../model/users"); // Import the user model
  const { email, currentPassword, newPassword } = req.body.updateData;

  try {
    // Check if user exists by email
    const foundUser = await user.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if current password matches the stored plain-text password
    if (foundUser.password !== currentPassword) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Update the user's password with the new one (plain-text)
    foundUser.password = newPassword;
    await foundUser.save();

    // Return success response
    return res.status(200).json({
      message: "success",
    });
  } catch (error) {
    // Catch and handle any errors
    return res.status(500).json({
      message: "An error occurred while changing the password",
      error: error.message,
    });
  }
};
