import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, School, LayoutDashboard, LogOut } from "lucide-react";

export function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col p-4">
                <div className="text-xl font-bold mb-8 p-2">Admin Portal</div>

                <nav className="flex-1 space-y-2">
                    <Link to="/admin/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link to="/admin/classes">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <School className="mr-2 h-4 w-4" />
                            Classes
                        </Button>
                    </Link>
                    <Link to="/admin/teachers">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Users className="mr-2 h-4 w-4" />
                            Teachers
                        </Button>
                    </Link>
                    <Link to="/admin/students">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Users className="mr-2 h-4 w-4" />
                            Students
                        </Button>
                    </Link>
                </nav>

                <Button variant="outline" className="mt-8 justify-start text-red-400 hover:text-red-300 hover:bg-slate-800 border-slate-700" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-slate-50 p-8">
                <Outlet />
            </main>
        </div>
    );
}
