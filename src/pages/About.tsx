import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function About() {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>
                    This is a full-stack template using:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Bun</li>
                    <li>React 19</li>
                    <li>Tailwind CSS v4</li>
                    <li>Shadcn UI</li>
                    <li>SQLite</li>
                </ul>
                <div className="pt-4 text-center">
                    <Link to="/" className="text-primary hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
