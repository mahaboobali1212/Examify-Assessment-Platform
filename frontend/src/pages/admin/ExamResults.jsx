import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { 
  Award, 
  Download, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

const ExamResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchResults(selectedExamId);
      setSearchParams({ examId: selectedExamId });
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await adminApi.getAllExams();
      setExams(res.data);
      if (res.data.length > 0 && !selectedExamId) {
        setSelectedExamId(String(res.data[0].id));
      }
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (id) => {
    try {
      const res = await adminApi.getExamResults(id);
      setResults(res.data);
    } catch (err) {
      console.error("Failed to load exam results", err);
    }
  };

  const handleExportCsv = () => {
    if (!selectedExamId) return;
    const token = localStorage.getItem('token');
    
    // Direct browser fetch and trigger download
    fetch(adminApi.exportCsvUrl(selectedExamId), {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_${selectedExamId}_results.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => alert("Error downloading CSV."));
  };

  const filteredResults = results.filter(r =>
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  const selectedExam = exams.find(e => String(e.id) === String(selectedExamId));

  const totalSubs = results.length;
  const passCount = results.filter(r => r.isPassed).count ? results.filter(r => r.isPassed).length : results.filter(r => r.isPassed).length;
  const avgScore = totalSubs > 0 
    ? (results.reduce((acc, r) => acc + r.percentage, 0) / totalSubs).toFixed(1) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Exam Results</h1>
          <p className="text-xs sm:text-sm text-slate-500">View participant submissions, rankings, and export official CSV reports</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Exam Selector Dropdown */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs font-semibold text-slate-800"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={results.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export to CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {selectedExam && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Submissions</p>
              <p className="text-lg font-bold text-slate-900">{totalSubs}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Average Score</p>
              <p className="text-lg font-bold text-slate-900">{avgScore}%</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Passed Students</p>
              <p className="text-lg font-bold text-slate-900">{passCount} <span className="text-slate-400 text-xs font-normal">/ {totalSubs}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-72 shadow-xs"
        />
      </div>

      {/* Leaderboard Table */}
      {results.length > 0 ? (
        <div className="glass-card rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Rank</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Marks Obtained</th>
                  <th className="py-3.5 px-6">Total Marks</th>
                  <th className="py-3.5 px-6">Percentage</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r, index) => (
                  <tr key={r.resultId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        index === 0 ? 'bg-amber-100 text-amber-800' :
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-800' : 'text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{r.studentName}</div>
                      <div className="text-[11px] text-slate-400">{r.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{r.totalMarksObtained}</td>
                    <td className="py-3.5 px-6 text-slate-600 font-medium">{r.totalExamMarks}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{r.percentage}%</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {r.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 text-right">
                      {new Date(r.evaluatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-200">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">No submissions recorded for this examination</p>
          <p className="text-xs text-slate-400 mt-1">Once students start and submit their tests, scorecards and rankings will appear here.</p>
        </div>
      )}

    </div>
  );
};

export default ExamResults;
