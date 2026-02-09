'use'

import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface IPromptsContext {
  jaiyaPrompt: any,
  advisorsPrompt: any,
  analysisPrompt: any,
  healthContainerPrompt: any,
  generalPrompt: any,
  generalPrompttest: any
}

const PromptsContext = createContext<IPromptsContext | null>(null)

export const PromptsProvider = ({children}: {children: React.ReactNode}) => {

  const [jaiyaPrompt, setJaiyaPrompt] = useState<any>(null);
  const [advisorsPrompt, setAdvisorsPrompt] = useState<any>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState<any>(null);
  const [generalPrompt, setGeneralPrompt] = useState<any>(null);
  const [generalPrompttest, setGeneralPrompttest] = useState<any>(null);
  const [healthContainerPrompt, setHealthContainerPrompts] = useState<any>(null);

  useEffect(() => {
    const fetchJaiayaPrompts = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', 'jaiya'));
        if (docSnap.exists()) setJaiyaPrompt(docSnap.data());
      } catch (e) {
        console.error("Error fetching jaiya prompts:", e);
      }
    };

    const fetchAdvisorPrompts = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', 'advisors'));
        if (docSnap.exists()) setAdvisorsPrompt(docSnap.data());
      } catch (e) {
        console.error("Error fetching advisor prompts:", e);
      }
    };

    const fetchAnalysisPrompts = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', 'analysis'));
        if (docSnap.exists()) setAnalysisPrompt(docSnap.data());
      } catch (e) {
        console.error("Error fetching analysis prompts:", e);
      }
    };

    const fetchHealthContainerPrompts = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', 'healthContainer'));
        if (docSnap.exists()) setHealthContainerPrompts(docSnap.data());
      } catch (e) {
        console.error("Error fetching health container prompts:", e);
      }
    };

    const fetchGeneralPrompt = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', 'generalPrompt'));
        if (docSnap.exists()) setGeneralPrompt(docSnap.data());
      } catch (e) {
        console.error("Error fetching health container prompts:", e);
      }
    };

    const fetchGeneralPrompttest = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', 'generalPrompttest'));
        if (docSnap.exists()) setGeneralPrompttest(docSnap.data());
      } catch (e) {
        console.error("Error fetching generalPrompttest:", e);
      }
    };

    const fetchPrompts = () => {
      fetchJaiayaPrompts();
      fetchAdvisorPrompts();
      fetchAnalysisPrompts();
      fetchHealthContainerPrompts();
      fetchGeneralPrompt();
      fetchGeneralPrompttest();
    }
    
    fetchPrompts();
  }, []);

  return (
    <PromptsContext.Provider value={{jaiyaPrompt, advisorsPrompt, analysisPrompt, healthContainerPrompt, generalPrompt, generalPrompttest}}>
      {children}
    </PromptsContext.Provider>
  )
}

export const usePrompts = () => {
  const context = useContext(PromptsContext);
  if (!context) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context
}