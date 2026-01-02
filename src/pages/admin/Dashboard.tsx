import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, School, GraduationCap, TrendingUp } from "lucide-react";
import { fetchWithAuth } from "@/lib/useAuth";

type ClassItem = {
    id: number;
    name: string;
    description?: string;
    teacher_name?: string;
};

export function Dashboard() {
    const [stats, setStats] = useState({ classes: 0, teachers: 0, students: 0 });
    const [classes, setClasses] = useState<ClassItem[]>([]);

    useEffect(() => {
        fetchWithAuth("/api/stats")
            .then((res) => res.json())
            .then((data) => setStats(data));

        fetchWithAuth("/api/classes")
            .then((res) => res.json())
            .then((data) => setClasses(data));
    }, []);

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
                <p className="text-muted-foreground mt-1">欢迎回来，这是系统概览</p>
            </div>

            {/* 统计卡片 */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">班级总数</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <School className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.classes}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">当前活跃班级</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">教师总数</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.teachers}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">已注册教师</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">学生总数</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.students}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">已注册学生</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* 班级列表 */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">所有班级</h2>
                    <Badge variant="secondary">{classes.length} 个班级</Badge>
                </div>
                {classes.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <School className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">暂无班级，请先创建班级</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {classes.map((cls) => (
                            <Card key={cls.id} className="hover:shadow-md transition-all hover:border-primary/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                                        <Badge variant="outline" className="text-xs">
                                            ID: {cls.id}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {cls.description || "暂无描述"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-3 w-3 text-primary" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {cls.teacher_name || "未分配教师"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
