import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BookOpen, Users } from "lucide-react";
import { clearToken } from "@/lib/useAuth";

export function TeacherLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearToken();  // Clears both token and user
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-800">Teacher Portal</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        to="/teacher/dashboard"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link
                        to="/teacher/classes"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <Users className="mr-3 h-5 w-5" />
                        My Classes
                    </Link>
                    <Link
                        to="/teacher/subjects"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <BookOpen className="mr-3 h-5 w-5" />
                        Subjects & Labs
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
