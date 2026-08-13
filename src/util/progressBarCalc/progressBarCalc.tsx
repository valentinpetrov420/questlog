import { Node } from "../../types/Node.js";

export default function progressBarCalc(todos: Node[]): number | null {
    if (todos.length === 0) {
        return null;
    }

    const completed = todos.filter(todo => todo.completed).length;

    return Math.round((completed / todos.length) * 100);
}