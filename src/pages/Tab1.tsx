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
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
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
  const [categoryColor, setCategoryColor] = useState('#2A4359');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  // Task form state
  const [taskText, setTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');

  const colorPalette = [
    '#D9D7D7', '#2A4359', '#283540', '#869766', '#436073',
    '#E63946', '#F77F00', '#06A77D', '#457B9D', '#1D3557',
    '#A8DADC', '#F1FAEE', '#264653'
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
        category: activeTab,
        priority: taskPriority,
        dueDate: '',
        createdAt: new Date().toISOString()
      };
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      await StorageService.saveTasks(updatedTasks);
      setNewTask('');
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
    setEditingTask({...task});
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
            dueDate: taskDueDate
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
  let categoryTasks = tasks.filter(task => task.category === activeTab);
  
  // Filtro por búsqueda
  if (searchText.trim()) {
    categoryTasks = categoryTasks.filter(task =>
      task.text.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  
  // Filtro por estado
  const filteredTasks = categoryTasks.filter(task => {
    if (filter === 'activas') return !task.completed;
    if (filter === 'completadas') return task.completed;
    return true;
  });

  // Ordenar por prioridad y fecha
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
            <h1 className="main-title">TaskFlow</h1>
            <p className="subtitle">Organiza tu vida con estilo</p>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <IonIcon icon={search} className="search-icon" />
            <IonInput
              value={searchText}
              placeholder="Buscar tareas..."
              onIonInput={(e: any) => setSearchText(e.detail.value)}
              className="search-input"
            />
            {searchText && (
              <IonIcon 
                icon={close} 
                className="search-clear"
                onClick={() => setSearchText('')}
              />
            )}
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            {categories.map(cat => (
              <div key={cat.id} className="category-tab-wrapper">
                <button
                  onClick={() => setActiveTab(cat.id)}
                  className={`category-tab ${activeTab === cat.id ? 'active' : ''}`}
                  style={activeTab === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <IonIcon icon={iconMap[cat.icon] || folder} />
                  <span>{cat.name}</span>
                </button>
                {categories.length > 1 && activeTab === cat.id && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="delete-category-btn"
                  >
                    <IonIcon icon={close} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="category-tab new-category"
            >
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
            <div className="task-icon" style={{ backgroundColor: `${currentCategory?.color}20` }}>
              <IonIcon icon={iconMap[currentCategory?.icon || 'folder']} style={{ color: currentCategory?.color }} />
            </div>
            <IonInput
              value={newTask}
              placeholder="Agregar nueva tarea..."
              onIonInput={(e: any) => setNewTask(e.detail.value)}
              onKeyPress={(e: any) => e.key === 'Enter' && addTask()}
              className="task-input"
            />
            <button
              onClick={addTask}
              className="add-button"
              style={{ backgroundColor: currentCategory?.color }}
            >
              <IonIcon icon={add} />
              <span>Agregar</span>
            </button>
          </div>

          {/* Filters */}
          <div className="filter-buttons">
            {(['todas', 'activas', 'completadas'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                style={filter === f ? { backgroundColor: currentCategory?.color } : {}}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="tasks-list">
            {sortedTasks.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={checkmarkCircle} className="empty-icon" />
                <p className="empty-title">
                  {searchText ? 'No se encontraron tareas' : 'No hay tareas aquí'}
                </p>
                <p className="empty-subtitle">
                  {searchText ? 'Intenta con otra búsqueda' : '¡Agrega tu primera tarea!'}
                </p>
              </div>
            ) : (
              sortedTasks.map(task => (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="task-checkbox"
                    style={!task.completed ? { color: currentCategory?.color } : {}}
                  >
                    <IonIcon icon={task.completed ? checkmarkCircle : ellipseOutline} />
                  </button>
                  
                  <div className="task-content">
                    <p className={`task-text ${task.completed ? 'completed-text' : ''}`}>
                      {task.text}
                    </p>
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
                  
                  <button
                    onClick={() => openEditModal(task)}
                    className="task-action-btn edit"
                  >
                    <IonIcon icon={pencil} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="task-action-btn delete"
                  >
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
          <IonContent className="modal-content">
            <div className="form-section">
              <label className="form-label">Nombre</label>
              <IonInput
                value={categoryName}
                placeholder="Ej: Gimnasio, Estudios..."
                onIonInput={(e: any) => setCategoryName(e.detail.value)}
                className="form-input"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Color</label>
              <div className="color-grid">
                {colorPalette.map(color => (
                  <button
                    key={color}
                    onClick={() => setCategoryColor(color)}
                    className={`color-option ${categoryColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Icono</label>
              <div className="icon-grid">
                {Object.entries(iconMap).map(([key, icon]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedIcon(key)}
                    className={`icon-option ${selectedIcon === key ? 'selected' : ''}`}
                    style={selectedIcon === key ? { backgroundColor: categoryColor } : {}}
                  >
                    <IonIcon icon={icon} />
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <IonButton
                expand="block"
                fill="clear"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancelar
              </IonButton>
              <IonButton
                expand="block"
                onClick={addCategory}
                disabled={!categoryName.trim()}
                style={{ '--background': '#2A4359' }}
              >
                Crear
              </IonButton>
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
          <IonContent className="modal-content">
            <div className="form-section">
              <label className="form-label">Descripción</label>
              <IonInput
                value={taskText}
                onIonInput={(e: any) => setTaskText(e.detail.value)}
                className="form-input"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Prioridad</label>
              <div className="priority-buttons">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setTaskPriority(p)}
                    className={`priority-button ${taskPriority === p ? 'selected' : ''} ${p}`}
                  >
                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Fecha de vencimiento</label>
              <IonDatetime
                value={taskDueDate}
                onIonChange={(e: any) => setTaskDueDate(e.detail.value)}
                presentation="date"
                locale="es-ES"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Categoría</label>
              <IonSelect
                value={taskCategory}
                onIonChange={(e: any) => setTaskCategory(e.detail.value)}
              >
                {categories.map(cat => (
                  <IonSelectOption key={cat.id} value={cat.id}>
                    {cat.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            <div className="modal-actions">
              <IonButton
                expand="block"
                fill="clear"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </IonButton>
              <IonButton
                expand="block"
                onClick={saveEditTask}
                style={{ '--background': '#2A4359' }}
              >
                Guardar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* FAB Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={addTask} style={{ '--background': currentCategory?.color || '#2A4359' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;