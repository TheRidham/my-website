'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Plus, Inbox, Loader2 } from 'lucide-react';

// Types
interface SavedAnalysis {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  createdAt: Date;
  analysisType: string;
}

import { AI_APPS } from '@/constant/data';


// Mock API functions (replace with your actual implementations)
const getUserAnalyses = async (tag: string): Promise<SavedAnalysis[]> => {
  // Replace with actual API call
  return [];
};

const logAnalysisView = async (tag: string) => {
  // Replace with actual analytics call
  console.log('Analysis view:', tag);
};
import { useParams } from 'next/navigation';

export default function AnalysisPage() {
  const params = useParams();
  const slug = (params.slug as string[]).map(decodeURIComponent);
  console.log(slug);
  const router = useRouter();
  const title = slug[0];
  const tag = slug[1];

  const [previousAnalyses, setPreviousAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const themeColors = useMemo(() => {
    return AI_APPS[tag as keyof typeof AI_APPS];
  }, [tag]);

  useEffect(() => {
    loadPreviousAnalyses();
    logAnalysisView(tag);
  }, [tag]);

  const loadPreviousAnalyses = async () => {
    try {
      setLoading(true);
      const analyses = await getUserAnalyses(tag);
      setPreviousAnalyses(analyses);
    } catch (error) {
      console.error('Error loading previous analyses:', error);
      setPreviousAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAnalysisPress = (item: SavedAnalysis) => {
    router.push(
      `/analysis/saved-report?analysisId=${item.id}&analysisType=${item.analysisType}&title=${encodeURIComponent(item.title)}&tag=${item.tag}&imageUrl=${encodeURIComponent(item.imageUrl)}`
    );
  };

  const handleNewAnalysis = () => {
    router.push(`/analysis/upload?tag=${tag}&title=${encodeURIComponent(title)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div
        className="h-16 px-6 flex items-center"
        style={{
          background: `linear-gradient(90deg, ${themeColors.gradientLight[0]}, ${themeColors.gradientLight[1]})`
        }}
      >
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* New Analysis Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          
          <button
            onClick={handleNewAnalysis}
            className="w-full rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(90deg, ${themeColors.gradientDark[0]}, ${themeColors.gradientDark[1]})`
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-lg font-semibold mb-1">New Analysis</p>
              <p className="text-white/90 text-sm">Scan an image to analyze</p>
            </div>
          </button>
        </div>

        {/* Previous Analyses Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Analyses</h3>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColors.text }} />
            </div>
          ) : previousAnalyses.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Inbox className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-base mb-1">No previous analyses yet</p>
              <p className="text-gray-400 text-sm">Start by creating a new analysis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {previousAnalyses.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAnalysisPress(item)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-gray-900 font-semibold text-base mb-2 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-sm">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}