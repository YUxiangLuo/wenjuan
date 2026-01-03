import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Upload, Trash2, Download } from "lucide-react";
import { fetchWithAuth, getToken } from "@/lib/useAuth";
import { toast } from "sonner";

type ClassInfo = {
    id: number;
    name: string;
    description?: string;
    teacher_id?: number;
    teacher_name?: string;
};

type Student = {
    id: number;
    username: string;
    name: string;
    email?: string;
};

type Teacher = {
    id: number;
    name: string;
};

export function ClassDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [saving, setSaving] = useState(false);

    // Alert Dialog State
    const [alertOpen, setAlertOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'class', id?: number } | null>(null);

    // Add student form
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Edit class form
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editTeacher, setEditTeacher] = useState<string>("no-teacher");

    useEffect(() => {
        loadClassInfo();
        loadStudents();
        loadTeachers();
    }, [id]);

    useEffect(() => {
        if (classInfo) {
            setEditName(classInfo.name);
            setEditDesc(classInfo.description || "");
            setEditTeacher(classInfo.teacher_id ? classInfo.teacher_id.toString() : "no-teacher");
        }
    }, [classInfo]);

    const loadClassInfo = async () => {
        try {
            const res = await fetchWithAuth(`/api/admin/classes/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClassInfo(data);
            } else {
                navigate("/admin/classes");
            }
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        const res = await fetchWithAuth(`/api/admin/classes/${id}/students`);
        if (res.ok) {
            const data = await res.json();
            setStudents(data);
        }
    };

    const loadTeachers = async () => {
        const res = await fetchWithAuth("/api/admin/users?role=teacher");
        if (res.ok) {
            const data = await res.json();
            setTeachers(data);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !name.trim()) return;

        const res = await fetchWithAuth(`/api/admin/classes/${id}/students`, {
            method: "POST",
            body: JSON.stringify({ username, name, email }),
        });

        if (res.ok) {
            setUsername("");
            setName("");
            setEmail("");
            setDialogOpen(false);
            loadStudents();
            toast.success("添加学生成功");
        } else {
            const data = await res.json();
            toast.error(data.message || "添加失败");
        }
    };

    const handleDeleteStudentClick = (studentId: number) => {
        setDeleteTarget({ type: 'student', id: studentId });
        setAlertOpen(true);
    };

    const handleDeleteClassClick = () => {
        setDeleteTarget({ type: 'class' });
        setAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'student' && deleteTarget.id) {
            await fetchWithAuth(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
            loadStudents();
            toast.success("删除成功");
        } else if (deleteTarget.type === 'class') {
            await fetchWithAuth(`/api/admin/classes/${id}`, { method: "DELETE" });
            toast.success("班级已删除");
            navigate("/admin/classes");
        }
        setAlertOpen(false);
        setDeleteTarget(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const token = getToken();
            const res = await fetch(`/api/admin/classes/${id}/students/import`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                const message = `成功导入 ${data.imported} 名学生`;
                if (data.errors?.length) {
                    toast.success(message, {
                        description: (
                            <div className="max-h-32 overflow-auto text-xs whitespace-pre-wrap mt-2">
                                错误:
                                {data.errors.map((err: string, i: number) => (
                                    <div key={i}>{err}</div>
                                ))}
                            </div>
                        ),
                        duration: 5000,
                    });
                } else {
                    toast.success(message);
                }
                setImportDialogOpen(false);
                loadStudents();
            } else {
                toast.error(data.error || "导入失败");
            }
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = "username,name,email\nstudent001,张三,zhangsan@example.com\nstudent002,李四,lisi@example.com";
        const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "students_template.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim()) return;

        setSaving(true);
        try {
            const res = await fetchWithAuth("/api/admin/classes", {
                method: "PUT",
                body: JSON.stringify({
                    id: Number(id),
                    name: editName,
                    description: editDesc,
                    teacher_id: editTeacher === "no-teacher" ? null : parseInt(editTeacher),
                }),
            });

            if (res.ok) {
                loadClassInfo();
                toast.success("保存成功");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>;
    }

    if (!classInfo) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">班级不存在</div>;
    }

    return (
        <div className="space-y-6">
            {/* 页头 */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/admin/classes")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{classInfo.name}</h2>
                    <Badge variant="secondary">ID: {classInfo.id}</Badge>
                </div>
            </div>

            {/* 班级信息设置 - 上方 Card */}
            <Card>
                <CardHeader>
                    <CardTitle>班级信息</CardTitle>
                    <CardDescription>管理班级基本信息和教师分配</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">班级名称</label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="请输入班级名称"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">班级描述</label>
                            <Input
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="请输入描述（可选）"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">负责教师</label>
                            <Select value={editTeacher} onValueChange={setEditTeacher}>
                                <SelectTrigger>
                                    <SelectValue placeholder="选择教师" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-teacher">未分配</SelectItem>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                    <Button type="button" disabled={saving} onClick={handleSaveClass}>
                        {saving ? "保存中..." : "保存更改"}
                    </Button>
                    <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={handleDeleteClassClick}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除班级
                    </Button>
                </CardFooter>
            </Card>

            {/* 学生列表 */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>学生列表</CardTitle>
                        <CardDescription>共 {students.length} 名学生</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {/* CSV 导入对话框 */}
                        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    导入CSV
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>批量导入学生</DialogTitle>
                                    <DialogDescription>从 CSV 文件批量导入学生到该班级</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                        <p className="text-sm font-medium">CSV 文件格式要求：</p>
                                        <div className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border">
                                            username,name,email<br />
                                            student001,张三,zhangsan@example.com<br />
                                            student002,李四,lisi@example.com
                                        </div>
                                        <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                                            <li>• 第一行为标题行（可选）</li>
                                            <li>• username: 登录用户名（必填）</li>
                                            <li>• name: 学生姓名（必填）</li>
                                            <li>• email: 邮箱地址（可选）</li>
                                            <li>• 默认密码: 123456</li>
                                        </ul>
                                        <button
                                            type="button"
                                            className="text-primary hover:underline inline-flex items-center gap-1 text-xs mt-2"
                                            onClick={downloadTemplate}
                                        >
                                            <Download className="h-3 w-3" />
                                            下载模板文件
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">选择文件</label>
                                        <Input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            disabled={importing}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setImportDialogOpen(false)}
                                        disabled={importing}
                                    >
                                        取消
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* 添加学生对话框 */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    添加学生
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>添加学生</DialogTitle>
                                    <DialogDescription>默认密码为 123456</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddStudent} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">用户名 *</label>
                                            <Input
                                                placeholder="student001"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">姓名 *</label>
                                            <Input
                                                placeholder="张三"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">邮箱</label>
                                        <Input
                                            type="email"
                                            placeholder="student@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">添加</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead>用户名</TableHead>
                                <TableHead>姓名</TableHead>
                                <TableHead>邮箱</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id} className="h-14">
                                    <TableCell className="py-4">{student.id}</TableCell>
                                    <TableCell className="py-4">{student.username}</TableCell>
                                    <TableCell className="py-4 font-medium">{student.name}</TableCell>
                                    <TableCell className="py-4 text-muted-foreground">{student.email || "-"}</TableCell>
                                    <TableCell className="text-right py-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteStudentClick(student.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {students.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        暂无学生，点击"添加学生"或"导入CSV"添加
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除？</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget?.type === 'class'
                                ? "此操作不可撤销。班级将被删除，班级内的学生将变为无班级状态。"
                                : "确定要删除该学生吗？此操作不可撤销。"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            确认删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
