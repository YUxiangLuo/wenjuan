import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Trash2, Plus } from "lucide-react";
import { fetchWithAuth } from "@/lib/useAuth";

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

export function UserManagement({ role }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Form State
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    // Default password 123456
    const [password, setPassword] = useState("123456");
    const [classId, setClassId] = useState<string>("no-class");

    const [loading, setLoading] = useState(false);

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
            } else {
                alert("Failed to create user (Username might exist)");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        await fetchWithAuth(`/api/users/${id}`, { method: "DELETE" });
        loadUsers();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">{role === 'teacher' ? 'Teacher Management' : 'Student Management'}</h2>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add {role === 'teacher' ? 'Teacher' : 'Student'}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New {role === 'teacher' ? 'Teacher' : 'Student'}</DialogTitle>
                            <DialogDescription>
                                Default password is 123456
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Username</label>
                                    <Input
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        placeholder="Real Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {role === 'student' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assign Class</label>
                                    <Select value={classId} onValueChange={setClassId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no-class">No Class</SelectItem>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>Create User</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All {role === 'teacher' ? 'Teachers' : 'Students'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                {role === 'student' && <TableHead>Class</TableHead>}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell>{u.username}</TableCell>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell>{u.email || "-"}</TableCell>
                                    {role === 'student' && <TableCell>{u.class_name || '-'}</TableCell>}
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={role === 'student' ? 6 : 5} className="text-center text-muted-foreground">No users found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
