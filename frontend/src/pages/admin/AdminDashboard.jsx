import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await adminApi.getOverview();
      setOverview(res.data);
    } catch (err) {
      console.error("Failed to load admin overview", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const passRate = overview?.overallPassRate || 0;
  const failRate = Math.max(0, 100 - passRate);

  const pieData = [
    { name: 'Passed', value: passRate, color: '#10b981' },
    { name: 'Failed', value: failRate, color: '#f43f5e' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500">Monitor examination engagement, student pass rates, and system performance</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Exam
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.totalStudents || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Created Exams</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.totalExams || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Attempts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.totalAttempts || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Score</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{overview?.overallAverageScore || 0}%</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pass Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{overview?.overallPassRate || 0}%</p>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pass / Fail Distribution Pie Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Pass vs Fail Ratio</h3>
            <span className="text-xs text-slate-400 font-semibold">{overview?.totalAttempts || 0} Attempts</span>
          </div>

          <div className="h-56 flex items-center justify-center">
            {overview?.totalAttempts > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No submission data yet</p>
            )}
          </div>

          <div className="flex justify-around text-xs font-semibold pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Passed: {passRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-600">Failed: {failRate}%</span>
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
              Administrative Control Hub
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Streamlined management workflows for examinations, questions, student grading, and analytical audits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Link
                to="/admin/exams"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-brand-50 hover:border-brand-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-700">Manage Examinations</h4>
                    <p className="text-[11px] text-slate-400">Create, edit, and publish tests</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/results"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Student Results</h4>
                    <p className="text-[11px] text-slate-400">View leaderboards & export CSV</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/analytics"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-purple-50 hover:border-purple-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Deep Analytics</h4>
                    <p className="text-[11px] text-slate-400">Question difficulty & accuracy</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/audit-logs"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Audit Logs</h4>
                    <p className="text-[11px] text-slate-400">Track administrative activity</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400">System Version 1.0 • Spring Boot 3 & React</span>
          </div>
        </div>

      </div>

      {/* Recent Exam Submissions Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Student Submissions</h3>
            <p className="text-xs text-slate-500">Live feed of completed student assessment submissions</p>
          </div>
          <Link to="/admin/results" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            All Submissions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {overview?.recentResults && overview.recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Exam Title</th>
                  <th className="py-3 px-6">Marks Obtained</th>
                  <th className="py-3 px-6">Percentage</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.recentResults.map((r) => (
                  <tr key={r.resultId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      <div>{r.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{r.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">{r.examTitle}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {r.totalMarksObtained} / {r.totalExamMarks}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{r.percentage}%</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      {new Date(r.evaluatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed attempts submitted yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
