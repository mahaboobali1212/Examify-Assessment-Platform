import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  Award, 
  HelpCircle, 
  Search, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await studentApi.getAvailableExams();
      setExams(res.data);
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['ALL', ...new Set(exams.map(e => e.subject))];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = subjectFilter === 'ALL' || exam.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Available Examinations</h1>
          <p className="text-sm text-slate-500">Browse published tests, read guidelines, and start your assessment</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-52 shadow-xs"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs text-slate-700"
          >
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub === 'ALL' ? 'All Subjects' : sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const attemptsMade = exam.totalAttempts || 0;
            const maxAllowed = exam.allowedAttempts || 1;
            const isLimitReached = attemptsMade >= maxAllowed;

            return (
              <div 
                key={exam.id} 
                className="glass-card rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-lg hover:border-brand-200 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                      {exam.subject}
                    </span>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.durationMinutes} mins
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {exam.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {exam.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Exam Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Questions</p>
                      <p className="text-sm font-bold text-slate-800">{exam.questionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Marks</p>
                      <p className="text-sm font-bold text-slate-800">{exam.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Pass Marks</p>
                      <p className="text-sm font-bold text-emerald-600">{exam.passMarks}</p>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Attempts: <span className="font-semibold text-slate-800">{attemptsMade} / {maxAllowed}</span>
                  </div>

                  {isLimitReached ? (
                    <button
                      disabled
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" /> Completed
                    </button>
                  ) : (
                    <Link
                      to={`/student/exams/${exam.id}/instructions`}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      {attemptsMade > 0 ? 'Resume / Retake' : 'Start Exam'} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">No matching examinations found</p>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search query or subject filters.</p>
        </div>
      )}

    </div>
  );
};

export default AvailableExams;
