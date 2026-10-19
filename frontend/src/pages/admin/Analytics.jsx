import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

const Analytics = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchAnalytics(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await adminApi.getAllExams();
      setExams(res.data);
      if (res.data.length > 0) {
        setSelectedExamId(String(res.data[0].id));
      }
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (id) => {
    try {
      const res = await adminApi.getExamAnalytics(id);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  const chartData = analytics?.questionPerformance?.map((q, idx) => ({
    name: `Q${idx + 1}`,
    accuracy: q.accuracyPercentage,
    questionText: q.questionText,
    difficulty: q.difficulty,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Question & Exam Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500">Analyze question-level accuracy, pass rate trends, and identify student learning gaps</p>
        </div>

        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs font-semibold text-slate-800"
        >
          {exams.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {analytics && (
        <>
          {/* KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Submissions</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{analytics.totalAttempts}</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Average Score</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{analytics.averagePercentage}%</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Highest Score</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{analytics.highestScore}</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Lowest Score</p>
              <p className="text-xl font-bold text-rose-600 mt-1">{analytics.lowestScore}</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200/80 col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Pass Rate</p>
              <p className="text-xl font-bold text-brand-600 mt-1">{analytics.passRate}%</p>
            </div>
          </div>

          {/* Question Accuracy Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Question Accuracy Breakdown (% Correct)</h3>
                <p className="text-xs text-slate-500">Percentage of students who answered each question correctly</p>
              </div>
            </div>

            <div className="h-64 pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label) => `Question: ${label}`}
                    />
                    <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No questions or attempts recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Question Performance Detailed List */}
          <div className="glass-card rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Question Diagnostic Table</h3>
              <p className="text-xs text-slate-500">Individual difficulty and success metrics per question</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">#</th>
                    <th className="py-3 px-6">Question Text</th>
                    <th className="py-3 px-6">Difficulty</th>
                    <th className="py-3 px-6">Marks</th>
                    <th className="py-3 px-6">Attempted</th>
                    <th className="py-3 px-6">Correct</th>
                    <th className="py-3 px-6">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.questionPerformance.map((q, idx) => (
                    <tr key={q.questionId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-400">Q{idx + 1}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800 max-w-md">
                        {q.questionText}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-medium">{q.marks}</td>
                      <td className="py-3.5 px-6 text-slate-600 font-medium">{q.totalAttempts}</td>
                      <td className="py-3.5 px-6 text-emerald-600 font-bold">{q.correctAttempts}</td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{q.accuracyPercentage}%</span>
                          {q.totalAttempts > 0 && q.accuracyPercentage < 50 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Tricky
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Analytics;
