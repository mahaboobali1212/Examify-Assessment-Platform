import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    title: '',
    description: '',
    subject: '',
    durationMinutes: 30,
    totalMarks: 50,
    passMarks: 25,
    allowedAttempts: 1,
    randomizeQuestions: false,
    isPublished: false,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await adminApi.getAllExams();
      setExams(res.data);
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setFormData(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description || '',
      subject: exam.subject,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      allowedAttempts: exam.allowedAttempts || 1,
      randomizeQuestions: exam.randomizeQuestions || false,
      isPublished: exam.isPublished || false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminApi.togglePublish(id);
      setExams(prev => prev.map(e => e.id === id ? res.data : e));
    } catch (err) {
      alert("Could not update publish state.");
    }
  };

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the examination "${title}"? All associated questions and attempts will be removed.`)) {
      return;
    }
    try {
      await adminApi.deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete exam.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (Number(formData.passMarks) > Number(formData.totalMarks)) {
      setFormError('Pass marks cannot be greater than total marks');
      return;
    }

    setSubmitting(true);
    try {
      if (editingExam) {
        const res = await adminApi.updateExam(editingExam.id, formData);
        setExams(prev => prev.map(e => e.id === editingExam.id ? res.data : e));
      } else {
        const res = await adminApi.createExam(formData);
        setExams(prev => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving examination details.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Examinations</h1>
          <p className="text-xs sm:text-sm text-slate-500">Configure tests, manage questions, and publish assessments</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-52 shadow-xs"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      </div>

      {/* Exams Data Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="glass-card rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Exam Details</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Marks / Pass</th>
                  <th className="py-3.5 px-6">Questions</th>
                  <th className="py-3.5 px-6">Attempts</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{exam.title}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">{exam.description || 'No description'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {exam.subject}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{exam.durationMinutes} mins</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {exam.totalMarks} / <span className="text-emerald-600">{exam.passMarks}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Link 
                        to={`/admin/exams/${exam.id}/questions`}
                        className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800"
                      >
                        {exam.questionCount || 0} Questions &rarr;
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{exam.totalAttempts || 0}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleTogglePublish(exam.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] cursor-pointer transition-all ${
                          exam.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {exam.isPublished ? '● Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/exams/${exam.id}/questions`}
                          title="Manage Question Bank"
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(exam)}
                          title="Edit Exam Settings"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id, exam.title)}
                          title="Delete Exam"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold">No examinations configured</p>
          <p className="text-xs text-slate-400 mt-1">Get started by creating your first examination.</p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs mt-3 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      )}

      {/* Create / Edit Exam Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExam ? "Edit Examination" : "Create New Examination"}
        maxWidth="max-w-xl"
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
              Examination Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Java 21 & Spring Boot Fundamentals"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Category *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of syllabus or test instructions..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pass Marks *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.passMarks}
                onChange={(e) => setFormData({ ...formData, passMarks: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allowed Attempts
              </label>
              <input
                type="number"
                min="1"
                value={formData.allowedAttempts}
                onChange={(e) => setFormData({ ...formData, allowedAttempts: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.randomizeQuestions}
                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded-md border-slate-300 focus:ring-brand-500"
              />
              <span>Randomize Question Order for Students</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded-md border-slate-300 focus:ring-brand-500"
              />
              <span>Publish Exam Immediately (visible to students)</span>
            </label>
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
              {submitting ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageExams;
