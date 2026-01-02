import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function TeacherDashboard() {
    return (
        <div className="text-center py-20 space-y-4">
            <h1 className="text-4xl font-bold">Welcome, Teacher</h1>
            <p className="text-gray-500">Manage your classes and research subjects efficiently.</p>
            <div className="flex justify-center gap-4">
                <Link to="/teacher/classes"><Button variant="outline">View Classes</Button></Link>
                <Link to="/teacher/subjects"><Button>Manage Subjects</Button></Link>
            </div>
        </div>
    );
}
