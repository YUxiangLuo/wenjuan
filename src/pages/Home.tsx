import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
    id: number;
    text: string;
    completed: number;
}

export function Home() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/todos")
            .then((res) => res.json())
            .then((data) => setTodos(data));
    }, []);

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/todos", {
                method: "POST",
                body: JSON.stringify({ text }),
            });
            const newTodo = await res.json();
            setTodos([newTodo, ...todos]);
            setText("");
        } finally {
            setLoading(false);
        }
    };

    const toggleTodo = async (id: number, currentCompleted: number) => {
        const newCompleted = currentCompleted ? 0 : 1;
        setTodos(todos.map(t => t.id === id ? { ...t, completed: newCompleted } : t));

        await fetch(`/api/todos/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ completed: newCompleted }),
        });
    };

    const deleteTodo = async (id: number) => {
        setTodos(todos.filter(t => t.id !== id));

        await fetch(`/api/todos/${id}`, {
            method: "DELETE",
        });
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Todo List</CardTitle>
                <CardDescription className="text-center">Powered by Bun + SQLite</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={addTodo} className="flex space-x-2 mb-6">
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a new task..."
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add"}
                    </Button>
                </form>

                <div className="space-y-4">
                    {todos.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No tasks yet. Add one above!</p>
                    ) : (
                        todos.map((todo) => (
                            <div
                                key={todo.id}
                                className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={!!todo.completed}
                                        onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                                        id={`todo-${todo.id}`}
                                    />
                                    <label
                                        htmlFor={`todo-${todo.id}`}
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${todo.completed ? "line-through text-muted-foreground" : ""
                                            }`}
                                    >
                                        {todo.text}
                                    </label>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                    onClick={() => deleteTodo(todo.id)}
                                >
                                    ✕
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
