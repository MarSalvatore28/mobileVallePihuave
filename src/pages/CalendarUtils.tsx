import { Task } from '../types';

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const daysInMonth = (d: Date) => endOfMonth(d).getDate();

export const tasksByDate = (tasks: Task[]) => {
  const map: Record<string, Task[]> = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const key = new Date(t.dueDate).toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return map;
};
