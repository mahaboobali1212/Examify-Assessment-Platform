import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { studentApi } from '../../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  ArrowLeft, 
  BookOpen, 
  HelpCircle,
  BarChart,
  MinusCircle
} from 'lucide-react';

const ExamResult = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!location.state?.resultData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!result) {
      fetchResult();
    }
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const res = await studentApi.getResultById(attemptId);
      setResult(res.data);
    } catch (err) {
      setError('Could not load examination results.');
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

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600 font-medium">{error || 'Result not found.'}</p>
        <Link to="/student/dashboard" className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white shadow-xs inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isPassed = result.isPassed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Navigation link */}
      <div className="flex items-center justify-between">
        <Link to="/student/history" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Exam History
        </Link>
        <Link to="/student/exams" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          <BookOpen className="w-4 h-4" /> Take Another Exam
        </Link>
      </div>

      {/* Main Scorecard Hero Card */}
      <div className="glass-card rounded-3xl p-8 border border-slate-200/80 shadow-md relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isPassed ? 'bg-emerald-500' : 'bg-rose-500'
        }`}></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {result.subject}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{result.examTitle}</h1>
            <p className="text-xs text-slate-500">
              Evaluated on {new Date(result.evaluatedAt).toLocaleString()}
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <span className={`px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                isPassed 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                  : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              }`}>
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {isPassed ? 'PASSED' : 'FAILED'}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                Score: <strong className="text-slate-900">{result.totalMarksObtained}</strong> / {result.totalExamMarks}
              </span>
            </div>
          </div>

          {/* Radial / Score Percentage Pill */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-100 min-w-[180px]">
            <p className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {result.percentage}<span className="text-2xl font-bold text-slate-400">%</span>
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Overall Score</p>
          </div>

        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Questions</p>
            <p className="text-lg font-bold text-slate-800">{result.totalQuestions}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-emerald-800">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase">Correct</p>
            <p className="text-lg font-bold text-emerald-700">{result.correctAnswers}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-rose-800">
            <p className="text-[11px] font-semibold text-rose-600 uppercase">Incorrect</p>
            <p className="text-lg font-bold text-rose-700">{result.wrongAnswers}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800">
            <p className="text-[11px] font-semibold text-amber-600 uppercase">Unattempted</p>
            <p className="text-lg font-bold text-amber-700">{result.unattemptedQuestions}</p>
          </div>
        </div>

      </div>

      {/* Question-by-Question Solution Breakdown */}
      {result.reviewList && result.reviewList.length > 0 && (
        <div className="glass-card rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Question Performance & Detailed Solutions</h2>
            <p className="text-xs text-slate-500">Review your chosen options against the official answer keys</p>
          </div>

          <div className="space-y-6">
            {result.reviewList.map((item, idx) => {
              const isUnattempted = item.selectedOptionId == null;
              const isCorrect = item.isCorrect;

              return (
                <div key={item.questionId} className="p-6 rounded-2xl border border-slate-200/90 bg-white space-y-4">
                  
                  {/* Question header */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                      Question {idx + 1} ({item.marks} Marks)
                    </span>

                    <span className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                      isCorrect 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : isUnattempted
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isCorrect && <><CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{item.marks})</>}
                      {!isCorrect && !isUnattempted && <><XCircle className="w-3.5 h-3.5" /> Incorrect (0 Marks)</>}
                      {isUnattempted && <><MinusCircle className="w-3.5 h-3.5" /> Skipped (0 Marks)</>}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {item.questionText}
                  </p>

                  {/* Options review */}
                  <div className="space-y-2 pt-1">
                    {item.options.map((opt) => {
                      const isStudentChoice = opt.id === item.selectedOptionId;
                      const isRealCorrect = Boolean(opt.isCorrect);

                      let optClass = "p-3 rounded-xl border text-xs flex items-center justify-between transition-all ";

                      if (isRealCorrect) {
                        optClass += "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold";
                      } else if (isStudentChoice && !isRealCorrect) {
                        optClass += "bg-rose-50/80 border-rose-400 text-rose-950 line-through";
                      } else {
                        optClass += "bg-slate-50/60 border-slate-200 text-slate-600";
                      }

                      return (
                        <div key={opt.id} className={optClass}>
                          <div className="flex items-center gap-2.5">
                            <span>{opt.optionText}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isStudentChoice && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                                Your Choice
                              </span>
                            )}
                            {isRealCorrect && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamResult;
