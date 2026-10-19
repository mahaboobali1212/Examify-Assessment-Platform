import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { studentApi } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Send, 
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

const TakeExam = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attemptData, setAttemptData] = useState(location.state?.attemptData || null);
  const [loading, setLoading] = useState(!location.state?.attemptData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedOptionId, isMarkedForReview } }
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // 'saving' | 'saved' | 'error'
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const autoSubmitCalled = useRef(false);

  // Fetch or resume attempt
  useEffect(() => {
    if (location.state?.attemptData) {
      const data = location.state.attemptData;
      setAttemptData(data);
      const initialMap = {};
      if (data.savedAnswers) {
        data.savedAnswers.forEach(ans => {
          initialMap[ans.questionId] = {
            selectedOptionId: ans.selectedOptionId,
            isMarkedForReview: ans.isMarkedForReview || false,
          };
        });
      }
      setAnswers(initialMap);
      setLoading(false);

      if (data.remainingSeconds > 0) {
        setRemainingSeconds(data.remainingSeconds);
        setTimerActive(true);
      } else {
        triggerAutoSubmit();
      }
    } else {
      fetchAttempt();
    }
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const res = await studentApi.getActiveAttempt(attemptId);
      setAttemptData(res.data);

      // Hydrate saved answers
      const initialMap = {};
      if (res.data.savedAnswers) {
        res.data.savedAnswers.forEach(ans => {
          initialMap[ans.questionId] = {
            selectedOptionId: ans.selectedOptionId,
            isMarkedForReview: ans.isMarkedForReview || false,
          };
        });
      }
      setAnswers(initialMap);

      if (res.data.remainingSeconds > 0) {
        setRemainingSeconds(res.data.remainingSeconds);
        setTimerActive(true);
      } else {
        triggerAutoSubmit();
      }
    } catch (err) {
      console.error("Could not fetch active attempt", err);
      setError(err.response?.data?.message || 'Error loading examination attempt.');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!timerActive || remainingSeconds === null) return;

    if (remainingSeconds <= 0) {
      triggerAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, remainingSeconds]);

  const triggerAutoSubmit = async () => {
    if (autoSubmitCalled.current || submitting) return;
    autoSubmitCalled.current = true;
    setSubmitting(true);
    try {
      const res = await studentApi.submitExam(attemptId);
      navigate(`/student/results/${attemptId}`, { replace: true, state: { resultData: res.data } });
    } catch (err) {
      navigate('/student/dashboard', { replace: true });
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    const current = answers[questionId] || {};
    const newAnswer = {
      ...current,
      selectedOptionId: optionId,
    };

    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    saveAnswerToServer(questionId, optionId, current.isMarkedForReview);
  };

  const handleToggleReview = (questionId) => {
    const current = answers[questionId] || {};
    const newReview = !current.isMarkedForReview;
    const newAnswer = {
      ...current,
      isMarkedForReview: newReview,
    };

    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    saveAnswerToServer(questionId, current.selectedOptionId, newReview);
  };

  const handleClearSelection = (questionId) => {
    const current = answers[questionId] || {};
    const newAnswer = {
      ...current,
      selectedOptionId: null,
    };

    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    saveAnswerToServer(questionId, null, current.isMarkedForReview);
  };

  const saveAnswerToServer = async (questionId, selectedOptionId, isMarkedForReview) => {
    setAutosaveStatus('saving');
    try {
      await studentApi.saveAnswer(attemptId, {
        questionId,
        selectedOptionId,
        isMarkedForReview,
      });
      setAutosaveStatus('saved');
    } catch (err) {
      console.error("Autosave error", err);
      setAutosaveStatus('error');
    }
  };

  const handleManualSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await studentApi.submitExam(attemptId);
      navigate(`/student/results/${attemptId}`, { replace: true, state: { resultData: res.data } });
    } catch (err) {
      console.error("Submission error", err);
      setError(err.response?.data?.message || 'Error submitting examination.');
      setSubmitting(false);
      setSubmitModalOpen(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) {
      return '--:--';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Preparing examination session...</p>
        </div>
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Exam Session Inactive</h2>
        <p className="text-xs text-slate-500">{error || 'This attempt is no longer active or has already been submitted.'}</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white shadow-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const questions = attemptData.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  // Stats for modal
  const totalQuestionsCount = questions.length;
  const answeredCount = Object.values(answers).filter(a => a.selectedOptionId != null).length;
  const reviewCount = Object.values(answers).filter(a => a.isMarkedForReview).length;
  const unansweredCount = totalQuestionsCount - answeredCount;

  // Question state color helper for palette
  const getPaletteColorClass = (qId, index) => {
    const isCurrent = index === currentIndex;
    const ans = answers[qId];
    const isAnswered = ans && ans.selectedOptionId != null;
    const isReview = ans && ans.isMarkedForReview;

    let base = "relative flex items-center justify-center w-10 h-10 rounded-xl text-xs font-bold transition-all ";

    if (isReview && isAnswered) {
      base += "bg-purple-600 text-white shadow-xs ";
    } else if (isReview) {
      base += "bg-purple-100 text-purple-700 border border-purple-300 ";
    } else if (isAnswered) {
      base += "bg-emerald-600 text-white shadow-xs ";
    } else {
      base += "bg-slate-100 text-slate-600 hover:bg-slate-200 ";
    }

    if (isCurrent) {
      base += "ring-2 ring-brand-500 ring-offset-2 scale-105 ";
    }

    return base;
  };

  const isLowTime = remainingSeconds < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-100/60 pb-12">
      
      {/* Top Sticky Assessment Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Exam Title & Autosave Badge */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">{attemptData.examTitle}</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">{attemptData.subject}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  {autosaveStatus === 'saving' && <span className="text-amber-500 animate-pulse">● Autosaving...</span>}
                  {autosaveStatus === 'saved' && <span className="text-emerald-600">✓ Saved to server</span>}
                  {autosaveStatus === 'error' && <span className="text-red-500">⚠ Autosave issue</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Timer & Submit CTA */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-extrabold border transition-all ${
              isLowTime 
                ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse' 
                : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <button
              onClick={() => setSubmitModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit Exam
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Layout: Question Area + Palette Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: Question Box (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {currentQuestion ? (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                
                {/* Question Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-xs">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600">
                      {currentQuestion.marks} Marks
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 capitalize">
                      {currentQuestion.difficulty?.toLowerCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleReview(currentQuestion.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentAnswer?.isMarkedForReview
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {currentAnswer?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                  </button>
                </div>

                {/* Question Text */}
                <div className="py-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = currentAnswer?.selectedOptionId === option.id;
                    const optionLabels = ['A', 'B', 'C', 'D'];

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between select-none ${
                          isSelected
                            ? 'bg-brand-50/70 border-brand-500 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {optionLabels[optIdx] || optIdx + 1}
                          </span>
                          <span className={`text-sm font-medium ${isSelected ? 'text-brand-950 font-semibold' : 'text-slate-800'}`}>
                            {option.optionText}
                          </span>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {currentAnswer?.selectedOptionId != null && (
                    <button
                      onClick={() => handleClearSelection(currentQuestion.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear Selection
                    </button>
                  )}

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSubmitModalOpen(true)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      Submit Exam <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ) : null}
          </div>

          {/* Right Sidebar: Question Palette (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800">Question Palette</h3>
                <span className="text-xs text-slate-400 font-medium">{answeredCount} of {questions.length} answered</span>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-purple-600 shrink-0"></span>
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-slate-200 shrink-0"></span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md ring-2 ring-brand-500 bg-white shrink-0"></span>
                  <span>Current</span>
                </div>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-5 gap-2.5 pt-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={getPaletteColorClass(q.id, idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Mobile Submit Button */}
              <div className="pt-4 border-t border-slate-100 sm:hidden">
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  <Send className="w-4 h-4" /> Submit Exam
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Confirm Examination Submission"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to finalize and submit your examination? Once submitted, answers cannot be edited.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Questions:</span>
              <span className="font-bold text-slate-800">{totalQuestionsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600 font-medium">Answered Questions:</span>
              <span className="font-bold text-emerald-700">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-600 font-medium">Unanswered Questions:</span>
              <span className="font-bold text-amber-700">{unansweredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600 font-medium">Marked for Review:</span>
              <span className="font-bold text-purple-700">{reviewCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Continue Test
            </button>
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Now
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default TakeExam;
