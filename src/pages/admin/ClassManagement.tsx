import { useState, useEffect } from "react";
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
import { Trash2, Plus, Edit } from "lucide-react";

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

export function ClassManagement() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

    // Form State
    const [className, setClassName] = useState("");
    const [classDesc, setClassDesc] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState<string>("no-teacher");

    useEffect(() => {
        loadClasses();
        loadTeachers();
    }, []);

    useEffect(() => {
        if (dialogOpen) {
            if (editingClass) {
                setClassName(editingClass.name);
                setClassDesc(editingClass.description || "");
                setSelectedTeacher(editingClass.teacher_id ? editingClass.teacher_id.toString() : "no-teacher");
            } else {
                setClassName("");
                setClassDesc("");
                setSelectedTeacher("no-teacher");
            }
        }
    }, [dialogOpen, editingClass]);

    const loadClasses = async () => {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data);
    };

    const loadTeachers = async () => {
        const res = await fetch("/api/users?role=teacher");
        const data = await res.json();
        setTeachers(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!className.trim()) return;

        setLoading(true);
        try {
            const payload: any = {
                name: className,
                description: classDesc,
                teacher_id: selectedTeacher === "no-teacher" ? null : parseInt(selectedTeacher)
            };

            if (editingClass) {
                await fetch("/api/classes", {
                    method: "PUT",
                    body: JSON.stringify({ ...payload, id: editingClass.id }),
                });
            } else {
                await fetch("/api/classes", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            setDialogOpen(false);
            setEditingClass(null);
            loadClasses();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? Verify no students are linked first.")) return;
        await fetch(`/api/classes/${id}`, { method: "DELETE" });
        loadClasses();
    };

    const openCreateDialog = () => {
        setEditingClass(null);
        setDialogOpen(true);
    };

    const openEditDialog = (cls: ClassItem) => {
        setEditingClass(cls);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Class Management</h2>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" /> Create Class</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingClass ? "Edit Class" : "Create New Class"}</DialogTitle>
                            <DialogDescription>
                                {editingClass ? "Update class details and teacher assignment." : "Enter the details for the new class."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Class Name</label>
                                <Input
                                    placeholder="e.g., Sociology 101"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="e.g., 2024 Fall Semester"
                                    value={classDesc}
                                    onChange={(e) => setClassDesc(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assign Teacher</label>
                                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-teacher">Unassigned</SelectItem>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>{editingClass ? "Update" : "Create"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Classes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map((cls) => (
                                <TableRow key={cls.id}>
                                    <TableCell>{cls.id}</TableCell>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>{cls.description || "-"}</TableCell>
                                    <TableCell>{cls.teacher_name || <span className="text-gray-400">Unassigned</span>}</TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(cls)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {classes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No classes found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
