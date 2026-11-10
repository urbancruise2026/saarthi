import { generateOnboardingToken } from "../../utils/jwt.js";

export const generateEmployeeFormLink = async (req, res) => {
  try {
    const token = generateOnboardingToken();

    const link = `${process.env.FRONTEND_LINK_URL}/onboarding-form?token=${token}`;

    res.json({
      success: true,
      link,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate link",
    });
  }
};
