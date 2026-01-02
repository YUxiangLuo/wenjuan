import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, GraduationCap } from "lucide-react";
import { fetchWithAuth } from "@/lib/useAuth";

export function Dashboard() {
    const [stats, setStats] = useState({ classes: 0, teachers: 0, students: 0 });

    useEffect(() => {
        fetchWithAuth("/api/stats")
            .then((res) => res.json())
            .then((data) => setStats(data));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.classes}</div>
                        <p className="text-xs text-muted-foreground">Active classes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.teachers}</div>
                        <p className="text-xs text-muted-foreground">Registered teachers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.students}</div>
                        <p className="text-xs text-muted-foreground">Enrolled students</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <p className="text-gray-500">Select a module from the sidebar to manage resources.</p>
            </div>
        </div>
    );
}
