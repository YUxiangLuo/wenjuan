import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getUser, fetchWithAuth } from "@/lib/useAuth";

type SortField = "name" | "student_count";
type SortOrder = "asc" | "desc";

type ClassItem = {
    id: number;
    name: string;
    description?: string;
    student_count: number;
};

export function ClassList() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const filteredClasses = useMemo(() => {
        let result = [...classes];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (cls) =>
                    cls.name.toLowerCase().includes(term) ||
                    (cls.description && cls.description.toLowerCase().includes(term))
            );
        }

        // Sort
        result.sort((a, b) => {
            let aVal: string | number = "";
            let bVal: string | number = "";

            switch (sortField) {
                case "name":
                    aVal = a.name;
                    bVal = b.name;
                    break;
                case "student_count":
                    aVal = a.student_count;
                    bVal = b.student_count;
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
        return sortOrder === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
    };

    useEffect(() => {
        const user = getUser();
        if (!user) return;

        fetchWithAuth(`/api/teacher/classes?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(setClasses);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">我的班级</h1>
                <p className="text-muted-foreground mt-1">查看已分配的班级和学生名单。</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>已分配班级</CardTitle>
                            <CardDescription>查看班级学生及人数。</CardDescription>
                        </div>
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
                                <TableHead className="w-[200px]">
                                    <button className="flex items-center hover:text-foreground" onClick={() => handleSort("name")}>
                                        班级名称 <SortIcon field="name" />
                                    </button>
                                </TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead className="w-[100px] text-right">
                                    <button className="flex items-center justify-end w-full hover:text-foreground" onClick={() => handleSort("student_count")}>
                                        学生人数 <SortIcon field="student_count" />
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClasses.map((cls) => (
                                <TableRow key={cls.id} className="h-16 hover:bg-muted/50">
                                    <TableCell className="font-medium text-base py-4">
                                        {cls.name}
                                    </TableCell>
                                    <TableCell className="py-4 text-muted-foreground">
                                        {cls.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        <div className="inline-flex items-center justify-center bg-secondary/50 text-secondary-foreground rounded-md px-2.5 py-1 min-w-[2rem]">
                                            {cls.student_count}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredClasses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                                        {searchTerm ? "没有找到匹配的班级" : "暂无分配班级。"}
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
