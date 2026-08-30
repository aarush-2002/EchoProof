/**
 * EchoProof Main Application Entry Point
 * Voice Authenticity and Provenance Platform
 * Team Straw Hats (IIT Patna) - Utkarsh & Devansh
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, ActiveAudioRecord, DigitalCertificate } from './types';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { AnalyzeView } from './components/AnalyzeView';
import { AnalysisWorkspace } from './components/AnalysisWorkspace';
import { CertificatesView } from './components/CertificatesView';
import { VerifyView } from './components/VerifyView';
import { ForensicsView } from './components/ForensicsView';
import { DefendView } from './components/DefendView';
import { EducateView } from './components/EducateView';

import { extractAudioData, createSyntheticAudioSample } from './utils/audioProcessor';
import { generateEchoDNA, generateCertificateId } from './utils/crypto';
import { runForensicAnalysis } from './utils/analysisService';
import { 
  getStoredCertificates, 
  saveCertificate, 
  deleteCertificate, 
  getStoredHistory, 
  saveAnalysisToHistory,
  StoredAnalysisItem 
} from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [activeRecord, setActiveRecord] = useState<ActiveAudioRecord | null>(null);
  
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<StoredAnalysisItem[]>([]);
  const [selectedCertToVerify, setSelectedCertToVerify] = useState<DigitalCertificate | null>(null);

  // Analysis Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [processingPercent, setProcessingPercent] = useState(0);

  // Initial load of stored certificates and history
  useEffect(() => {
    setCertificates(getStoredCertificates());
    setRecentAnalyses(getStoredHistory());
  }, []);

  // Main Audio Processing Pipeline
  const handleAnalyzeAudio = async (
    fileOrBlob: Blob, 
    filename: string, 
    isSyntheticSample = false
  ) => {
    setIsProcessing(true);
    setProcessingPercent(10);
    setProcessingStage('Reading audio binary data...');

    try {
      // Step 1: Extract Audio Metadata & Decode AudioBuffer
      await new Promise(r => setTimeout(r, 200));
      setProcessingPercent(30);
      setProcessingStage('Extracting acoustic properties & frequency spectrum...');

      const { buffer, metadata, acousticAnalysis } = await extractAudioData(fileOrBlob, filename);
      const audioUrl = URL.createObjectURL(fileOrBlob);

      // Step 2: Generate Deterministic EchoDNA Fingerprint
      setProcessingPercent(55);
      setProcessingStage('Synthesizing deterministic EchoDNA fingerprint...');
      const echoDNA = generateEchoDNA(metadata.sha256Hash, acousticAnalysis);

      // Step 3: Run Forensics & AI Signal Assessment
      setProcessingPercent(80);
      setProcessingStage('Evaluating glottal flow, vocal formants, & neural artifacts...');

      const assessment = await runForensicAnalysis(
        metadata,
        acousticAnalysis,
        isSyntheticSample
      );

      setProcessingPercent(100);
      setProcessingStage('Finalizing voice integrity report...');

      const newRecord: ActiveAudioRecord = {
        file: fileOrBlob,
        metadata,
        audioBuffer: buffer,
        audioUrl,
        acousticAnalysis,
        assessment,
        echoDNA
      };

      setActiveRecord(newRecord);

      // Save to local storage history
      saveAnalysisToHistory({
        id: `ana-${Date.now()}`,
        filename,
        duration: metadata.duration,
        format: metadata.format,
        fileSize: metadata.fileSize,
        sha256Hash: metadata.sha256Hash,
        echoDnaId: echoDNA.id,
        assessmentScore: assessment.assessment,
        riskLevel: assessment.riskLevel,
        analyzedAt: new Date().toISOString()
      });

      setRecentAnalyses(getStoredHistory());
      setActiveTab('analyze');

    } catch (err) {
      console.error('Audio analysis pipeline error', err);
    } finally {
      setIsProcessing(false);
      setProcessingPercent(0);
      setProcessingStage('');
    }
  };

  // Create Provenance Certificate
  const handleCreateCertificate = () => {
    if (!activeRecord || !activeRecord.assessment || !activeRecord.echoDNA) return;

    const certId = generateCertificateId();
    const newCert: DigitalCertificate = {
      id: certId,
      recordingName: activeRecord.metadata.filename,
      fileSize: activeRecord.metadata.fileSize,
      format: activeRecord.metadata.format,
      duration: activeRecord.metadata.duration,
      sampleRate: activeRecord.metadata.sampleRate,
      channels: activeRecord.metadata.channels,
      sha256Hash: activeRecord.metadata.sha256Hash,
      echoDnaId: activeRecord.echoDNA.id,
      assessmentScore: activeRecord.assessment.assessment,
      riskLevel: activeRecord.assessment.riskLevel,
      integrityStatus: 'RECORDED',
      createdAt: new Date().toISOString(),
      issuer: 'EchoProof Provenance Engine (Straw Hats IIT Patna)',
      summary: activeRecord.assessment.explanation
    };

    saveCertificate(newCert);
    setCertificates(getStoredCertificates());

    // Update active record state with created certificate
    setActiveRecord(prev => prev ? { ...prev, certificate: newCert } : null);
    setActiveTab('certificates');
  };

  const handleDeleteCertificate = (id: string) => {
    deleteCertificate(id);
    setCertificates(getStoredCertificates());
  };

  // 1-Click Load Test Sample for Hackathon Judges & Testing
  const handleLoadSample = async (type: 'authentic_human' | 'synthetic_cloned') => {
    setIsProcessing(true);
    setProcessingPercent(20);
    setProcessingStage(`Generating ${type === 'authentic_human' ? 'Authentic Human Voice' : 'Synthetic Neural Clone'} Sample...`);

    try {
      const sampleBlob = createSyntheticAudioSample(type, 4.5);
      const filename = type === 'authentic_human' ? 'authentic_interview_sample.wav' : 'cloned_voice_scam_test.wav';
      await handleAnalyzeAudio(sampleBlob, filename, type === 'synthetic_cloned');
    } catch (e) {
      console.error('Error loading sample', e);
      setIsProcessing(false);
    }
  };

  const handleSelectRecentAnalysis = (item: StoredAnalysisItem) => {
    // Generate dummy test buffer for past item inspection
    const sampleBlob = createSyntheticAudioSample(item.riskLevel.includes('ELEVATED') ? 'synthetic_cloned' : 'authentic_human', item.duration || 4.0);
    handleAnalyzeAudio(sampleBlob, item.filename, item.riskLevel.includes('ELEVATED'));
  };

  const handleSelectCertToVerify = (cert: DigitalCertificate) => {
    setSelectedCertToVerify(cert);
    setActiveTab('verify');
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'verify') {
            setSelectedCertToVerify(null);
          }
        }}
        hasActiveRecording={!!activeRecord}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
        {activeTab === 'overview' && (
          <OverviewView
            onStartUpload={() => setActiveTab('analyze')}
            onStartRecord={() => setActiveTab('analyze')}
            onOpenVerify={() => setActiveTab('verify')}
            onLoadSample={handleLoadSample}
            recentAnalyses={recentAnalyses}
            onSelectRecentAnalysis={handleSelectRecentAnalysis}
          />
        )}

        {activeTab === 'analyze' && (
          <>
            {activeRecord && activeRecord.assessment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveRecord(null)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                  >
                    ← Ingest another audio recording
                  </button>
                </div>
                <AnalysisWorkspace
                  record={activeRecord}
                  onCreateCertificate={handleCreateCertificate}
                  onNavigateToCertificates={() => setActiveTab('certificates')}
                />
              </div>
            ) : (
              <AnalyzeView
                onAnalyzeAudio={handleAnalyzeAudio}
                isProcessing={isProcessing}
                processingStage={processingStage}
                processingPercent={processingPercent}
                activeRecord={activeRecord}
              />
            )}
          </>
        )}

        {activeTab === 'certificates' && (
          <CertificatesView
            certificates={certificates}
            onSelectCertificateToVerify={handleSelectCertToVerify}
            onDeleteCertificate={handleDeleteCertificate}
            onNavigateToAnalyze={() => setActiveTab('analyze')}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyView
            initialCertificate={selectedCertToVerify}
            certificates={certificates}
            onNavigateToCertificates={() => setActiveTab('certificates')}
          />
        )}

        {activeTab === 'forensics' && (
          <ForensicsView
            record={activeRecord}
            onNavigateToAnalyze={() => setActiveTab('analyze')}
          />
        )}

        {activeTab === 'defend' && <DefendView />}

        {activeTab === 'educate' && <EducateView />}
      </main>
    </div>
  );
};

export default App;
