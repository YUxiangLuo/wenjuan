import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type ClassItem = {
    id: number;
    name: string;
    description?: string;
    student_count: number;
};

export function ClassList() {
    const [classes, setClasses] = useState<ClassItem[]>([]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        fetch(`/api/teacher/classes?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(setClasses);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">My Classes</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Classes</CardTitle>
                    <CardDescription>View classes and student counts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Students</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map((cls) => (
                                <TableRow key={cls.id}>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>{cls.description || "-"}</TableCell>
                                    <TableCell>{cls.student_count}</TableCell>
                                </TableRow>
                            ))}
                            {classes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No classes assigned yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
