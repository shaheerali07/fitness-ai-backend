const { SUPPORT_QUESTIONS } = require("../static/data");

exports.askSupport = async (req, res) => {
  const header = req.body.header;
  const updateData = req.body.updateData;
  const { email } = header;
  const feedback = require("../model/feedback");
  const users = require("../model/users");
  const resultUser = await users.findOne({ email: email });
  if (resultUser === null) {
    res.send({
      message: "user not found",
    });
    return;
  }
  const answer = SUPPORT_QUESTIONS.find(
    (question) => question.id === updateData.questionId
  );
  if (!answer) {
    res.send({
      message: "question not found",
    });
    return;
  }
  let chatHistory = await feedback.findOne({ userid: resultUser._id });
  if (!chatHistory) {
    chatHistory = new feedback({
      userid: resultUser._id,
      messages: [
        {
          sender: "user",
          message: answer.question,
          timestamp: new Date(),
        },
        {
          sender: "support",
          message: answer.answer,
          timestamp: new Date(),
        },
      ],
    });
  } else {
    chatHistory.messages.push({
      sender: "user",
      message: answer.question,
      timestamp: new Date(),
    });
    chatHistory.messages.push({
      sender: "support",
      message: answer.answer,
      timestamp: new Date(),
    });
  }
  await chatHistory.save().then(() => {
    res.send({
      message: answer.answer,
    });
  });
};

exports.getFeedback = async (req, res) => {
  const { email } = req.query;
  const feedback = require("../model/feedback");
  const users = require("../model/users");
  const resultUser = await users.findOne({ email: email });
  if (resultUser === null) {
    res.send({
      message: "user not found",
    });
    return;
  }
  const result = await feedback
    .find({ userid: resultUser._id })
    .sort({ createdAt: 1 })
    .exec();
  res.send({
    message: result,
  });
};
