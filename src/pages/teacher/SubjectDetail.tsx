import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Need to make sure Textarea exists or use Input for now
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
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
import { ArrowLeft, Save, Plus, Trash2, FileText, Settings, List } from "lucide-react";

type Subject = {
    id: number;
    name: string;
    description: string;
    background: string;
    status: 'draft' | 'published';
};

type Question = {
    id: number;
    text: string;
    type: 'single' | 'multi' | 'text' | 'scale';
    options: string; // JSON string
};

export function SubjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'resources'>('overview');
    const [loading, setLoading] = useState(false);

    // Question Form
    const [dialogOpen, setDialogOpen] = useState(false);
    const [qText, setQText] = useState("");
    const [qType, setQType] = useState("single");
    // Simple option handling: comma separated for demo
    const [qOptions, setQOptions] = useState("");

    useEffect(() => {
        loadSubject();
        loadQuestions();
    }, [id]);

    const loadSubject = async () => {
        const res = await fetch(`/api/subjects/${id}`);
        const data = await res.json();
        setSubject(data);
    };

    const loadQuestions = async () => {
        const res = await fetch(`/api/subjects/${id}/questions`);
        const data = await res.json();
        setQuestions(data);
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) return;
        setLoading(true);
        await fetch(`/api/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(subject)
        });
        setLoading(false);
        alert("Saved!");
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse options
        let optionsArray: string[] = [];
        if (qType === 'single' || qType === 'multi') {
            optionsArray = qOptions.split(',').map(s => s.trim()).filter(Boolean);
        }

        await fetch(`/api/subjects/${id}/questions`, {
            method: "POST",
            body: JSON.stringify({
                text: qText,
                type: qType,
                options: JSON.stringify(optionsArray)
            })
        });

        setQText("");
        setQOptions("");
        setDialogOpen(false);
        loadQuestions();
    };

    const handleDeleteQuestion = async (qid: number) => {
        if (!confirm("Delete question?")) return;
        await fetch(`/api/questions/${qid}`, { method: "DELETE" });
        loadQuestions();
    }

    const handleDeleteSubject = async () => {
        if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) return;
        await fetch(`/api/subjects/${id}`, { method: "DELETE" });
        navigate("/teacher/subjects");
    };

    const handleStatusChange = async (newStatus: 'draft' | 'published') => {
        if (!subject) return;
        setLoading(true);
        // Optimistic update
        const updatedSubject = { ...subject, status: newStatus };
        setSubject(updatedSubject);

        await fetch(`/api/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(updatedSubject)
        });
        setLoading(false);
    };

    if (!subject) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/teacher/subjects")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{subject.name}</h2>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Badge variant={subject.status === 'published' ? 'default' : 'outline'}>{subject.status}</Badge>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="destructive" onClick={handleDeleteSubject}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    {subject.status === 'draft' ? (
                        <Button onClick={() => handleStatusChange('published')}>Publish</Button>
                    ) : (
                        <Button variant="outline" onClick={() => handleStatusChange('draft')}>Revert to Draft</Button>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b">
                <button
                    className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Settings className="inline-block w-4 h-4 mr-2" /> Overview
                </button>
                <button
                    className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'questions' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveTab('questions')}
                >
                    <List className="inline-block w-4 h-4 mr-2" /> Question Bank
                </button>
                <button
                    className={`px-4 py-2 border-b-2 font-medium text-sm ${activeTab === 'resources' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveTab('resources')}
                >
                    <FileText className="inline-block w-4 h-4 mr-2" /> Resources
                </button>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
                {activeTab === 'overview' && (
                    <Card>
                        <CardHeader><CardTitle>Subject Settings</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateSubject} className="space-y-4 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject Name</label>
                                    <Input value={subject.name} onChange={e => setSubject({ ...subject, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input value={subject.description || ""} onChange={e => setSubject({ ...subject, description: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Background Information</label>
                                    {/* Fallback to Input if Textarea is missing, but assuming generic Input works for now or create simple textarea */}
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={subject.background || ""}
                                        onChange={e => setSubject({ ...subject, background: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Question</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddQuestion} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Question Text</label>
                                            <Input value={qText} onChange={e => setQText(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type</label>
                                            <Select value={qType} onValueChange={setQType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">Single Choice</SelectItem>
                                                    <SelectItem value="multi">Multiple Choice</SelectItem>
                                                    <SelectItem value="text">Text Input</SelectItem>
                                                    <SelectItem value="scale">Likert Scale (1-5)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {(qType === 'single' || qType === 'multi') && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Options (comma separated)</label>
                                                <Input value={qOptions} onChange={e => setQOptions(e.target.value)} placeholder="Option A, Option B, Option C" />
                                            </div>
                                        )}
                                        <DialogFooter>
                                            <Button type="submit">Add</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4">
                            {questions.map((q, idx) => (
                                <Card key={q.id}>
                                    <CardContent className="pt-6 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">Q{idx + 1}</Badge>
                                                <Badge>{q.type}</Badge>
                                            </div>
                                            <p className="font-medium text-lg">{q.text}</p>
                                            {q.options && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Options: {JSON.parse(q.options).join(", ")}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            {questions.length === 0 && <p className="text-gray-500">No questions yet.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resources & Files</CardTitle>
                            <CardDescription>Upload necessary files for this subject (e.g. data for students to analyze).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed rounded-lg p-10 text-center text-gray-400">
                                <FileText className="w-10 h-10 mx-auto mb-2" />
                                <p>File upload functionality coming soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
