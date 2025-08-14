import React, { useState, useEffect } from 'react';
import './MyPageCalendar.css';

const MyPageCalendar = ({ myStudies, userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 주의 기준 날짜
  const [calendarEvents, setCalendarEvents] = useState([]); // 모든 일정 데이터
  const [selectedDateEvents, setSelectedDateEvents] = useState([]); // 선택한 날짜 일정
  const [showEventDetails, setShowEventDetails] = useState(false); // 일정 상세보기 표시 여부
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 모든 스터디 그룹 일정 불러오기
  const fetchAllCalendarEvents = async () => {
    if (!myStudies || myStudies.length === 0) {
      setCalendarEvents([]);
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = window.REACT_APP_API_URL || 'http://localhost:8081';

      // 병렬로 각 스터디 일정 불러오기
      const promises = myStudies.map(async (study) => {
        try {
          const url = `${apiUrl}/api/study/calendar/study/${study.groupId}`;
          const response = await fetch(url, {
            headers: {
              'X-USER-ID': userId.toString(),
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const events = await response.json();
            return events.map(event => ({
              ...event,
              studyGroupName: study.groupName,
              studyGroupId: study.groupId
            }));
          } else {
            return [];
          }
        } catch {
          return [];
        }
      });

      const results = await Promise.all(promises);
      setCalendarEvents(results.flat());
    } catch {
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // 스터디 변경 시 일정 다시 불러오기
  useEffect(() => {
    fetchAllCalendarEvents();
  }, [myStudies, userId]);

  // 해당 날짜에 일정이 있는지 확인
  const hasEvent = (date) => {
    return calendarEvents.some(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // 해당 날짜의 일정 가져오기
  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // 날짜 클릭 시 일정 상세 표시
  const handleDateClick = (date) => {
    if (hasEvent(date)) {
      setSelectedDateEvents(getEventsForDate(date));
      setShowEventDetails(true);
    } else {
      setShowEventDetails(false);
      setSelectedDateEvents([]);
    }
  };

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
    setShowEventDetails(false);
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    setShowEventDetails(false);
  };

  // 현재 주 날짜 목록 생성
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
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜 표시 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="calendar-container">
      {loading && <div className="loading">일정을 불러오는 중...</div>}
      
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
            <div 
              className={`date-cell ${day.hasEvent ? 'has-event' : 'no-event'} ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => handleDateClick(day.fullDate)}
            >
              {day.date}
            </div>
          </div>
        ))}
      </div>

      {showEventDetails && selectedDateEvents.length > 0 && (
        <div className="event-details">
          <div className="event-details-header">
            <h4>일정 정보</h4>
            <button className="close-button" onClick={() => setShowEventDetails(false)}>×</button>
          </div>
          <div className="event-list">
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-title">{event.title}</div>
                <div className="event-study-group">{event.studyGroupName}</div>
                <div className="event-period">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </div>
                {event.content && (
                  <div className="event-content">{event.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPageCalendar;
