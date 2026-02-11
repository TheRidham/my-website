"use client";

import React from 'react';

interface FollowUpChipsProps {
  questions: string[];
  onQuestionTap: (question: string) => void;
  disabled?: boolean;
}

const FollowUpChips: React.FC<FollowUpChipsProps> = ({ questions, onQuestionTap, disabled }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => !disabled && onQuestionTap(question)}
          disabled={disabled}
          className={`
            flex items-center gap-3 text-left
            bg-blue-50 border-l-4 border-blue-300
            rounded-lg px-4 py-3
            transition-all duration-200
            hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="text-blue-500 font-semibold">→</span>
          <span className="text-gray-800 font-medium text-[14px] leading-5">
            {question}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FollowUpChips;
