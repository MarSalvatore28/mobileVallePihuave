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
    // Emit a global event so other parts of the app can react to changes
    try {
      window.dispatchEvent(new CustomEvent('storage:updated', { detail: { type: 'tasks' } }));
    } catch (e) {
      // In non-browser environments, ignore
    }
  },

  // Categorías
  async getCategories(): Promise<Category[]> {
    const { value } = await Preferences.get({ key: CATEGORIES_KEY });
    if (value) {
      return JSON.parse(value);
    }
    // Categorías por defecto con colores vibrantes y modernos
    const defaultCategories: Category[] = [
      { id: 'work', name: 'Trabajo', color: '#6366F1', icon: 'briefcase' },      // Índigo vibrante
      { id: 'personal', name: 'Personal', color: '#8B5CF6', icon: 'heart' },      // Violeta
      { id: 'shopping', name: 'Compras', color: '#EC4899', icon: 'cart' },        // Rosa
      { id: 'health', name: 'Salud', color: '#10B981', icon: 'fitness' },         // Verde esmeralda
      { id: 'study', name: 'Estudio', color: '#3B82F6', icon: 'book' }            // Azul brillante
    ];
    await this.saveCategories(defaultCategories);
    return defaultCategories;
  },

  async saveCategories(categories: Category[]): Promise<void> {
    await Preferences.set({
      key: CATEGORIES_KEY,
      value: JSON.stringify(categories)
    });
    // Emit a global event so other parts of the app can react to changes
    try {
      window.dispatchEvent(new CustomEvent('storage:updated', { detail: { type: 'categories' } }));
    } catch (e) {
      // In non-browser environments, ignore
    }
  }
};