import {
  getQuestions,
  replaceQuestions,
  createMapAnswers,
  getMapAnswers,
  getAllMapAnswers,
} from "./trainingGoogleMap.Model.js";

const ALLOWED_MODULES = ["google_map_1", "google_map_2"];

// TEMP: auth lagne tak. Auth lagne ke baad isse hata dena
const getEmployeeId = (req) => req.user?.id ?? 1;

/* ---------- QUESTIONS ---------- */
export const fetchQuestions = async (req, res) => {
  try {
    const { department, subDepartment, moduleKey } = req.query;

    if (!department || !subDepartment || !moduleKey) {
      return res
        .status(400)
        .json({ success: false, message: "Missing params." });
    }

    const data = await getQuestions({ department, subDepartment, moduleKey });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("fetchQuestions error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveQuestions = async (req, res) => {
  try {
    const { department, subDepartment, moduleKey, questions } = req.body;

    const cleaned = (Array.isArray(questions) ? questions : [])
      .map((q) => (typeof q === "string" ? q.trim() : ""))
      .filter(Boolean);

    if (!department || !subDepartment || !moduleKey) {
      return res.status(400).json({
        success: false,
        message: "Department, Sub Department aur Module zaruri hai.",
      });
    }

    if (!cleaned.length) {
      return res
        .status(400)
        .json({ success: false, message: "Kam se kam 1 question likhein." });
    }

    const data = await replaceQuestions({
      department,
      subDepartment,
      moduleKey,
      questions: cleaned,
    });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("saveQuestions error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- ANSWERS ---------- */
export const submitMapAnswers = async (req, res) => {
  try {
    const { department, subDepartment, moduleKey, answers } = req.body;
    const employeeId = getEmployeeId(req);

    if (!department || !subDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department aur Sub Department zaruri hai.",
      });
    }

    if (!ALLOWED_MODULES.includes(moduleKey)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid module." });
    }

    const cleaned = (Array.isArray(answers) ? answers : [])
      .filter(
        (a) =>
          typeof a?.question === "string" &&
          a.question.trim() !== "" &&
          typeof a?.answer === "string" &&
          a.answer.trim() !== "",
      )
      .map((a) => ({
        questionId: a.questionId || null,
        question: a.question.trim(),
        answer: a.answer.trim(),
      }));

    if (!cleaned.length) {
      return res
        .status(400)
        .json({ success: false, message: "Kam se kam 1 answer likhein." });
    }

    const data = await createMapAnswers({
      employeeId,
      department,
      subDepartment,
      moduleKey,
      answers: cleaned,
    });

    return res.status(201).json({ success: true, ...data });
  } catch (err) {
    console.error("submitMapAnswers error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const fetchMyMapAnswers = async (req, res) => {
  try {
    const { department, subDepartment, moduleKey } = req.query;

    if (!department || !subDepartment || !moduleKey) {
      return res
        .status(400)
        .json({ success: false, message: "Missing params." });
    }

    const data = await getMapAnswers({
      employeeId: getEmployeeId(req),
      department,
      subDepartment,
      moduleKey,
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("fetchMyMapAnswers error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const fetchAllMapAnswers = async (req, res) => {
  try {
    const { department, subDepartment, moduleKey } = req.query;

    if (!department || !subDepartment || !moduleKey) {
      return res
        .status(400)
        .json({ success: false, message: "Missing params." });
    }

    const data = await getAllMapAnswers({
      department,
      subDepartment,
      moduleKey,
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("fetchAllMapAnswers error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
