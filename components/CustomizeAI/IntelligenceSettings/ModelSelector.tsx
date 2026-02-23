'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

const AVAILABLE_MODELS: Model[] = [
  // OpenAI GPT Models
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Latest GPT-4 with extended context',
  },
  {
    id: 'gpt-4.5',
    name: 'GPT-4.5',
    provider: 'OpenAI',
    description: 'Advanced GPT-4.5 model',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable general purpose model',
  },
  {
    id: 'gpt-4-mini',
    name: 'GPT-4 Mini',
    provider: 'OpenAI',
    description: 'Efficient GPT-4 variant',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and cost-effective model',
  },

  // Anthropic Claude Models
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Most capable Claude model',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Advanced reasoning capabilities',
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Compact and fast model',
  },

  // Google Gemini Models
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Next-gen Gemini model',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Advanced multimodal model',
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedModelData = AVAILABLE_MODELS.find((m) => m.id === selectedModel);
  const groupedByProvider = AVAILABLE_MODELS.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white text-left flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <div>
            {selectedModelData ? (
              <div>
                <p className="font-semibold text-[15px] text-gray-900">{selectedModelData.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedModelData.provider}</p>
              </div>
            ) : (
              <p className="text-[15px] text-gray-400">Select a model...</p>
            )}
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) max-h-80">
        {Object.entries(groupedByProvider).map(([provider, models], index) => (
          <div key={provider}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs font-bold text-gray-600 uppercase tracking-wider py-2">
              {provider}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={selectedModel} onValueChange={(value) => {
              onChange(value);
              setIsOpen(false);
            }}>
              {models.map((model) => (
                <DropdownMenuRadioItem
                  key={model.id}
                  value={model.id}
                  className="px-3 py-3 cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-[14px] text-gray-900">{model.name}</p>
                    {model.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                    )}
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
