import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Navbar from '../components/Navbar';
import api from '../api/client';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AnalysisResult {
  filename: string;
  cv_text_length: number;
  skills: { technical: string[]; soft: string[] };
  score: {
    overall_score: number;
    breakdown: Record<string, number>;
  };
  gap_analysis: {
    missing_skills: string[];
    high_priority_skills: string[];
    coverage_percentage: number;
  };
  similarity_score: number;
  suggestions: Array<{
    category?: string;
    priority?: string;
    message?: string;
    text?: string;
  }>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', color: '#00D4FF', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00D4FF, #7C3AED)',
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

function SkillTag({ skill, color }: { skill: string; color: string }) {
  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.78rem',
        fontWeight: 500,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color: color,
      }}
    >
      {skill}
    </span>
  );
}

export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showAllMissing, setShowAllMissing] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (jobDescription.trim()) fd.append('job_description', jobDescription.trim());
      const { data } = await api.post<AnalysisResult>('/api/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Analysis failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv_analysis_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar variant="dashboard" />

      <div className="max-w-5xl mx-auto px-6" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
            <span className="gradient-text">CV Analyzer</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            Upload your CV for AI-powered analysis, skill extraction, and gap detection.
          </p>
        </motion.div>

        {/* Upload + JD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass p-8 mb-6"
        >
          {/* Dropzone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#00D4FF' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 12,
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s',
              marginBottom: 24,
            }}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={28} color="#00D4FF" />
                <div>
                  <div style={{ fontWeight: 600, color: '#00D4FF' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <CheckCircle size={20} color="#10b981" />
              </div>
            ) : (
              <>
                <Upload size={40} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 12px' }} />
                <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                  {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV here, or click to browse'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                  Supports PDF, DOCX, TXT
                </div>
              </>
            )}
          </div>

          {/* Job description textarea */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              Job Description (optional — improves similarity scoring)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here…"
              rows={5}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: 'white',
                fontSize: '0.9rem',
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 mb-4"
              style={{
                padding: '12px 16px',
                background: 'rgba(236,72,153,0.12)',
                border: '1px solid rgba(236,72,153,0.3)',
                borderRadius: 10,
                color: '#EC4899',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            className="btn-glow"
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={{ opacity: !file || loading ? 0.6 : 1, width: '100%', fontSize: '1rem' }}
          >
            {loading ? 'Analyzing…' : 'Analyze CV →'}
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Overall Score */}
              <div className="glass p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Overall Score</h2>
                  <button
                    onClick={downloadJson}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00D4FF',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} /> Download JSON
                  </button>
                </div>

                <div className="flex items-center gap-8 mb-6">
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: `conic-gradient(#00D4FF ${result.score.overall_score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        background: '#0A0F1E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00D4FF' }}>
                        {result.score.overall_score}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>/100</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {Object.entries(result.score.breakdown || {}).map(([key, val]) => (
                      <ScoreBar
                        key={key}
                        label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        value={typeof val === 'number' ? val : 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Similarity Score </span>
                    <span style={{ fontWeight: 700, color: '#7C3AED' }}>
                      {result.similarity_score}%
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.2)',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Text Length </span>
                    <span style={{ fontWeight: 700, color: '#00D4FF' }}>
                      {result.cv_text_length.toLocaleString()} chars
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="glass p-6 mb-6">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Extracted Skills</h2>
                <div className="mb-4">
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Technical ({result.skills.technical?.length ?? 0})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(result.skills.technical ?? []).map((s) => (
                      <SkillTag key={s} skill={s} color="#00D4FF" />
                    ))}
                    {(result.skills.technical ?? []).length === 0 && (
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>None found</span>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Soft Skills ({result.skills.soft?.length ?? 0})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(result.skills.soft ?? []).map((s) => (
                      <SkillTag key={s} skill={s} color="#7C3AED" />
                    ))}
                    {(result.skills.soft ?? []).length === 0 && (
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>None found</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="glass p-6 mb-6">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Skill Gap Analysis</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div style={{ flex: 1 }}>
                    <div className="flex justify-between mb-1" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Market Coverage</span>
                      <span style={{ color: '#EC4899', fontWeight: 600 }}>{result.gap_analysis.coverage_percentage}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.gap_analysis.coverage_percentage}%` }}
                        transition={{ duration: 0.8 }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #EC4899, #7C3AED)',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Missing High-Priority Skills ({result.gap_analysis.high_priority_skills?.length ?? 0})
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(showAllMissing
                      ? result.gap_analysis.high_priority_skills
                      : result.gap_analysis.high_priority_skills?.slice(0, 12)
                    )?.map((s) => <SkillTag key={s} skill={s} color="#EC4899" />)}
                  </div>
                  {(result.gap_analysis.high_priority_skills?.length ?? 0) > 12 && (
                    <button
                      onClick={() => setShowAllMissing(!showAllMissing)}
                      className="flex items-center gap-1 text-sm"
                      style={{ color: '#EC4899', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {showAllMissing ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {result.gap_analysis.high_priority_skills.length}</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="glass p-6">
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Improvement Suggestions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.suggestions.map((s, i) => {
                      const text = s.message || s.text || JSON.stringify(s);
                      const priority = (s.priority || 'medium').toLowerCase();
                      const priorityColor = priority === 'high' ? '#EC4899' : priority === 'low' ? '#10b981' : '#00D4FF';
                      return (
                        <div
                          key={i}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 10,
                            background: `${priorityColor}10`,
                            border: `1px solid ${priorityColor}25`,
                            fontSize: '0.875rem',
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: priorityColor, fontWeight: 600, marginRight: 8, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            [{priority}]
                          </span>
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
