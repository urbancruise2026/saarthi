import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.LINK_JWT_SECRET;

export const generateOnboardingToken = () => {
  return jwt.sign(
    {
      type: "employee_onboarding",
    },
    JWT_SECRET,
    { expiresIn: "2h" }, // 2 ghante me expire
  );
};
