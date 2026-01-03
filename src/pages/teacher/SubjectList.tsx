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
import { Search, Plus, Pencil, Trash2, BookOpen, Edit } from "lucide-react";
import { getUser, fetchWithAuth } from "@/lib/useAuth";

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
        const user = getUser();
        if (!user) return;

        fetchWithAuth(`/api/teacher/subjects?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(setSubjects);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = getUser();
        if (!user) return;

        await fetchWithAuth("/api/teacher/subjects", {
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
        if (!confirm("确定删除该课题及其所有问题吗？")) return;
        await fetchWithAuth(`/api/teacher/subjects/${id}`, { method: "DELETE" });
        loadSubjects();
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-3xl font-bold tracking-tight">课题与实验</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> 创建课题</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>创建新课题</DialogTitle>
                                <DialogDescription>开始一个新的研究项目或实验。</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">课题名称</label>
                                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="例如：幸福感调查" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">描述</label>
                                    <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="简短描述" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">创建</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-muted-foreground">管理所有的研究课题、问卷和实验项目。</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map(sub => (
                    <Card key={sub.id} className="flex flex-col hover:shadow-md transition-all hover:border-primary/50">
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
                            <p className="text-sm text-gray-500">{sub.description || "无描述。"}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">

                            <Link to={`/teacher/subjects/${sub.id}`}>
                                <Button size="sm">
                                    <Edit className="h-4 w-4 mr-1" /> 管理
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
                {subjects.length === 0 && (
                    <Card className="col-span-full border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">暂无课题。点击“创建课题”开始。</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
