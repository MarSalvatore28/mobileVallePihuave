import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon
} from '@ionic/react';
import {
  statsChart,
  checkmarkCircle,
  ellipseOutline,
  warning
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage.service';
import { Task, Category } from '../types';
import './Tab3.css';

const Tab3: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();

    const handler = (_e: Event) => {
      loadData();
    };

    window.addEventListener('storage:updated', handler as EventListener);
    return () => window.removeEventListener('storage:updated', handler as EventListener);
  }, []);

  const loadData = async () => {
    const loadedTasks = await StorageService.getTasks();
    const loadedCategories = await StorageService.getCategories();
    setTasks(loadedTasks);
    setCategories(loadedCategories);
  };

  const allStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => !t.completed && t.priority === 'high').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length
  };

  const completionRate = allStats.total > 0 
    ? Math.round((allStats.completed / allStats.total) * 100) 
    : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Estadísticas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="stats-content">
        <div className="stats-container">
          <div className="stats-header">
            <h1 className="stats-title">Resumen General</h1>
            <p className="stats-subtitle">Tu progreso y métricas</p>
          </div>

          {/* Overall Stats */}
          <div className="overall-stats">
            <div className="stat-box blue">
              <IonIcon icon={statsChart} className="stat-icon" />
              <div className="stat-value">{allStats.total}</div>
              <div className="stat-label">Total de tareas</div>
            </div>

            <div className="stat-box green">
              <IonIcon icon={checkmarkCircle} className="stat-icon" />
              <div className="stat-value">{allStats.completed}</div>
              <div className="stat-label">Completadas</div>
            </div>

            <div className="stat-box yellow">
              <IonIcon icon={ellipseOutline} className="stat-icon" />
              <div className="stat-value">{allStats.active}</div>
              <div className="stat-label">Pendientes</div>
            </div>

            <div className="stat-box red">
              <IonIcon icon={warning} className="stat-icon" />
              <div className="stat-value">{allStats.overdue}</div>
              <div className="stat-label">Vencidas</div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="completion-section">
            <h2 className="section-title">Tasa de Completación</h2>
            <div className="completion-card">
              <div className="completion-circle">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${completionRate * 5.34} 534`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="completion-percentage">
                  <span className="percentage-value">{completionRate}%</span>
                  <span className="percentage-label">Completado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Stats */}
          <div className="categories-section">
            <h2 className="section-title">Por Categoría</h2>
            <div className="categories-list">
              {categories.map(cat => {
                const catTasks = tasks.filter(t => t.category === cat.id);
                const catCompleted = catTasks.filter(t => t.completed).length;
                const catPercentage = catTasks.length > 0 
                  ? Math.round((catCompleted / catTasks.length) * 100) 
                  : 0;

                return (
                  <div key={cat.id} className="category-stat-card">
                    <div className="category-stat-header">
                      <div className="category-info">
                        <div
                          className="category-color-dot"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="category-name">{cat.name}</span>
                      </div>
                      <span className="category-count">
                        {catCompleted}/{catTasks.length}
                      </span>
                    </div>

                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${catPercentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                      <span className="progress-percentage">{catPercentage}%</span>
                    </div>

                    <div className="category-details">
                      <div className="detail-item">
                        <span className="detail-label">Activas:</span>
                        <span className="detail-value">{catTasks.length - catCompleted}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Urgentes:</span>
                        <span className="detail-value">
                          {catTasks.filter(t => !t.completed && t.priority === 'high').length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="priority-section">
            <h2 className="section-title">Distribución por Prioridad</h2>
            <div className="priority-grid">
              {(['high', 'medium', 'low'] as const).map(priority => {
                const priorityTasks = tasks.filter(t => !t.completed && t.priority === priority);
                const priorityLabel = priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja';
                // Cambiado: color verde para prioridad 'baja'
                const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10B981';

                return (
                  <div key={priority} className="priority-card">
                    <div className="priority-header" style={{ backgroundColor: `${priorityColor}20` }}>
                      <span className="priority-label" style={{ color: priorityColor }}>
                        {priorityLabel}
                      </span>
                    </div>
                    <div className="priority-count" style={{ color: priorityColor }}>
                      {priorityTasks.length}
                    </div>
                    <div className="priority-subtitle">
                      {priorityTasks.length === 1 ? 'tarea' : 'tareas'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;