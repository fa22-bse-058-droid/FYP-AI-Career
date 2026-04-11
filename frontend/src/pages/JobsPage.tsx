import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../api/client';
import {
  Filter,
  Search,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface Filters {
  role: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  blacklist: string[];
}

interface Job {
  title: string;
  company: string;
  link: string;
  location?: string;
  salary?: string;
  eligible?: boolean;
  match_score?: number;
}

interface Log {
  timestamp: string;
  job_title: string;
  company: string;
  status: string;
  reason?: string;
  attempts?: number;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: 'white',
  fontSize: '0.9rem',
};

export default function JobsPage() {
  const [filters, setFilters] = useState<Filters>({
    role: '',
    location: '',
    salary_min: 0,
    salary_max: 0,
    job_type: 'Any',
    blacklist: [],
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [scraping, setScraping] = useState(false);
  const [applying, setApplying] = useState(false);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [applyResult, setApplyResult] = useState<string>('');
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [savingFilters, setSavingFilters] = useState(false);

  useEffect(() => {
    api.get('/api/jobs/filters').then(({ data }) => setFilters(data)).catch(() => {});
    api.get('/api/jobs/matched').then(({ data }) => setJobs(data.jobs ?? [])).catch(() => {});
    api.get('/api/jobs/logs').then(({ data }) => setLogs(data.logs ?? [])).catch(() => {});
  }, []);

  const saveFilters = async () => {
    setSavingFilters(true);
    try {
      await api.post('/api/jobs/filters', filters);
    } catch {
      /* ignore */
    } finally {
      setSavingFilters(false);
    }
  };

  const scrapeJobs = async () => {
    setScraping(true);
    setScrapeMsg('');
    try {
      const { data } = await api.post('/api/jobs/scrape', new FormData());
      setJobs(data.jobs ?? []);
      setScrapeMsg(`Found ${data.jobs_found ?? 0} matched jobs.`);
    } catch (err: unknown) {
      setScrapeMsg(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Scraping failed',
      );
    } finally {
      setScraping(false);
    }
  };

  const triggerApply = async () => {
    setApplying(true);
    setApplyResult('');
    try {
      const { data } = await api.post('/api/jobs/apply');
      setApplyResult(
        `Applied to ${data.applied_count}/${data.attempted_count} jobs. ${data.reason}`,
      );
      const logsRes = await api.get('/api/jobs/logs');
      setLogs(logsRes.data.logs ?? []);
    } catch (err: unknown) {
      setApplyResult(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          'Apply failed',
      );
    } finally {
      setApplying(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'success') return '#10b981';
    if (status === 'failed') return '#EC4899';
    return '#00D4FF';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'success') return <CheckCircle size={14} color="#10b981" />;
    if (status === 'failed') return <XCircle size={14} color="#EC4899" />;
    return <Clock size={14} color="#00D4FF" />;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar variant="dashboard" />

      <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
            <span className="gradient-text">Job Auto-Apply</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            Configure filters, scrape matched jobs, and automate your applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={18} color="#7C3AED" />
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Search Filters</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Role / Keywords
                  </label>
                  <input
                    type="text"
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="e.g. London, Remote"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Job Type
                  </label>
                  <select
                    value={filters.job_type}
                    onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: 12 }}
                  >
                    {['Any', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'].map((t) => (
                      <option key={t} value={t} style={{ background: '#1a1f35' }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Min Salary
                    </label>
                    <input
                      type="number"
                      value={filters.salary_min || ''}
                      onChange={(e) => setFilters({ ...filters, salary_min: Number(e.target.value) })}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Max Salary
                    </label>
                    <input
                      type="number"
                      value={filters.salary_max || ''}
                      onChange={(e) => setFilters({ ...filters, salary_max: Number(e.target.value) })}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  onClick={saveFilters}
                  disabled={savingFilters}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    border: '1px solid rgba(124,58,237,0.4)',
                    background: 'rgba(124,58,237,0.15)',
                    color: '#7C3AED',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {savingFilters ? 'Saving…' : 'Save Filters'}
                </button>
              </div>

              {/* Scrape */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 20, paddingTop: 20 }}>
                <button
                  onClick={scrapeJobs}
                  disabled={scraping}
                  className="btn-glow"
                  style={{ width: '100%', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {scraping ? (
                    <><RefreshCw size={14} className="animate-spin" /> Scraping…</>
                  ) : (
                    <><Search size={14} /> Scrape Jobs</>
                  )}
                </button>
                {scrapeMsg && (
                  <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 8, textAlign: 'center' }}>
                    {scrapeMsg}
                  </p>
                )}
              </div>

              {/* Auto-apply toggle */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  marginTop: 20,
                  paddingTop: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                  Auto-Apply
                </span>
                <button
                  onClick={() => setAutoApplyEnabled(!autoApplyEnabled)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: autoApplyEnabled ? '#00D4FF' : 'rgba(255,255,255,0.3)' }}
                >
                  {autoApplyEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <button
                onClick={triggerApply}
                disabled={applying}
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '10px',
                  borderRadius: 10,
                  border: '1px solid rgba(0,212,255,0.3)',
                  background: applying ? 'rgba(0,212,255,0.05)' : 'rgba(0,212,255,0.12)',
                  color: '#00D4FF',
                  fontWeight: 600,
                  cursor: applying ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {applying ? (
                  <><RefreshCw size={14} className="animate-spin" /> Applying…</>
                ) : (
                  <><Send size={14} /> Trigger Apply</>
                )}
              </button>
              {applyResult && (
                <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 8, textAlign: 'center' }}>
                  {applyResult}
                </p>
              )}
            </div>
          </motion.div>

          {/* Jobs + Logs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Matched Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} color="#00D4FF" />
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Matched Jobs ({jobs.length})
                </h2>
              </div>

              {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                  No jobs yet. Click "Scrape Jobs" to find matches.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                  {jobs.map((job, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                          {job.company}{job.location ? ` · ${job.location}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {job.match_score != null && (
                          <span style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 600 }}>
                            {job.match_score}% match
                          </span>
                        )}
                        {job.link && (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              color: '#00D4FF',
                              border: '1px solid rgba(0,212,255,0.3)',
                              padding: '4px 10px',
                              borderRadius: 6,
                            }}
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} color="#EC4899" />
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Application Logs ({logs.length})
                </h2>
              </div>

              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                  No applications yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${statusColor(log.status)}25`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon status={log.status} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.job_title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{log.company}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: statusColor(log.status), fontWeight: 600 }}>
                          {log.status}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
