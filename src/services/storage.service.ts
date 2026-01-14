import { Preferences } from '@capacitor/preferences';
import { Task, Category } from '../types';

const TASKS_KEY = 'taskmaster_tasks';
const CATEGORIES_KEY = 'taskmaster_categories';

export const StorageService = {
  // Tareas
  async getTasks(): Promise<Task[]> {
    const { value } = await Preferences.get({ key: TASKS_KEY });
    return value ? JSON.parse(value) : [];
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    await Preferences.set({
      key: TASKS_KEY,
      value: JSON.stringify(tasks)
    });
  },

  // Categorías
  async getCategories(): Promise<Category[]> {
    const { value } = await Preferences.get({ key: CATEGORIES_KEY });
    if (value) {
      return JSON.parse(value);
    }
    // Categorías por defecto
    const defaultCategories: Category[] = [
      { id: 'work', name: 'Trabajo', color: '#293540', icon: 'briefcase' },
      { id: 'personal', name: 'Personal', color: '#2C4859', icon: 'person' },
      { id: 'shopping', name: 'Compras', color: '#869AA6', icon: 'cart' },
      { id: 'health', name: 'Salud', color: '#456673', icon: 'fitness' },
      { id: 'study', name: 'Estudio', color: '#293540', icon: 'book' }
    ];
    await this.saveCategories(defaultCategories);
    return defaultCategories;
  },

  async saveCategories(categories: Category[]): Promise<void> {
    await Preferences.set({
      key: CATEGORIES_KEY,
      value: JSON.stringify(categories)
    });
  }
};