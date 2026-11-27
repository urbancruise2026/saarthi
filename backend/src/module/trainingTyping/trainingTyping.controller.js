import TypingModel from "./trainingTyping.Model.js";

export const addTypingScores = async (req, res) => {
  try {
    const { subDepartment, trainingDay, entries } = req.body;

    if (!["presales", "telesales"].includes(subDepartment)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subDepartment" });
    }
    if (!trainingDay) {
      return res
        .status(400)
        .json({ success: false, message: "trainingDay required" });
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Kam se kam ek entry chahiye" });
    }

    for (const e of entries) {
      if (
        !e.date ||
        !e.day ||
        !e.time ||
        e.score === "" ||
        isNaN(Number(e.score))
      ) {
        return res.status(400).json({
          success: false,
          message: "Har row me date, day, time aur score zaroori hai",
        });
      }
    }

    await TypingModel.createMany(
      subDepartment,
      Number(trainingDay),
      entries.map((e) => ({ ...e, score: Number(e.score) })),
    );

    return res.status(201).json({
      success: true,
      message: "Typing scores saved",
      data: { count: entries.length }, // 👈 ab frontend ko count milega
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTypingScores = async (req, res) => {
  try {
    const { subDepartment, trainingDay } = req.query;

    if (!["presales", "telesales"].includes(subDepartment)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subDepartment" });
    }

    const data = await TypingModel.getByDay(subDepartment, Number(trainingDay));
    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTypingScore = async (req, res) => {
  try {
    await TypingModel.deleteById(Number(req.params.id));
    return res.json({ success: true, data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
