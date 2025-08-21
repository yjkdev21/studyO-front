import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { useAuth } from '../../contexts/AuthContext';
import { useStudy } from '../../contexts/StudyContext';

import './WeeklyCalendar.css';

export default function WeeklyCalendar() {
  // URL 파라미터 및 기본 설정
  const { groupId: groupIdParam } = useParams();
  const groupId = Number(groupIdParam);

  // 기존 상태 관리
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 모달 상태
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Context 및 권한 관리
  const { user } = useAuth();
  const userId = user?.id;
  const { studyInfo } = useStudy();
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);

  const isHost = useMemo(() => {
    return !!(user?.id && studyInfo?.groupOwnerId && user.id === studyInfo.groupOwnerId);
  }, [user?.id, studyInfo?.groupOwnerId]);

  // 알림 모달 헬퍼 함수
  const showAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  // 캘린더 이벤트 데이터 가져오기
  const fetchCalendarEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${host}/api/study/calendar/study/${groupId}`);

      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        allDay: true,
        backgroundColor: event.bgColor || '#FDB515',
        textColor: event.textColor || '#999',
        extendedProps: {
          content: event.content
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('캘린더 데이터 로딩 실패:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchCalendarEvents();
    }
  }, [groupId]);

  // 일정 등록
  const handleSelect = (info) => {
    if (!isHost) return;

    setSelectedDateInfo(info);
    setInputTitle('');
    setInputContent('');
    setShowInputModal(true);
  };

  // 일정 등록 실행
  const handleCreateEvent = async () => {
    if (!inputTitle.trim()) {
      showAlert('제목을 입력해주세요.', 'error');
      return;
    }

    const newEvent = {
      groupId,
      title: inputTitle,
      content: inputContent,
      startDate: selectedDateInfo.startStr,
      endDate: selectedDateInfo.endStr,
      bgColor: "#FDB515",
      textColor: "#999",
    };

    try {
      const res = await axios.post(`${host}/api/study/calendar`, newEvent, {
        headers: { 'X-USER-ID': userId }
      });
      const saved = res.data;

      setEvents((prev) => [
        ...prev,
        {
          id: saved.id,
          title: saved.title,
          start: saved.startDate,
          end: saved.endDate,
          allDay: true,
          backgroundColor: saved.bgColor,
          textColor: saved.textColor,
          extendedProps: { content: saved.content },
        },
      ]);

      setShowInputModal(false);
      showAlert('등록 완료');
    } catch (err) {
      console.error("등록 실패:", err);
      showAlert('등록 실패', 'error');
    }
  };

  // 일정 상세보기
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewTitle(clickInfo.event.title);
    setNewContent(clickInfo.event.extendedProps.content || '');
    setShowModal(true);
  };

  // 일정 수정
  const handleUpdate = async () => {
    try {
      await axios.put(`${host}/api/study/calendar`, {
        id: selectedEvent.id,
        title: newTitle,
        content: newContent,
        groupId: groupId,
      }, {
        headers: { 'X-USER-ID': userId }
      });

      selectedEvent.setProp('title', newTitle);
      selectedEvent.setExtendedProp('content', newContent);

      setShowModal(false);
      showAlert('수정 완료');
    } catch (err) {
      console.error(err);
      showAlert('수정 실패', 'error');
    }
  };

  // 일정 삭제
  const handleDelete = async () => {
    try {
      await axios.delete(`${host}/api/study/calendar/${selectedEvent.id}`, {
        headers: { 'X-USER-ID': userId }
      });

      selectedEvent.remove();
      setShowModal(false);
      showAlert('삭제 완료');
    } catch {
      showAlert('삭제 실패', 'error');
    }
  };

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="weekly-calendar-container">
        <div className="loading">캘린더 로딩 중...</div>
      </div>
    );
  }
  return (
    <div className="weekly-calendar-container">
      {/* 캘린더 헤더 */}
      <div className="calendar-header">
        <h4>이번 주 일정</h4>
      </div>

      {/* FullCalendar 컴포넌트 */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridWeek"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: ''
        }}
        locale="ko"
        height="200px"
        selectable={isHost}
        select={handleSelect}
        events={events}
        eventClick={handleEventClick}
        weekends={true}
        dayMaxEvents={3}
        moreLinkClick="popover"
        dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
      />

      {/* 일정 상세보기 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-x" onClick={() => setShowModal(false)}>×</button>

            <div className="modal-section">
              <div className="modal-label">제목</div>
              <input
                type='text'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='제목을 입력하세요'
                className="modal-input"
                readOnly={!isHost}
              />
            </div>
            <div className="modal-section">
              <div className="modal-label">내용</div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder='내용을 입력하세요'
                rows="3"
                className="modal-textarea"
                readOnly={!isHost}
              />
            </div>

            <div className="modal-buttons">
              {isHost && (
                <div className="action-buttons">
                  <button onClick={handleUpdate} className="update-button">수정</button>
                  <button onClick={handleDelete} className="delete-button">삭제</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 새 일정 입력 모달 */}
      {showInputModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-x" onClick={() => setShowInputModal(false)}>×</button>

            <div className="modal-header">
              <h3 className="modal-title">새 일정 등록</h3>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-label">제목 (필수)</div>
                <input
                  type='text'
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder='제목을 입력하세요'
                  className="modal-input"
                  autoFocus
                />
              </div>

              <div className="modal-section">
                <div className="modal-label">내용 (선택)</div>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder='내용을 입력하세요'
                  rows="3"
                  className="modal-textarea"
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={handleCreateEvent} className="update-button">등록</button>
            </div>
          </div>
        </div>
      )}

      {/* 알림 모달 */}
      {showAlertModal && (
        <div className="modal-overlay">
          <div className="modal-content alert-modal">
            <button className="modal-close-x" onClick={() => setShowAlertModal(false)}>×</button>

            <div className="modal-header">
              <h3 className={`modal-title ${alertType === 'error' ? 'error' : 'success'}`}>
                {alertType === 'error' ? '오류' : '알림'}
              </h3>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <p className="alert-message">{alertMessage}</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={() => setShowAlertModal(false)} className="update-button single-button">
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}