'use client';

import DatasetSelector from '@/components/CustomizeAI/IntelligenceSettings/DatasetSelector';
import ModelSelector from '@/components/CustomizeAI/IntelligenceSettings/ModelSelector';
import React, { useState } from 'react';
import { Sparkles, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const IntelligenceSettings = () => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleDatasetToggle = (datasetId: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const handleSave = () => {
    toast.success('Intelligence settings saved successfully!', {
      duration: 4000,
    })
    // console.log('Settings saved:', {
    //   model: selectedModel,
    //   datasets: selectedDatasets,
    // });
    // Add your save logic here
  };

  return (
    <div className="bg-background min-h-screen max-w-5xl w-full mx-auto px-5">
      {/* Header */}
      <div className="py-4">
        <p className="text-[15px] text-gray-500">Configure your AI model and data sources for optimal performance</p>
      </div>

      <div className="space-y-6 mx-auto pb-8">
        {/* Model Selection Section */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
                  Choose Your Model
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Select from leading AI models</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <ModelSelector selectedModel={selectedModel} onChange={handleModelChange} />
          </div>
        </div>

        {/* Dataset Selection Section */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Database size={22} className="text-primary" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
                  Choose Your Datasets
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Select hospital datasets for analysis</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <DatasetSelector
              selectedDatasets={selectedDatasets}
              onToggle={handleDatasetToggle}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => {
              setSelectedModel('');
              setSelectedDatasets([]);
            }}
            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-[14px] text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedModel || selectedDatasets.length === 0}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-[14px] hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceSettings;
