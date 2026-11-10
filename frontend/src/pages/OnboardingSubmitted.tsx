import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function OnboardingSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <CheckCircle size={60} className="text-green-600 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-green-700">
          Form Submitted Successfully
        </h1>

        <p className="text-gray-600 mt-3">
          Thank you for submitting your onboarding details. Our HR team will
          review your information shortly.
        </p>

        <Button className="mt-6" onClick={() => navigate("/")}>
          Close
        </Button>
      </div>
    </div>
  );
}
