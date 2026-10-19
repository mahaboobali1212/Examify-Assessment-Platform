import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  ArrowRight, 
  Award, 
  Clock, 
  Calendar,
  Sparkles
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await studentApi.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to load student dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-8 text-white shadow-xl shadow-brand-700/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-200" />
            <span>Student Assessment Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="mt-2 text-base text-brand-100">
            Ready to test your knowledge? Browse active examinations, review your past scorecards, and track your performance trends.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/student/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-brand-50 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Browse Available Exams
            </Link>
            <Link
              to="/student/history"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-800/40 border border-white/20 text-white font-semibold text-sm hover:bg-brand-800/60 transition-all"
            >
              View Exam History
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Exams</p>
            <p className="text-2xl font-bold text-slate-900">{dashboardData?.availableExamsCount || 0}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tests</p>
            <p className="text-2xl font-bold text-slate-900">{dashboardData?.completedExamsCount || 0}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{dashboardData?.averagePercentage || 0}%</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passed / Total</p>
            <p className="text-2xl font-bold text-slate-900">
              {dashboardData?.passedCount || 0} <span className="text-slate-400 text-base font-normal">/ {dashboardData?.completedExamsCount || 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Results Section */}
      <div className="glass-card rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Exam Results</h2>
            <p className="text-xs text-slate-500">Your latest assessment scorecards and performance summaries</p>
          </div>
          <Link
            to="/student/history"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {dashboardData.recentResults.map((result) => (
              <div key={result.resultId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{result.examTitle}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {result.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(result.evaluatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Score: {result.totalMarksObtained} / {result.totalExamMarks}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    result.isPassed 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {result.isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {result.percentage}% • {result.isPassed ? 'PASSED' : 'FAILED'}
                  </div>

                  <Link
                    to={`/student/results/${result.attemptId}`}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    Review Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-medium">No examinations taken yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Choose an available exam from the catalogue to test your skills and see your results here.
            </p>
            <Link
              to="/student/exams"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-xs hover:bg-brand-700 transition-all mt-2"
            >
              Explore Available Exams <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;
