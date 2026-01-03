import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, TrendingUp } from "lucide-react";
import { getUser, fetchWithAuth } from "@/lib/useAuth";

export function TeacherDashboard() {
    const [stats, setStats] = useState({ classes: 0, subjects: 0 });
    const user = getUser();

    useEffect(() => {
        if (!user) return;

        // Fetch simple stats
        Promise.all([
            fetchWithAuth(`/api/teacher/classes?teacher_id=${user.id}`).then(res => res.json()).then(data => data.length),
            fetchWithAuth(`/api/teacher/subjects?teacher_id=${user.id}`).then(res => res.json()).then(data => data.length)
        ]).then(([classCount, subjectCount]) => {
            setStats({ classes: classCount, subjects: subjectCount });
        });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">欢迎您，{user?.name || "老师"}</h1>
                <p className="text-muted-foreground mt-1">高效管理您的班级和研究课题。</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">我的班级</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.classes}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Link to="/teacher/classes" className="text-xs text-blue-600 hover:underline">
                                查看详情 &rarr;
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">研究课题</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.subjects}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <Link to="/teacher/subjects" className="text-xs text-purple-600 hover:underline">
                                管理课题 &rarr;
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>快速开始</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Link to="/teacher/subjects">
                            <Button className="w-full">
                                <BookOpen className="mr-2 h-4 w-4" />
                                创建新课题
                            </Button>
                        </Link>
                        <Link to="/teacher/classes">
                            <Button variant="outline" className="w-full">
                                <Users className="mr-2 h-4 w-4" />
                                查看学生名单
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
