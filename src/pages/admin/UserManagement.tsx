import { useState, useEffect, useMemo } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Trash2, Plus, Pencil, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { fetchWithAuth } from "@/lib/useAuth";
import { toast } from "sonner";

type User = {
    id: number;
    username: string;
    name: string;
    role: string;
    email?: string;
    class_id?: number | null;
    class_name?: string;
};

type ClassItem = {
    id: number;
    name: string;
};

interface UserManagementProps {
    role: "teacher" | "student";
}

type SortField = "id" | "username" | "name" | "email";
type SortOrder = "asc" | "desc";

export function UserManagement({ role }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // 搜索和排序状态
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("id");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    // 添加用户表单
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("123456");
    const [classId, setClassId] = useState<string>("no-class");

    // 编辑用户表单
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");

    const [loading, setLoading] = useState(false);

    // 删除 Alert 状态
    const [alertOpen, setAlertOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const roleLabel = role === 'teacher' ? '教师' : '学生';

    useEffect(() => {
        loadUsers();
        if (role === 'student') {
            loadClasses();
        }
    }, [role]);

    const loadUsers = async () => {
        const res = await fetchWithAuth(`/api/users?role=${role}`);
        const data = await res.json();
        setUsers(data);
    };

    const loadClasses = async () => {
        const res = await fetchWithAuth("/api/classes");
        const data = await res.json();
        setClasses(data);
    };

    // 过滤和排序
    const filteredUsers = useMemo(() => {
        let result = [...users];

        // 搜索过滤
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (u) =>
                    u.username.toLowerCase().includes(term) ||
                    u.name.toLowerCase().includes(term) ||
                    u.email?.toLowerCase().includes(term)
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
                case "username":
                    aVal = a.username.toLowerCase();
                    bVal = b.username.toLowerCase();
                    break;
                case "name":
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case "email":
                    aVal = (a.email || "").toLowerCase();
                    bVal = (b.email || "").toLowerCase();
                    break;
            }

            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, searchTerm, sortField, sortOrder]);

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

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !name.trim()) return;

        setLoading(true);
        try {
            const payload: any = {
                username,
                name,
                email,
                password,
                role
            };
            if (role === 'student' && classId !== "no-class") {
                payload.class_id = parseInt(classId);
            }

            const res = await fetchWithAuth("/api/users", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setUsername("");
                setName("");
                setEmail("");
                setPassword("123456");
                setClassId("no-class");
                setDialogOpen(false);
                loadUsers();
                toast.success("创建成功");
            } else {
                toast.error("创建失败（用户名可能已存在）");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditName(user.name);
        setEditEmail(user.email || "");
        setEditDialogOpen(true);
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser || !editName.trim()) return;

        setLoading(true);
        try {
            const res = await fetchWithAuth(`/api/users/${editingUser.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: editName,
                    email: editEmail,
                }),
            });

            if (res.ok) {
                setEditDialogOpen(false);
                setEditingUser(null);
                loadUsers();
                toast.success("修改成功");
            } else {
                toast.error("修改失败");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await fetchWithAuth(`/api/users/${deleteId}`, { method: "DELETE" });
        loadUsers();
        setAlertOpen(false);
        setDeleteId(null);
        toast.success("删除成功");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{roleLabel}管理</h2>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> 添加{roleLabel}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>添加{roleLabel}</DialogTitle>
                            <DialogDescription>
                                默认密码为 123456
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">用户名</label>
                                    <Input
                                        placeholder="登录用户名"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">姓名</label>
                                    <Input
                                        placeholder="真实姓名"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">邮箱</label>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {role === 'student' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">分配班级</label>
                                    <Select value={classId} onValueChange={setClassId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择班级" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no-class">暂不分配</SelectItem>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "创建中..." : "创建"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* 编辑用户对话框 */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>编辑{roleLabel}</DialogTitle>
                        <DialogDescription>
                            修改 {editingUser?.username} 的信息
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditUser} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">姓名</label>
                            <Input
                                placeholder="真实姓名"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">邮箱</label>
                            <Input
                                type="email"
                                placeholder="user@example.com"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                取消
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "保存中..." : "保存"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>全部{roleLabel}</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`搜索${roleLabel}...`}
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
                                    <button className="flex items-center hover:text-foreground" onClick={() => handleSort("id")}>
                                        ID
                                        <SortIcon field="id" />
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button className="flex items-center hover:text-foreground" onClick={() => handleSort("username")}>
                                        用户名
                                        <SortIcon field="username" />
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button className="flex items-center hover:text-foreground" onClick={() => handleSort("name")}>
                                        姓名
                                        <SortIcon field="name" />
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button className="flex items-center hover:text-foreground" onClick={() => handleSort("email")}>
                                        邮箱
                                        <SortIcon field="email" />
                                    </button>
                                </TableHead>
                                {role === 'student' && <TableHead>班级</TableHead>}
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u) => (
                                <TableRow key={u.id} className="h-14">
                                    <TableCell className="py-4">{u.id}</TableCell>
                                    <TableCell className="py-4">{u.username}</TableCell>
                                    <TableCell className="py-4 font-medium">{u.name}</TableCell>
                                    <TableCell className="py-4 text-muted-foreground">{u.email || "-"}</TableCell>
                                    {role === 'student' && <TableCell className="py-4">{u.class_name || '-'}</TableCell>}
                                    <TableCell className="text-right py-4">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(u)}>
                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(u.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={role === 'student' ? 6 : 5} className="text-center text-muted-foreground py-8">
                                        {searchTerm ? `没有找到匹配的${roleLabel}` : `暂无${roleLabel}`}
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
                            确定要删除该{roleLabel}吗？此操作不可撤销。
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
