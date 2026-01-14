import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonModal,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/react';
import {
  add,
  trash,
  pencil,
  close,
  checkmarkCircle,
  ellipseOutline,
  home,
  briefcase,
  heart,
  folder,
  calendar as calendarIcon,
  search
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage.service';
import { Task, Category } from '../types';
import './Tab1.css';

// Devuelve '#000' o '#fff' según el contraste del color de fondo
const getContrastColor = (hex: string): string => {
  if (!hex) return '#000';
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned;
  const intVal = parseInt(full, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  const [R, G, B] = [r, g, b].map(c => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return luminance > 0.5 ? '#000' : '#fff';
};

const Tab1: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'todas' | 'activas' | 'completadas'>('todas');
  const [searchText, setSearchText] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366F1');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  // Task form state
  const [taskText, setTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');

  // Improved color palette
  const colorPalette = [
    { hex: '#6366F1', name: 'Índigo' },
    { hex: '#8B5CF6', name: 'Violeta' },
    { hex: '#EC4899', name: 'Rosa' },
    { hex: '#EF4444', name: 'Rojo' },
    { hex: '#F59E0B', name: 'Ámbar' },
    { hex: '#10B981', name: 'Esmeralda' },
    { hex: '#14B8A6', name: 'Turquesa' },
    { hex: '#06B6D4', name: 'Cian' },
    { hex: '#3B82F6', name: 'Azul' },
    { hex: '#6B7280', name: 'Gris' },
    { hex: '#1F2937', name: 'Pizarra' }
  ];

  const iconMap: { [key: string]: string } = {
    home: home,
    briefcase: briefcase,
    heart: heart,
    folder: folder,
    calendar: calendarIcon
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let loadedTasks = await StorageService.getTasks();
    let loadedCategories = await StorageService.getCategories();

    setCategories(loadedCategories);
    setTasks(loadedTasks);

    if (loadedCategories.length > 0) {
      setActiveTab(loadedCategories[0].id);
      setTaskCategory(loadedCategories[0].id);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        category: activeTab === 'all' ? (taskCategory || (categories[0]?.id ?? '')) : activeTab,
        priority: taskPriority,
        dueDate: taskDueDate ? `${taskDueDate}T00:00:00` : '',
        createdAt: new Date().toISOString()
      };
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      await StorageService.saveTasks(updatedTasks);
      setNewTask('');
      setTaskDueDate('');
    }
  };

  const addCategory = async () => {
    if (categoryName.trim()) {
      const id = categoryName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      const newCategory: Category = {
        id,
        name: categoryName.trim(),
        icon: selectedIcon,
        color: categoryColor
      };
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      await StorageService.saveCategories(updatedCategories);
      setCategoryName('');
      setShowCategoryModal(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (categories.length <= 1) return;
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    const updatedTasks = tasks.filter(t => t.category !== categoryId);
    setCategories(updatedCategories);
    setTasks(updatedTasks);
    await StorageService.saveCategories(updatedCategories);
    await StorageService.saveTasks(updatedTasks);
    if (activeTab === categoryId && updatedCategories.length > 0) {
      setActiveTab(updatedCategories[0].id);
    }
  };

  const toggleTask = async (id: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await StorageService.saveTasks(updatedTasks);
  };

  const deleteTask = async (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    await StorageService.saveTasks(updatedTasks);
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setTaskText(task.text);
    setTaskPriority(task.priority);
    setTaskCategory(task.category);
    setTaskDueDate(task.dueDate || '');
    setShowEditModal(true);
  };

  const saveEditTask = async () => {
    if (!editingTask || !taskText.trim()) return;

    const updatedTasks = tasks.map(task =>
      task.id === editingTask.id
        ? {
          ...task,
          text: taskText.trim(),
          priority: taskPriority,
          category: taskCategory,
          dueDate: taskDueDate ? `${taskDueDate}T00:00:00` : ''
        }
        : task
    );
    setTasks(updatedTasks);
    await StorageService.saveTasks(updatedTasks);
    setShowEditModal(false);
    resetTaskForm();
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskText('');
    setTaskPriority('medium');
    setTaskCategory(categories.length > 0 ? categories[0].id : '');
    setTaskDueDate('');
  };

  const currentCategory = categories.find(c => c.id === activeTab);

  // Filtrado de tareas
  let categoryTasks = activeTab === 'all' ? [...tasks] : tasks.filter(task => task.category === activeTab);

  if (searchText.trim()) {
    categoryTasks = categoryTasks.filter(task =>
      task.text.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  const filteredTasks = categoryTasks.filter(task => {
    if (filter === 'activas') return !task.completed;
    if (filter === 'completadas') return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = {
    total: categoryTasks.length,
    completed: categoryTasks.filter(t => t.completed).length,
    active: categoryTasks.filter(t => !t.completed).length
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis Tareas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="taskflow-content">
        <div className="main-content">
          <div className="header-section">
            <h1 className="main-title">To-Do-listCito</h1>
            <p className="subtitle">Organiza tu vida con estilo</p>
          </div>

          {/* Search Bar */}
          <div className="search-bar-improved">
            <div className="search-icon-wrapper">
              <IonIcon icon={search} className="search-icon-improved" />
            </div>
            <input
              value={searchText}
              placeholder="Buscar tareas..."
              onChange={(e: any) => setSearchText(e.target.value)}
              className="search-input-improved"
            />
            {searchText && (
              <button className="search-clear-btn" onClick={() => setSearchText('')}>
                <IonIcon icon={close} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            <div className="category-tab-wrapper">
              <button
                onClick={() => setActiveTab('all')}
                className={`category-tab ${activeTab === 'all' ? 'active' : ''}`}
                style={activeTab === 'all' ? { backgroundColor: '#6B7280', color: getContrastColor('#6B7280') } : {}}
              >
                <IonIcon icon={home} />
                <span>Ver todas</span>
              </button>
            </div>
            {categories.map(cat => (
              <div key={cat.id} className="category-tab-wrapper">
                <button
                  onClick={() => setActiveTab(cat.id)}
                  className={`category-tab ${activeTab === cat.id ? 'active' : ''}`}
                  style={activeTab === cat.id ? { backgroundColor: cat.color, color: getContrastColor(cat.color) } : {}}
                >
                  <IonIcon icon={iconMap[cat.icon] || folder} />
                  <span>{cat.name}</span>
                </button>
                {categories.length > 1 && activeTab === cat.id && (
                  <button onClick={() => deleteCategory(cat.id)} className="delete-category-btn">
                    <IonIcon icon={close} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setShowCategoryModal(true)} className="category-tab new-category">
              <IonIcon icon={add} />
              <span>Nueva</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderColor: currentCategory?.color }}>
              <div className="stat-number" style={{ color: currentCategory?.color }}>{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card" style={{ borderColor: '#10b981' }}>
              <div className="stat-number" style={{ color: '#10b981' }}>{stats.completed}</div>
              <div className="stat-label">Completadas</div>
            </div>
            <div className="stat-card" style={{ borderColor: '#f59e0b' }}>
              <div className="stat-number" style={{ color: '#f59e0b' }}>{stats.active}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>

          {/* Add Task Input */}
          <div className="add-task-card">
            <div className="add-task-header">
              <div className="task-icon" style={{ backgroundColor: `${currentCategory?.color}20` }}>
                <IonIcon icon={iconMap[currentCategory?.icon || 'folder']} style={{ color: currentCategory?.color }} />
              </div>
              <input
                value={newTask}
                placeholder="Agregar nueva tarea..."
                onChange={(e: any) => setNewTask(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && addTask()}
                className="task-input-white"
              />
            </div>

            <div className="add-task-controls">
              <div className="priority-selector-compact">
                <button onClick={() => setTaskPriority('low')} className={`priority-chip low ${taskPriority === 'low' ? 'active' : ''}`}>
                  <span className="priority-dot"></span>Baja
                </button>
                <button onClick={() => setTaskPriority('medium')} className={`priority-chip medium ${taskPriority === 'medium' ? 'active' : ''}`}>
                  <span className="priority-dot"></span>Media
                </button>
                <button onClick={() => setTaskPriority('high')} className={`priority-chip high ${taskPriority === 'high' ? 'active' : ''}`}>
                  <span className="priority-dot"></span>Alta
                </button>
              </div>

              <div className="date-input-wrapper">
                <input type="date" value={taskDueDate} onChange={(e: any) => setTaskDueDate(e.target.value)} className="native-date-input" />
                <IonIcon icon={calendarIcon} className="calendar-icon-overlay" />
              </div>

              <button onClick={addTask} className="add-button-compact" style={{ backgroundColor: currentCategory?.color || '#6366F1', color: getContrastColor(currentCategory?.color || '#6366F1') }}>
                <IonIcon icon={add} /><span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-buttons">
            {(['todas', 'activas', 'completadas'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? 'active' : ''}`} style={filter === f ? { backgroundColor: currentCategory?.color } : {}}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="tasks-list">
            {sortedTasks.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={checkmarkCircle} className="empty-icon" />
                <p className="empty-title">{searchText ? 'No se encontraron tareas' : 'No hay tareas aquí'}</p>
                <p className="empty-subtitle">{searchText ? 'Intenta con otra búsqueda' : '¡Agrega tu primera tarea!'}</p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <button onClick={() => toggleTask(task.id)} className="task-checkbox" style={!task.completed ? { color: currentCategory?.color } : {}}>
                    <IonIcon icon={task.completed ? checkmarkCircle : ellipseOutline} />
                  </button>
                  <div className="task-content">
                    <p className={`task-text ${task.completed ? 'completed-text' : ''}`}>{task.text}</p>
                    <div className="task-badges">
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      {task.dueDate && (
                        <span className="date-badge">
                          <IonIcon icon={calendarIcon} />
                          {new Date(task.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => openEditModal(task)} className="task-action-btn edit">
                    <IonIcon icon={pencil} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="task-action-btn delete">
                    <IonIcon icon={trash} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="footer-text">
            {stats.active > 0 ? `${stats.active} tarea${stats.active !== 1 ? 's' : ''} pendiente${stats.active !== 1 ? 's' : ''}` : '¡Todo completado! 🎉'}
          </div>
        </div>

        {/* Category Modal */}
        <IonModal isOpen={showCategoryModal} onDidDismiss={() => setShowCategoryModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nueva Categoría</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCategoryModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="simple-modal-content">
              <div className="simple-preview" style={{ backgroundColor: categoryColor }}>
                <IonIcon icon={iconMap[selectedIcon]} className="preview-icon-white" />
                <div className="preview-text-white">{categoryName || 'Mi Categoría'}</div>
              </div>

              <div className="simple-form-group">
                <label>Nombre</label>
                <input value={categoryName} placeholder="Ej: Trabajo, Gym, Estudios..." onChange={(e: any) => setCategoryName(e.target.value)} className="simple-input-white" autoFocus />
              </div>

              <div className="simple-form-group">
                <label>Color</label>
                <div className="simple-color-grid">
                  {colorPalette.map(color => (
                    <button key={color.hex} onClick={() => setCategoryColor(color.hex)} className={`simple-color-btn ${categoryColor === color.hex ? 'selected' : ''}`} style={{ backgroundColor: color.hex }} title={color.name}>
                      {categoryColor === color.hex && (<IonIcon icon={checkmarkCircle} style={{ color: getContrastColor(color.hex) }} />)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="simple-form-group">
                <label>Ícono</label>
                <div className="simple-icon-grid">
                  {Object.entries(iconMap).map(([key, icon]) => (
                    <button key={key} onClick={() => setSelectedIcon(key)} className={`simple-icon-btn ${selectedIcon === key ? 'selected' : ''}`} style={selectedIcon === key ? { backgroundColor: categoryColor, color: getContrastColor(categoryColor) } : {}}>
                      <IonIcon icon={icon} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="simple-modal-actions">
                <IonButton expand="block" fill="outline" onClick={() => setShowCategoryModal(false)}>Cancelar</IonButton>
                <IonButton expand="block" onClick={addCategory} disabled={!categoryName.trim()} style={{ '--background': categoryColor, color: getContrastColor(categoryColor) }}>Crear</IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Edit Task Modal */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Tarea</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="simple-modal-content">
              <div className="task-preview-card" style={{ borderLeftColor: currentCategory?.color || '#6366F1', backgroundColor: `${currentCategory?.color || '#6366F1'}08` }}>
                <div className="task-preview-icon" style={{ backgroundColor: currentCategory?.color || '#6366F1' }}>
                  <IonIcon icon={iconMap[currentCategory?.icon || 'folder']} className="preview-icon-white" />
                </div>
                <div className="task-preview-text">
                  <p className="task-preview-title">{taskText || 'Escribe tu tarea...'}</p>
                  <div className="task-preview-meta">
                    <span className={`mini-priority-badge ${taskPriority}`}>
                      {taskPriority === 'high' ? 'Alta' : taskPriority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                    {taskDueDate && (
                      <span className="mini-date-badge">
                        <IonIcon icon={calendarIcon} />
                        {new Date(taskDueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="simple-form-group">
                <label>Descripción de la tarea</label>
                <input value={taskText} onChange={(e: any) => setTaskText(e.target.value)} className="simple-input-white" placeholder="Ej: Comprar víveres, Estudiar para el examen..." />
              </div>

              <div className="simple-form-group">
                <label>Prioridad</label>
                <div className="priority-selector-modal">
                  <button onClick={() => setTaskPriority('low')} className={`priority-chip-modal low ${taskPriority === 'low' ? 'active' : ''}`}>
                    <span className="priority-dot"></span>Baja
                  </button>
                  <button onClick={() => setTaskPriority('medium')} className={`priority-chip-modal medium ${taskPriority === 'medium' ? 'active' : ''}`}>
                    <span className="priority-dot"></span>Media
                  </button>
                  <button onClick={() => setTaskPriority('high')} className={`priority-chip-modal high ${taskPriority === 'high' ? 'active' : ''}`}>
                    <span className="priority-dot"></span>Alta
                  </button>
                </div>
              </div>

              <div className="simple-form-group">
                <label>Fecha de vencimiento</label>
                <div className="date-input-wrapper-full">
                  <input type="date" value={taskDueDate} onChange={(e: any) => setTaskDueDate(e.target.value)} className="native-date-input-full" />
                  <IonIcon icon={calendarIcon} className="calendar-icon-overlay" />
                </div>
              </div>

              <div className="simple-form-group">
                <label>Categoría</label>
                <div className="category-selector-grid">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setTaskCategory(cat.id)} className={`category-chip ${taskCategory === cat.id ? 'active' : ''}`} style={taskCategory === cat.id ? { backgroundColor: cat.color, color: getContrastColor(cat.color), borderColor: cat.color } : {}}>
                      <IonIcon icon={iconMap[cat.icon] || folder} />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="simple-modal-actions">
                <IonButton expand="block" fill="outline" onClick={() => setShowEditModal(false)}>Cancelar</IonButton>
                <IonButton expand="block" onClick={saveEditTask} disabled={!taskText.trim()} style={{ '--background': currentCategory?.color || '#6366F1', color: getContrastColor(currentCategory?.color || '#6366F1') }}>Guardar Cambios</IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* FAB removed per user request */}


      </IonContent>
    </IonPage>
  );
};

export default Tab1;