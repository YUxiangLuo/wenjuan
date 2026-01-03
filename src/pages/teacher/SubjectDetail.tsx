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
import { fetchWithAuth } from "@/lib/useAuth";

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
        const res = await fetchWithAuth(`/api/teacher/subjects/${id}`);
        const data = await res.json();
        setSubject(data);
    };

    const loadQuestions = async () => {
        const res = await fetchWithAuth(`/api/teacher/subjects/${id}/questions`);
        const data = await res.json();
        setQuestions(data);
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) return;
        setLoading(true);
        await fetchWithAuth(`/api/teacher/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(subject)
        });
        setLoading(false);
        alert("已保存!");
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse options
        let optionsArray: string[] = [];
        if (qType === 'single' || qType === 'multi') {
            optionsArray = qOptions.split(',').map(s => s.trim()).filter(Boolean);
        }

        await fetchWithAuth(`/api/teacher/subjects/${id}/questions`, {
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
        if (!confirm("确定删除问题吗?")) return;
        await fetchWithAuth(`/api/teacher/questions/${qid}`, { method: "DELETE" });
        loadQuestions();
    }

    const handleDeleteSubject = async () => {
        if (!confirm("您确定要删除此课题吗？此操作无法撤销。")) return;
        await fetchWithAuth(`/api/teacher/subjects/${id}`, { method: "DELETE" });
        navigate("/teacher/subjects");
    };

    const handleStatusChange = async (newStatus: 'draft' | 'published') => {
        if (!subject) return;
        setLoading(true);
        // Optimistic update
        const updatedSubject = { ...subject, status: newStatus };
        setSubject(updatedSubject);

        await fetchWithAuth(`/api/teacher/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(updatedSubject)
        });
        setLoading(false);
    };

    if (!subject) return <div>加载中...</div>;

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
                        <Trash2 className="h-4 w-4 mr-2" /> 删除
                    </Button>
                    {subject.status === 'draft' ? (
                        <Button onClick={() => handleStatusChange('published')}>发布</Button>
                    ) : (
                        <Button variant="outline" onClick={() => handleStatusChange('draft')}>撤回草稿</Button>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            {/* Tabs Navigation */}
            {/* Premium Underline Tabs */}
            <div className="w-full">
                <div className="flex items-center gap-8 border-b w-full mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 pt-2 text-sm font-medium transition-all flex items-center gap-2 border-b-2 hover:text-primary 
                        ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                    >
                        <Settings className="w-4 h-4" /> 概览
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`pb-3 pt-2 text-sm font-medium transition-all flex items-center gap-2 border-b-2 hover:text-primary 
                        ${activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                    >
                        <List className="w-4 h-4" /> 题库
                        <Badge variant="secondary" className="ml-1 px-1 h-5 text-[10px]">{questions.length}</Badge>
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`pb-3 pt-2 text-sm font-medium transition-all flex items-center gap-2 border-b-2 hover:text-primary 
                        ${activeTab === 'resources' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                    >
                        <FileText className="w-4 h-4" /> 资源
                    </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                    {activeTab === 'overview' && (
                        <Card>
                            <CardHeader><CardTitle>课题设置</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateSubject} className="space-y-4 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">课题名称</label>
                                        <Input value={subject.name} onChange={e => setSubject({ ...subject, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">描述</label>
                                        <Input value={subject.description || ""} onChange={e => setSubject({ ...subject, description: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">背景信息</label>
                                        <Textarea
                                            value={subject.background || ""}
                                            onChange={e => setSubject({ ...subject, background: e.target.value })}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" /> 保存更改</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'questions' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                                <div>
                                    <h3 className="text-lg font-medium">问题列表</h3>
                                    <p className="text-sm text-muted-foreground">管理该课题的所有问题。</p>
                                </div>
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button><Plus className="w-4 h-4 mr-2" /> 添加问题</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>添加问题</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddQuestion} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">问题内容</label>
                                                <Input value={qText} onChange={e => setQText(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">类型</label>
                                                <Select value={qType} onValueChange={setQType}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">单选题</SelectItem>
                                                        <SelectItem value="multi">多选题</SelectItem>
                                                        <SelectItem value="text">文本填空</SelectItem>
                                                        <SelectItem value="scale">量表题 (1-5)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {(qType === 'single' || qType === 'multi') && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">选项 (逗号分隔)</label>
                                                    <Input value={qOptions} onChange={e => setQOptions(e.target.value)} placeholder="选项A, 选项B, 选项C" />
                                                </div>
                                            )}
                                            <DialogFooter>
                                                <Button type="submit">添加</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-4">
                                {questions.map((q, idx) => (
                                    <Card key={q.id} className="hover:border-primary/50 transition-colors">
                                        <CardContent className="pt-6 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary">Q{idx + 1}</Badge>
                                                    <Badge variant="outline">{q.type}</Badge>
                                                </div>
                                                <p className="font-medium text-lg">{q.text}</p>
                                                {q.options && (
                                                    <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md inline-block">
                                                        {JSON.parse(q.options).join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteQuestion(q.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                                {questions.length === 0 && (
                                    <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/10">
                                        <div className="bg-muted inline-flex p-3 rounded-full mb-4">
                                            <List className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium">暂无问题</h3>
                                        <p className="text-muted-foreground mb-4">开始构建您的问卷或实验题库。</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>资源与文件</CardTitle>
                                <CardDescription>上传该课题所需的文件（如供学生分析的数据）。</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed rounded-lg p-16 text-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <div className="bg-muted inline-flex p-4 rounded-full mb-4 group-hover:bg-background transition-colors">
                                        <FileText className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-medium text-foreground">点击或拖拽上传文件</p>
                                    <p className="text-xs mt-1 text-muted-foreground">(功能开发中)</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
