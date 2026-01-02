import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/Login";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { ClassManagement } from "@/pages/admin/ClassManagement";
import { ClassDetail } from "@/pages/admin/ClassDetail";
import { UserManagement } from "@/pages/admin/UserManagement";
import { TeacherLayout } from "@/pages/teacher/TeacherLayout";
import { TeacherDashboard } from "@/pages/teacher/TeacherDashboard";
import { ClassList } from "@/pages/teacher/ClassList";
import { SubjectList } from "@/pages/teacher/SubjectList";
import { SubjectDetail } from "@/pages/teacher/SubjectDetail";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="classes/:id" element={<ClassDetail />} />
          <Route path="teachers" element={<UserManagement role="teacher" />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<ClassList />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
        </Route>

        {/* Student Routes (Coming Soon) */}
        <Route path="/student/*" element={<div>Student Portal (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

