"use client";

import React, { useState } from 'react';

interface MCQOptionsProps {
  options: string[];
  onOptionPress: (option: string) => void;
  disabled?: boolean;
}

const MCQOptions: React.FC<MCQOptionsProps> = ({ options, onOptionPress, disabled: disabledProp = false }) => {
  const [customAnswer, setCustomAnswer] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(disabledProp);

  if (!options || options.length === 0) return null;

  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      setSelectedOption(customAnswer.trim());
      setDisabled(true);
      onOptionPress(customAnswer.trim());
      setCustomAnswer('');
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {options.map((option, index) => {
        const isCustomOption = option.toLowerCase().includes('other') ||
          option.toLowerCase().includes('not sure') ||
          option.toLowerCase().includes('type your');

        const isSelected = selectedOption === option;

        return (
          <button
            key={index}
            onClick={() => {
              if (disabled) return;

              if (isCustomOption) {
                setShowCustomInput(!showCustomInput);
              } else {
                setSelectedOption(option);
                setDisabled(true);
                onOptionPress(option);
              }
            }}
            disabled={disabled}
            className={`
              flex items-center gap-3 text-left
              bg-blue-50 border-l-4 border-blue-300
              rounded-lg px-4 py-3
              transition-all duration-200
              ${isSelected ? 'bg-blue-100 border-blue-500' : 'hover:bg-blue-100'}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <div className={`
              w-6 h-6 rounded-full
              flex items-center justify-center
              ${isSelected ? 'bg-primary' : 'bg-blue-100'}
            `}>
              <span className={`text-[12px] font-semibold ${isSelected ? 'text-white' : 'text-primary'}`}>
                {String.fromCharCode(65 + index)}
              </span>
            </div>
            <span className={`
              flex-1 text-[14px] leading-5 font-medium
              ${isSelected ? 'text-primary font-semibold' : 'text-gray-800'}
            `}>
              {isSelected ? '✓ ' : ''}{option}
            </span>
            {isCustomOption && !disabled && (
              <span className="text-primary text-[10px] ml-2">
                {showCustomInput ? '▼' : '▶'}
              </span>
            )}
          </button>
        );
      })}

      {/* Custom input field - shown when "Other" option is expanded */}
      {showCustomInput && (
        <div className="mt-3 space-y-2">
          <textarea
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            placeholder="Type your answer..."
            disabled={disabled}
            rows={2}
            className={`
              w-full
              bg-blue-50 rounded-lg px-4 py-3
              border-2 border-blue-300
              text-[14px] leading-5 text-gray-800
              resize-y disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-none focus:border-primary
            `}
          />
          <button
            onClick={handleCustomAnswerSubmit}
            disabled={disabled}
            className={`
              bg-primary text-white
              rounded-lg px-5 py-3
              text-[14px] font-semibold
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              hover:opacity-90
            `}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default MCQOptions;
