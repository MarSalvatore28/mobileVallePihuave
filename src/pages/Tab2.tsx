import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { 
  chevronBack, 
  chevronForward, 
  checkmarkCircle, 
  ellipseOutline,
  calendar as calendarIcon 
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage.service';
import { Task, Category } from '../types';
import './Tab2.css';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const Tab2: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const loadedTasks = await StorageService.getTasks();
    const loadedCategories = await StorageService.getCategories();
    setTasks(loadedTasks);
    setCategories(loadedCategories);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6366F1';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

 const getTasksForDate = (day: number | null) => {
  if (!day) return [];
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return tasks.filter(t => {
    if (!t.dueDate) return false;
    // Comparar directamente las fechas en formato string YYYY-MM-DD
    const taskDateOnly = t.dueDate.split('T')[0]; // Elimina hora si existe
    return taskDateOnly === dateStr;
  });


  
};
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day: number | null) => {
    if (!day) return;
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const todayButton = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const days = getDaysInMonth();
  const selectedTasks = getTasksForDate(selectedDate.getDate());

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Calendario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="calendar-content">
        <div className="calendar-wrapper">
          
          <div className="calendar-header-section">
            <h1 className="calendar-main-title">Mi Calendario</h1>
            <p className="calendar-subtitle">Visualiza tus tareas por fecha</p>
          </div>

          <div className="calendar-card">
            <div className="month-navigation">
              <button className="month-nav-btn" onClick={prevMonth}>
                <IonIcon icon={chevronBack} />
              </button>
              <div className="month-display">
                <span className="month-name">{MONTHS[currentDate.getMonth()]}</span>
                <span className="year-name">{currentDate.getFullYear()}</span>
              </div>
              <button className="month-nav-btn today-btn" onClick={todayButton}>
                Hoy
              </button>
              <button className="month-nav-btn" onClick={nextMonth}>
                <IonIcon icon={chevronForward} />
              </button>
            </div>

            <div className="weekdays-grid">
              {WEEKDAYS.map(day => (
                <div key={day} className="weekday-header">{day}</div>
              ))}
            </div>

            <div className="calendar-days-grid">
              {days.map((day, index) => {
                const dayTasks = getTasksForDate(day);
                return (
                  <div
                    key={index}
                    className={`calendar-day ${day ? 'active' : 'empty'} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
                    onClick={() => selectDate(day)}
                  >
                    {day && (
                      <>
                        <div className="day-content">
                          <span className="day-number">{day}</span>
                          {dayTasks.length > 0 && (
                            <div className="task-count-badge">{dayTasks.length}</div>
                          )}
                        </div>
                        {dayTasks.length > 0 && (
                          <div className="task-indicators">
                            {dayTasks.slice(0, 3).map((task, i) => (
                              <div
                                key={i}
                                className="task-dot"
                                style={{ backgroundColor: getCategoryColor(task.category) }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="selected-date-section">
            <div className="selected-date-header">
              <IonIcon icon={calendarIcon} />
              <h2>
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h2>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="no-tasks-message">
                <IonIcon icon={checkmarkCircle} />
                <p>No hay tareas programadas para este día</p>
              </div>
            ) : (
              <div className="tasks-for-date">
                {selectedTasks.map(task => (
                  <div key={task.id} className={`date-task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-color-bar" style={{ backgroundColor: getCategoryColor(task.category) }} />
                    <div className="task-check-icon">
                      <IonIcon 
                        icon={task.completed ? checkmarkCircle : ellipseOutline}
                        style={{ color: task.completed ? '#10b981' : getCategoryColor(task.category) }}
                      />
                    </div>
                    <div className="task-info">
                      <p className={`task-title ${task.completed ? 'completed-text' : ''}`}>{task.text}</p>
                      <div className="task-meta-row">
                        <span className={`priority-tag ${task.priority}`}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                        <span className="category-tag" style={{ 
                          backgroundColor: `${getCategoryColor(task.category)}20`,
                          color: getCategoryColor(task.category)
                        }}>
                          {getCategoryName(task.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="calendar-stats">
            <div className="stat-item stat-pending">
              <div className="stat-number">{tasks.filter(t => t.dueDate && !t.completed).length}</div>
              <div className="stat-label">Pendientes</div>
            </div>
            <div className="stat-item stat-completed">
              <div className="stat-number">{tasks.filter(t => t.completed).length}</div>
              <div className="stat-label">Completadas</div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;