import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { calendar as calendarIcon, checkmarkCircle } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { Task, Category } from '../types';
import { startOfMonth, daysInMonth, tasksByDate } from './CalendarUtils';
import './Tab2.css';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const Tab2: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const loadedTasks = await StorageService.getTasks();
    const loadedCategories = await StorageService.getCategories();
    setTasks(loadedTasks);
    setCategories(loadedCategories);
  };

  const map = tasksByDate(tasks);
  const monthStart = startOfMonth(cursor);
  const offset = monthStart.getDay();
  const totalDays = daysInMonth(cursor);

  const dayTasks = (d: Date) => map[d.toDateString()] || [];

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const today = new Date();

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
            <div className="calendar-nav">
              <button className="nav-btn" onClick={prevMonth}>&lt;</button>
              <div className="month-label">{cursor.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
              <button className="nav-btn" onClick={nextMonth}>&gt;</button>
            </div>
            <div className="weekday-row">
              {WEEKDAYS.map(w => <div key={w} className="weekday">{w}</div>)}
            </div>

            <div className="calendar-grid">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`pad-${i}`} className="day-cell empty" />
              ))}

              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                const has = dayTasks(d).length > 0;
                const isToday = d.toDateString() === today.toDateString();
                return (
                  <div
                    key={day}
                    className={`day-cell ${has ? 'has-tasks' : ''} ${isToday ? 'today' : ''} ${selectedDate && d.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <div className="day-number">{day}</div>
                    {has && (() => {
                      const tasksForDay = dayTasks(d);
                      const firstCat = tasksForDay.length ? categories.find(c => c.id === tasksForDay[0].category) : undefined;
                      const dotColor = firstCat?.color || '#10b981';
                      return <div className="dot" style={{ backgroundColor: dotColor }} />;
                    })()}
                  </div>
                );
              })}
            </div>

            <div className="day-tasks">
              {selectedDate ? (
                <>
                  <h3>{selectedDate.toDateString()}</h3>
                  {dayTasks(selectedDate).length === 0 ? (
                    <p>No hay tareas para este día.</p>
                  ) : (
                    dayTasks(selectedDate).map(t => (
                      <div key={t.id} className={`task-row ${t.completed ? 'completed' : ''}`}>
                        <div className="task-left">
                          <div className="task-text">{t.text}</div>
                          <div className="task-meta">
                            <span className={`priority-badge ${t.priority}`}>{t.priority}</span>
                          </div>
                        </div>
                        <div className="task-right">
                          {t.completed ? <IonIcon icon={checkmarkCircle} /> : null}
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <div className="calendar-summary">
                  <h3>Hoy</h3>
                  <p>Tareas programadas hoy: {map[new Date().toDateString()]?.length || 0}</p>
                  <h4>Vencidas</h4>
                  <div className="overdue-list">
                    {tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && !t.completed).map(t => (
                      <div key={t.id} className="task-row overdue">
                        <div className="task-text">{t.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;