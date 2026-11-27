import { useState } from "react";
import type { Assistance, Understood } from "../types";

type FormState = {
  understood: Understood | "";
  learned: string;
  suggestions: string;
  assistance: Assistance | "";
  assistanceDetails: string;
};

export type ReviewFormValues = {
  understood: Understood;
  learned: string;
  suggestions: string;
  assistance: Assistance;
  assistanceDetails: string;
};

export function useReviewForm(
  initial: Partial<FormState> | undefined,
  onSubmit: (values: ReviewFormValues) => Promise<void>,
) {
  const [form, setForm] = useState<FormState>({
    understood: initial?.understood ?? "",
    learned: initial?.learned ?? "",
    suggestions: initial?.suggestions ?? "",
    assistance: initial?.assistance ?? "",
    assistanceDetails: initial?.assistanceDetails ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError("");
  };

  const submit = async () => {
    if (!form.understood)
      return setError("Pehle batayein ki module samajh aaya ya nahi.");
    if (!form.learned.trim())
      return setError(
        "Is training se aapne kya seekha, ye likhna zaroori hai.",
      );
    if (!form.assistance)
      return setError("Assistance chahiye ya nahi, ye select karein.");
    if (form.assistance === "yes" && !form.assistanceDetails.trim())
      return setError("Kis topic me assistance chahiye, ye likhein.");

    setSaving(true);
    try {
      await onSubmit({
        understood: form.understood,
        learned: form.learned.trim(),
        suggestions: form.suggestions.trim(),
        assistance: form.assistance,
        assistanceDetails:
          form.assistance === "yes" ? form.assistanceDetails.trim() : "",
      });
    } catch (err) {
      setError(typeof err === "string" ? err : "Review save nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  return { form, update, error, saving, submit };
}
