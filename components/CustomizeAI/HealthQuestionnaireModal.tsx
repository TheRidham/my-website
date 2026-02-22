"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface HealthFormData {
  bmi: string;
  healthStatus: string;
  chronicCondition: string;
  medications: string;
  allergies: string;
  surgeries: string;
  heartDisease: string;
  diabetes: string;
  bloodPressure: string;
  smoking: string;
  alcohol: string;
  exercise: string;
  symptoms: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  answer: string;
}

interface HealthQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthQuestionnaireModal({
  isOpen,
  onClose,
}: HealthQuestionnaireModalProps) {
  const [formData, setFormData] = useState<HealthFormData>({
    bmi: "",
    healthStatus: "",
    chronicCondition: "",
    medications: "",
    allergies: "",
    surgeries: "",
    heartDisease: "",
    diabetes: "",
    bloodPressure: "",
    smoking: "",
    alcohol: "",
    exercise: "",
    symptoms: "",
  });

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  if (!isOpen) return null;

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomQuestionChange = (
    id: string,
    field: "question" | "answer",
    value: string
  ) => {
    setCustomQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const addCustomQuestion = () => {
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ]);
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions((prev) =>
      prev.filter((q) => q.id !== id)
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      customQuestions,
    };

    console.log("Health Questionnaire Data:", finalData);

    onClose();
  };

  const yesNoQuestions: { label: string; name: keyof HealthFormData }[] = [
    { label: "Do you have any chronic medical condition?", name: "chronicCondition" },
    { label: "Are you currently taking any medications?", name: "medications" },
    { label: "Do you have any allergies?", name: "allergies" },
    { label: "Have you had any surgeries?", name: "surgeries" },
    { label: "History of heart disease?", name: "heartDisease" },
    { label: "Do you have diabetes?", name: "diabetes" },
    { label: "Do you have high blood pressure?", name: "bloodPressure" },
    { label: "Do you smoke?", name: "smoking" },
    { label: "Do you consume alcohol?", name: "alcohol" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card text-card-foreground shadow-xl border border-border">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            Health Questionnaire
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Standard Questions */}

          <div>
            <label className="block text-sm font-medium mb-2">
              How would you describe your current health?
            </label>
            <select
              name="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              What is your BMI (Body Mass Index) ?
            </label>
            <input
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {yesNoQuestions.map((q) => (
            <div key={q.name}>
              <label className="block text-sm font-medium mb-2">
                {q.label}
              </label>
              <select
                name={q.name}
                value={formData[q.name]}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-2">
              How often do you exercise?
            </label>
            <select
              name="exercise"
              value={formData.exercise}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select</option>
              <option value="Never">Never</option>
              <option value="1-2 times/week">1-2 times/week</option>
              <option value="3-5 times/week">3-5 times/week</option>
              <option value="Daily">Daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Are you experiencing any symptoms currently?
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Custom Questions Section */}

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold">
                Custom Questions
              </h3>
              <button
                type="button"
                onClick={addCustomQuestion}
                className="px-3 py-1 text-sm rounded-md bg-accent text-accent-foreground hover:opacity-90"
              >
                + Add Question
              </button>
            </div>

            {customQuestions.map((q, index) => (
              <div
                key={q.id}
                className="p-4 rounded-lg border border-border bg-muted space-y-3"
              >
                <input
                  type="text"
                  placeholder="Enter your question"
                  value={q.question}
                  onChange={(e) =>
                    handleCustomQuestionChange(
                      q.id,
                      "question",
                      e.target.value
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />

                <textarea
                  placeholder="Answer"
                  value={q.answer}
                  onChange={(e) =>
                    handleCustomQuestionChange(
                      q.id,
                      "answer",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />

                <button
                  type="button"
                  onClick={() => removeCustomQuestion(q.id)}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}