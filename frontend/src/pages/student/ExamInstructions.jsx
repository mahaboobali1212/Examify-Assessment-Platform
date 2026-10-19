import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  FileText
} from 'lucide-react';

const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await studentApi.getExamDetails(id);
      setExam(res.data);
    } catch (err) {
      setError('Failed to fetch exam instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!agreed) return;
    setStarting(true);
    setError('');

    try {
      const res = await studentApi.startExam(id);
      // Navigate to TakeExam passing attempt details
      navigate(`/student/take-exam/${res.data.attemptId}`, { state: { attemptData: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start exam. Please verify eligibility.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600 font-medium">Exam not found.</p>
        <Link to="/student/exams" className="text-brand-600 text-xs font-bold mt-2 inline-block">
          &larr; Back to available exams
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link to="/student/exams" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Available Exams
      </Link>

      {/* Header Info Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              {exam.subject}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{exam.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">{exam.description}</p>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <Clock className="w-5 h-5 text-brand-600 mx-auto mb-1" />
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Duration</p>
            <p className="text-lg font-bold text-slate-800">{exam.durationMinutes} Minutes</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <FileText className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Questions</p>
            <p className="text-lg font-bold text-slate-800">{exam.questionCount || 0}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <Award className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Marks</p>
            <p className="text-lg font-bold text-slate-800">{exam.totalMarks}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Pass Marks</p>
            <p className="text-lg font-bold text-emerald-600">{exam.passMarks}</p>
          </div>
        </div>
      </div>

      {/* Rules & Instructions List */}
      <div className="glass-card rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          Examination Instructions & Integrity Policy
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Timed Examination & Automatic Submission</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Once started, the countdown timer begins immediately on the server. If the timer reaches 00:00:00, your exam will be automatically submitted with your currently saved answers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Autosave & Session Recovery</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Every time you select an option, your answer is automatically saved to the database. If you experience an unexpected browser crash or network drop, you can re-enter this exam and resume where you left off.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Question Palette & Review System</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Use the right-side question palette to jump between questions. You can toggle "Mark for Review" on tricky questions to revisit them before final submission.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Academic Integrity Notice</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Do not attempt to open multiple browser tabs or tamper with system time. Submissions are strictly verified against the backend server clock.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded-md border-slate-300 focus:ring-brand-500"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              I have read, understood, and agree to abide by all the examination rules.
            </span>
          </label>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartExam}
          disabled={!agreed || starting}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl shadow-lg shadow-brand-600/20 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {starting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              Start Examination Now <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>

    </div>
  );
};

export default ExamInstructions;
