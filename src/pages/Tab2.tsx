import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon
} from '@ionic/react';
import {
  calendar as calendarIcon,
  checkmarkCircle
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage.service';
import { Task, Category } from '../types';
import './Tab2.css';

const Tab2: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedTasks = await StorageService.getTasks();
    const loadedCategories = await StorageService.getCategories();
    setTasks(loadedTasks);
    setCategories(loadedCategories);
  };

  const tasksWithDates = tasks
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Calendario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="calendar-content">
        <div className="calendar-container">
          <div className="calendar-header">
            <h1 className="calendar-title">Mis Eventos</h1>
            <p className="calendar-subtitle">Tareas programadas</p>
          </div>

          <div className="calendar-list">
            {tasksWithDates.length === 0 ? (
              <div className="empty-calendar">
                <IonIcon icon={calendarIcon} className="empty-calendar-icon" />
                <p className="empty-calendar-title">No hay tareas programadas</p>
                <p className="empty-calendar-subtitle">
                  Agrega fechas a tus tareas para verlas aquí
                </p>
              </div>
            ) : (
              tasksWithDates.map(task => {
                const cat = getCategoryData(task.category);
                const taskDate = new Date(task.dueDate!);
                const today = new Date();
                const isToday = taskDate.toDateString() === today.toDateString();
                const isPast = taskDate < today && !isToday;

                return (
                  <div
                    key={task.id}
                    className={`calendar-item ${task.completed ? 'completed' : ''} ${
                      isToday ? 'today' : ''
                    } ${isPast && !task.completed ? 'overdue' : ''}`}
                  >
                    <div
                      className="calendar-date-box"
                      style={{
                        backgroundColor: `${cat?.color}20`,
                        color: cat?.color
                      }}
                    >
                      <div className="date-day">{taskDate.getDate()}</div>
                      <div className="date-month">
                        {taskDate.toLocaleDateString('es-ES', { month: 'short' })}
                      </div>
                      {isToday && <div className="today-badge">Hoy</div>}
                    </div>

                    <div className="calendar-task-details">
                      <p className={`calendar-task-text ${task.completed ? 'completed-text' : ''}`}>
                        {task.text}
                      </p>
                      <div className="calendar-task-meta">
                        <span
                          className="category-badge"
                          style={{ backgroundColor: `${cat?.color}30`, color: cat?.color }}
                        >
                          {cat?.name}
                        </span>
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                        {isPast && !task.completed && (
                          <span className="overdue-badge">Vencida</span>
                        )}
                      </div>
                    </div>

                    {task.completed && (
                      <IonIcon icon={checkmarkCircle} className="completed-check" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;