import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const ManageQuestions = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    questionText: '',
    marks: 10,
    difficulty: 'MEDIUM',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const [examRes, qRes] = await Promise.all([
        adminApi.getExamById(examId),
        adminApi.getQuestions(examId),
      ]);
      setExam(examRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormData(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText,
      marks: q.marks,
      difficulty: q.difficulty,
      options: q.options.map(o => ({
        id: o.id,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOptionTextChange = (index, text) => {
    const newOptions = [...formData.options];
    newOptions[index].optionText = text;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSelectCorrectOption = (correctIndex) => {
    const newOptions = formData.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === correctIndex,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await adminApi.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    for (let i = 0; i < formData.options.length; i++) {
      if (!formData.options[i].optionText.trim()) {
        setFormError(`Please enter text for Option ${String.fromCharCode(65 + i)}`);
        return;
      }
    }

    const hasCorrect = formData.options.some(o => o.isCorrect);
    if (!hasCorrect) {
      setFormError("Please select one correct option.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingQuestion) {
        const res = await adminApi.updateQuestion(editingQuestion.id, formData);
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? res.data : q));
      } else {
        const res = await adminApi.addQuestion(examId, formData);
        setQuestions(prev => [...prev, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving question.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadge = (level) => {
    switch (level) {
      case 'EASY':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">EASY</span>;
      case 'HARD':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px]">HARD</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">MEDIUM</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Link */}
      <Link to="/admin/exams" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Manage Exams
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
            {exam?.subject}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Question Bank: {exam?.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Total Questions: <strong className="text-slate-800">{questions.length}</strong> • Total Marks: <strong className="text-slate-800">{exam?.totalMarks}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {getDifficultyBadge(q.difficulty)}
                  <span className="text-xs font-semibold text-slate-500">
                    {q.marks} Marks
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                {q.questionText}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      opt.isCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-slate-50/60 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span>{opt.optionText}</span>
                    </div>

                    {opt.isCorrect && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-200">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">No questions added to this examination yet</p>
          <p className="text-xs text-slate-400 mt-1">Create multiple-choice questions with 4 options and set the answer key.</p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs mt-3 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add First Question
          </button>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingQuestion ? "Edit Multiple-Choice Question" : "Add Multiple-Choice Question"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Text *
            </label>
            <textarea
              rows="3"
              required
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="Type your question statement here..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marks *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-800"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* 4 Options Configuration with Radio Selection */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Four Options (Select the radio of the correct answer) *
            </label>

            {formData.options.map((opt, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  opt.isCorrect ? 'bg-emerald-50/60 border-emerald-400' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => handleSelectCorrectOption(idx)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 w-6">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </label>

                <input
                  type="text"
                  required
                  value={opt.optionText}
                  onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} description...`}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                {opt.isCorrect && (
                  <span className="text-[10px] font-bold text-emerald-700 uppercase shrink-0">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
            >
              {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageQuestions;
