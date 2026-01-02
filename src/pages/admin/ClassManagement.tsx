import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, X, Download, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { fetchWithAuth, getToken } from "@/lib/useAuth";

type ClassItem = {
    id: number;
    name: string;
    description?: string;
    teacher_id: number | null;
    teacher_name?: string;
};

type Teacher = {
    id: number;
    name: string;
};

type SortField = "id" | "name" | "teacher_name";
type SortOrder = "asc" | "desc";

export function ClassManagement() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // 搜索和排序状态
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("id");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    // 表单状态
    const [className, setClassName] = useState("");
    const [classDesc, setClassDesc] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<string>("no-teacher");
    const [csvFile, setCsvFile] = useState<File | null>(null);

    useEffect(() => {
        loadClasses();
        loadTeachers();
    }, []);

    // 对话框打开时重置表单
    useEffect(() => {
        if (dialogOpen) {
            setClassName("");
            setClassDesc("");
            setSelectedTeacher("no-teacher");
            setCsvFile(null);
        }
    }, [dialogOpen]);

    const loadClasses = async () => {
        const res = await fetchWithAuth("/api/classes");
        const data = await res.json();
        setClasses(data);
    };

    const loadTeachers = async () => {
        const res = await fetchWithAuth("/api/users?role=teacher");
        const data = await res.json();
        setTeachers(data);
    };

    // 过滤和排序的班级列表
    const filteredClasses = useMemo(() => {
        let result = [...classes];

        // 搜索过滤
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (cls) =>
                    cls.name.toLowerCase().includes(term) ||
                    cls.description?.toLowerCase().includes(term) ||
                    cls.teacher_name?.toLowerCase().includes(term)
            );
        }

        // 排序
        result.sort((a, b) => {
            let aVal: string | number = "";
            let bVal: string | number = "";

            switch (sortField) {
                case "id":
                    aVal = a.id;
                    bVal = b.id;
                    break;
                case "name":
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case "teacher_name":
                    aVal = (a.teacher_name || "").toLowerCase();
                    bVal = (b.teacher_name || "").toLowerCase();
                    break;
            }

            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [classes, searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
        return sortOrder === "asc" ? (
            <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
        );
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!className.trim()) return;

        setLoading(true);
        try {
            // 1. 创建班级
            const res = await fetchWithAuth("/api/classes", {
                method: "POST",
                body: JSON.stringify({
                    name: className,
                    description: classDesc,
                    teacher_id: selectedTeacher === "no-teacher" ? null : parseInt(selectedTeacher)
                }),
            });

            const data = await res.json();

            if (data.success && data.id) {
                // 2. 如果选择了CSV文件，导入学生
                if (csvFile) {
                    const formData = new FormData();
                    formData.append("file", csvFile);

                    const token = getToken();
                    const importRes = await fetch(`/api/classes/${data.id}/students/import`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData,
                    });

                    const importData = await importRes.json();
                    if (importData.success) {
                        const msg = `班级创建成功！导入了 ${importData.imported} 名学生。`;
                        if (importData.errors?.length) {
                            alert(msg + `\n\n导入错误:\n${importData.errors.join("\n")}`);
                        } else {
                            alert(msg);
                        }
                    }
                }

                setDialogOpen(false);
                loadClasses();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">班级管理</h2>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> 创建班级</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>创建新班级</DialogTitle>
                            <DialogDescription>添加一个新班级到系统</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">班级名称 *</label>
                                <Input
                                    placeholder="例如：计算机2501"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">描述</label>
                                <Input
                                    placeholder="班级描述"
                                    value={classDesc}
                                    onChange={(e) => setClassDesc(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">负责教师</label>
                                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择教师" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-teacher">暂不分配</SelectItem>
                                        {teachers.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* CSV 导入区域 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">导入学生（可选）</label>
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                    <span>CSV格式：username,name,email</span>
                                    <button
                                        type="button"
                                        className="text-primary hover:underline inline-flex items-center gap-1"
                                        onClick={downloadTemplate}
                                    >
                                        <Download className="h-3 w-3" />
                                        下载模板
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                />
                                {csvFile ? (
                                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm flex-1 truncate">{csvFile.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => setCsvFile(null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        选择CSV文件
                                    </Button>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "创建中..." : "创建班级"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>全部班级</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="搜索班级..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">
                                    <button
                                        className="flex items-center hover:text-foreground"
                                        onClick={() => handleSort("id")}
                                    >
                                        ID
                                        <SortIcon field="id" />
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-foreground"
                                        onClick={() => handleSort("name")}
                                    >
                                        名称
                                        <SortIcon field="name" />
                                    </button>
                                </TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead>
                                    <button
                                        className="flex items-center hover:text-foreground"
                                        onClick={() => handleSort("teacher_name")}
                                    >
                                        负责教师
                                        <SortIcon field="teacher_name" />
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClasses.map((cls) => (
                                <TableRow
                                    key={cls.id}
                                    className="cursor-pointer hover:bg-muted/50 h-14"
                                    onClick={() => navigate(`/admin/classes/${cls.id}`)}
                                >
                                    <TableCell className="py-4">{cls.id}</TableCell>
                                    <TableCell className="py-4 font-medium">{cls.name}</TableCell>
                                    <TableCell className="py-4 text-muted-foreground">{cls.description || "-"}</TableCell>
                                    <TableCell className="py-4">{cls.teacher_name || <span className="text-muted-foreground">未分配</span>}</TableCell>
                                </TableRow>
                            ))}
                            {filteredClasses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        {searchTerm ? "没有找到匹配的班级" : "暂无班级"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
