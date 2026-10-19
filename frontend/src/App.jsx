import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamInstructions from './pages/student/ExamInstructions';
import TakeExam from './pages/student/TakeExam';
import ExamResult from './pages/student/ExamResult';
import ExamHistory from './pages/student/ExamHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageExams from './pages/admin/ManageExams';
import ManageQuestions from './pages/admin/ManageQuestions';
import ExamResults from './pages/admin/ExamResults';
import Analytics from './pages/admin/Analytics';
import AuditLogs from './pages/admin/AuditLogs';

// Helper Root Redirect
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRole="ROLE_STUDENT">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams"
                element={
                  <ProtectedRoute allowedRole="ROLE_STUDENT">
                    <AvailableExams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams/:id/instructions"
                element={
                  <ProtectedRoute allowedRole="ROLE_STUDENT">
                    <ExamInstructions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/take-exam/:attemptId"
                element={
                  <ProtectedRoute allowedRole="ROLE_STUDENT">
                    <TakeExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results/:attemptId"
                element={
                  <ProtectedRoute allowedRole="ROLE_STUDENT">
                    <ExamResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/history"
                element={
                  <ProtectedRoute allowedRole="ROLE_STUDENT">
                    <ExamHistory />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRole="ROLE_ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exams"
                element={
                  <ProtectedRoute allowedRole="ROLE_ADMIN">
                    <ManageExams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exams/:examId/questions"
                element={
                  <ProtectedRoute allowedRole="ROLE_ADMIN">
                    <ManageQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results"
                element={
                  <ProtectedRoute allowedRole="ROLE_ADMIN">
                    <ExamResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRole="ROLE_ADMIN">
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRole="ROLE_ADMIN">
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Root & Fallback */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
