import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setToken, setUser, getToken } from "@/lib/useAuth";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    // 根据角色导航到对应页面
    const navigateByRole = (role: string) => {
        switch (role) {
            case "admin":
                navigate("/admin/dashboard");
                break;
            case "teacher":
                navigate("/teacher/dashboard");
                break;
            case "student":
                navigate("/student/dashboard");
                break;
        }
    };

    // 检查是否已有有效的登录状态
    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();
            if (!token) {
                setChecking(false);
                return;
            }

            try {
                const res = await fetch("/api/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    navigateByRole(data.user.role);
                } else {
                    setChecking(false);
                }
            } catch {
                setChecking(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                navigateByRole(data.user.role);
            } else {
                setError(data.message || "登录失败");
            }
        } catch (err) {
            setError("网络错误");
        }
    };

    // 检查登录状态时显示加载
    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-500">加载中...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
                    <CardDescription className="text-center">抽样统计虚拟仿真系统</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username">用户名</label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="请输入用户名"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password">密码</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="请输入密码"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full">
                            登录
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
