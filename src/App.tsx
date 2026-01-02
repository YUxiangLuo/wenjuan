import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Login } from "@/pages/Login";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { ClassManagement } from "@/pages/admin/ClassManagement";
import { UserManagement } from "@/pages/admin/UserManagement";
import { TeacherLayout } from "@/pages/teacher/TeacherLayout";
import { TeacherDashboard } from "@/pages/teacher/TeacherDashboard";
import { ClassList } from "@/pages/teacher/ClassList";
import { SubjectList } from "@/pages/teacher/SubjectList";
import { SubjectDetail } from "@/pages/teacher/SubjectDetail";
import "./index.css";

function NavBar() {
  return (
    <nav className="flex justify-center space-x-4 mb-4 p-4">
      <Link to="/" className="text-sm font-medium hover:underline">Home</Link>
      <Link to="/about" className="text-sm font-medium hover:underline">About</Link>
      <Link to="/login" className="text-sm font-medium hover:underline">Login</Link>
    </nav>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div className="container mx-auto p-8"><NavBar /><Home /></div>} />
        <Route path="/about" element={<div className="container mx-auto p-8"><NavBar /><About /></div>} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="teachers" element={<UserManagement role="teacher" />} />
          <Route path="students" element={<UserManagement role="student" />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<ClassList />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
        </Route>
        <Route path="/student/*" element={<div>Student Portal (Coming Soon)</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
