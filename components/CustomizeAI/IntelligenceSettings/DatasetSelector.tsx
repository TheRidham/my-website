'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Dataset {
  id: string;
  hospitalName: string;
  datasetName: string;
  records: number;
}

// Consistent number formatter without locale dependency
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const AVAILABLE_DATASETS: Dataset[] = [
  {
    id: 'mayo-clinic-rochester',
    hospitalName: 'Mayo Clinic',
    datasetName: 'Mayo Dataset',
    records: 120000,
  },
  {
    id: 'apollo-delhi',
    hospitalName: 'Apollo Hospitals',
    datasetName: 'Apollo Dataset',
    records: 50000,
  },
  {
    id: 'johns-hopkins-baltimore',
    hospitalName: 'Johns Hopkins',
    datasetName: 'Johns Hopkins Dataset',
    records: 95000,
  },
  {
    id: 'max-healthcare-delhi',
    hospitalName: 'Max Healthcare',
    datasetName: 'Max Dataset',
    records: 35000,
  },
  {
    id: 'cleveland-clinic-ohio',
    hospitalName: 'Cleveland Clinic',
    datasetName: 'Cleveland Dataset',
    records: 88000,
  },
  {
    id: 'manipal-bangalore',
    hospitalName: 'Manipal Hospitals',
    datasetName: 'Manipal Dataset',
    records: 42000,
  },
  {
    id: 'massachusetts-general-boston',
    hospitalName: 'Massachusetts General',
    datasetName: 'MGH Dataset',
    records: 75000,
  },
  {
    id: 'fortis-mumbai',
    hospitalName: 'Fortis Healthcare',
    datasetName: 'Fortis Dataset',
    records: 38000,
  },
  {
    id: 'stanford-medical-california',
    hospitalName: 'Stanford Medical',
    datasetName: 'Stanford Dataset',
    records: 68000,
  },
  {
    id: 'medanta-gurgaon',
    hospitalName: 'Medanta Institute',
    datasetName: 'Medanta Dataset',
    records: 45000,
  },
  {
    id: 'kaiser-permanente-california',
    hospitalName: 'Kaiser Permanente',
    datasetName: 'Kaiser Dataset',
    records: 110000,
  },
  {
    id: 'lilavati-mumbai',
    hospitalName: 'Lilavati Hospital',
    datasetName: 'Lilavati Dataset',
    records: 32000,
  },
];

interface DatasetSelectorProps {
  selectedDatasets: string[];
  onToggle: (datasetId: string) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ selectedDatasets, onToggle }) => {
  // Calculate total records for selected datasets
  const totalRecords = useMemo(
    () =>
      AVAILABLE_DATASETS.filter((d) => selectedDatasets.includes(d.id)).reduce(
        (sum, d) => sum + d.records,
        0
      ),
    [selectedDatasets]
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_DATASETS.map((dataset) => (
          <button
            key={dataset.id}
            onClick={() => onToggle(dataset.id)}
            className={`p-4 rounded-xl border transition-all text-left ${
              selectedDatasets.includes(dataset.id)
                ? 'border-primary bg-primary/8 shadow-md shadow-primary/10'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                {selectedDatasets.includes(dataset.id) ? (
                  <CheckCircle2 size={22} className="text-primary" />
                ) : (
                  <Circle size={22} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] text-gray-900">{dataset.hospitalName}</p>
                <p className="text-sm text-gray-500 mt-0.5">{dataset.datasetName}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatNumber(dataset.records)} records</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedDatasets.length > 0 && (
        <div className="mt-6 p-4 bg-primary/8 border border-primary/20 rounded-xl">
          <p className="text-sm font-semibold text-gray-900">
            Selected: <span className="text-primary font-bold">{selectedDatasets.length}</span> dataset{selectedDatasets.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Total Records: <span className="font-bold text-primary">{formatNumber(totalRecords)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DatasetSelector;
