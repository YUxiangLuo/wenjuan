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

const CARD_COLORS = [
    { border: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
    { border: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    { border: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
    { border: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
    { border: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
];

const getColor = (id: number) => CARD_COLORS[id % CARD_COLORS.length]!;

export function Dashboard() {
    const [stats, setStats] = useState({ classes: 0, teachers: 0, students: 0 });
    const [classes, setClasses] = useState<ClassItem[]>([]);

    useEffect(() => {
        fetchWithAuth("/api/admin/stats")
            .then((res) => res.json())
            .then((data) => setStats(data));

        fetchWithAuth("/api/admin/classes")
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
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                        {classes.map((cls) => {
                            const color = getColor(cls.id);
                            return (
                                <Card key={cls.id} className="hover:shadow-md transition-all border-t-0 overflow-hidden relative group cursor-pointer hover:scale-105 active:scale-95 duration-200">
                                    {/* Color Strip */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 ${color.border}`} />

                                    <div className="p-3 pt-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={`h-1.5 w-1.5 rounded-full ${color.border}`} />
                                            <div className="font-medium text-sm truncate" title={cls.name}>
                                                {cls.name}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Users className="h-3 w-3 opacity-70" />
                                                <span>{cls.teacher_name || "未分配"}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/50 font-mono">
                                                #{cls.id}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
