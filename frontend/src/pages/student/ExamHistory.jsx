import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  ArrowRight,
  Search,
  BookOpen
} from 'lucide-react';

const ExamHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await studentApi.getMyResults();
      setResults(res.data);
    } catch (err) {
      console.error("Could not fetch exam history", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.examTitle.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination History</h1>
          <p className="text-sm text-slate-500">Review your past scores, pass/fail status, and detailed answer keys</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search past exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-60 shadow-xs"
          />
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="glass-card rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Examination</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Date Taken</th>
                  <th className="py-3.5 px-6">Marks Obtained</th>
                  <th className="py-3.5 px-6">Percentage</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r) => (
                  <tr key={r.resultId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {r.examTitle}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {r.subject}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(r.evaluatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {r.totalMarksObtained} / {r.totalExamMarks}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {r.percentage}%
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        r.isPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {r.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/student/results/${r.attemptId}`}
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold hover:underline"
                      >
                        Scorecard <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-200">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">No exam attempts found</p>
          <p className="text-xs text-slate-400 mt-1">Start your first assessment from the available exams list.</p>
          <Link
            to="/student/exams"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs mt-3 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" /> Browse Exams
          </Link>
        </div>
      )}

    </div>
  );
};

export default ExamHistory;
