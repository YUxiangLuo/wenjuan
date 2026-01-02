import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react";

type Subject = {
    id: number;
    name: string;
    description?: string;
    status: 'draft' | 'published';
};

export function SubjectList() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        fetch(`/api/subjects?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(setSubjects);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        await fetch("/api/subjects", {
            method: "POST",
            body: JSON.stringify({
                name: newName,
                description: newDesc,
                teacher_id: user.id
            })
        });
        setNewName("");
        setNewDesc("");
        setDialogOpen(false);
        loadSubjects();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this subject and all its questions?")) return;
        await fetch(`/api/subjects/${id}`, { method: "DELETE" });
        loadSubjects();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Subjects & Labs</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Subject</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Subject</DialogTitle>
                            <DialogDescription>Start a new research project or experiment.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject Name</label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Happiness Survey" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Short description" />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map(sub => (
                    <Card key={sub.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="items-center flex gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    {sub.name}
                                </CardTitle>
                                <Badge variant={sub.status === 'published' ? 'default' : 'secondary'}>
                                    {sub.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-gray-500">{sub.description || "No description provided."}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">

                            <Link to={`/teacher/subjects/${sub.id}`}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-1" /> Manage
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
                {subjects.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No subjects created yet. Click "Create Subject" to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
