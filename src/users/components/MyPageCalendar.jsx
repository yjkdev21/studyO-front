import React, { useState } from 'react';
import './MyPageCalendar.css';

const MyPageCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventDates = [
    new Date(2025, 7, 23),
    new Date(2025, 7, 25),
    new Date(2025, 7, 28),
  ];

  const hasEvent = (date) => {
    return eventDates.some(eventDate => 
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    );
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay();
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
  };

  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const isToday = today.getFullYear() === date.getFullYear() && 
                     today.getMonth() === date.getMonth() && 
                     today.getDate() === date.getDate();
      
      days.push({
        date: date.getDate(),
        fullDate: new Date(date),
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: isToday,
        hasEvent: hasEvent(date)
      });
    }
    
    return days;
  };

  const calendarDays = generateWeekDays();
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentWeek = getWeekOfMonth(currentDate);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="nav-button" onClick={goToPreviousWeek}>
          <span className="arrow">‹</span>
        </button>
        
        <div className="date-info">
          <span className="year">{currentYear}년 {currentMonth}월</span>
        </div>
        
        <button className="nav-button" onClick={goToNextWeek}>
          <span className="arrow">›</span>
        </button>
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => (
          <div key={index} className="day-column">
            <div className={`day-name ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}>
              {dayNames[index]}
            </div>
            <div className={`date-cell ${day.hasEvent ? 'has-event' : 'no-event'} ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}>
              {day.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPageCalendar;
