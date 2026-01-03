import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, LayoutDashboard, BookOpen, Users, BarChart3 } from "lucide-react";
import { clearToken, getUser } from "@/lib/useAuth";

export function TeacherLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();

    const handleLogout = () => {
        clearToken();  // Clears both token and user
        navigate("/login");
    };

    const navItems = [
        { path: "/teacher/dashboard", label: "仪表盘", icon: LayoutDashboard },
        { path: "/teacher/classes", label: "我的班级", icon: Users },
        { path: "/teacher/subjects", label: "课题与实验", icon: BookOpen },
    ];

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="flex min-h-screen w-full">
            {/* 侧边栏 */}
            <aside className="w-64 border-r bg-background flex flex-col">
                {/* Logo 区域 */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="font-bold text-sm leading-tight">抽样统计虚拟仿真系统</div>
                    </div>
                </div>

                {/* 导航菜单 */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path}>
                            <Button
                                variant={isActive(item.path) ? "secondary" : "ghost"}
                                className="w-full justify-start"
                            >
                                <item.icon className="mr-3 h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <Separator />

                {/* 用户信息和登出 */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {user?.name?.charAt(0) || "T"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user?.name || "教师"}</div>
                            <div className="text-xs text-muted-foreground">教师</div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        退出登录
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-muted/30 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
