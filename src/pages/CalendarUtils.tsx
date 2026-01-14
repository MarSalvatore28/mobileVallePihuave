import { Task } from '../types';

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

export const tasksByDate = (tasks: Task[]): { [key: string]: Task[] } => {
  const map: { [key: string]: Task[] } = {};
  tasks.forEach(t => {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      const key = d.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
  });
  return map;
};