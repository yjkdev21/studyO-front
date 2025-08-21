import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { useAuth } from '../../contexts/AuthContext';
import { useStudy } from '../../contexts/StudyContext';

import './StudyCalendar.css';

export default function StudyCalendar() {
  /********** 기존 상태 선언 **********/
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 일정 등록용 입력 모달
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);

  // 확인 모달
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});

  // 알림 모달
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success', 'error'

  /********** Context & Hooks **********/
  const { user } = useAuth();
  const { groupId: groupIdParam } = useParams();
  const { studyInfo, host } = useStudy();

  const userId = user?.id;
  const groupId = Number(groupIdParam);
  const isHost = useMemo(() => {
    return !!(user?.id && studyInfo?.groupOwnerId && user.id === studyInfo.groupOwnerId);
  }, [user?.id, studyInfo?.groupOwnerId]);

  /********** API & 데이터 로딩 **********/
  useEffect(() => {
    axios.get(`${host}/api/study/calendar/study/${groupId}`).then((res) => {
      const fetched = res.data.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.startDate,
        end: e.endDate,
        allDay: true,
        backgroundColor: e.bgColor,
        textColor: e.textColor,
        extendedProps: {
          content: e.content,
        },
      }));
      setEvents(fetched);
    });
  }, [groupId]);

  /********** 알림 모달 헬퍼 함수 **********/
  const showAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  /********** 이벤트 핸들러 **********/
  // 일정 등록 시작 (날짜 선택)
  const handleSelect = (info) => {
    if (!isHost) return; // 스터디장만 등록 가능

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
      textColor: "#fff",
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
      showAlert('일정이 등록되었습니다.');
    } catch (err) {
      console.error("등록 실패:", err);
      showAlert('등록에 실패했습니다.', 'error');
    }
  };

  // 일정 클릭(모달 열기, 상세보기)
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
      showAlert('수정이 완료되었습니다.');
    } catch (err) {
      console.error('수정 실패:', err);
      showAlert('수정에 실패했습니다.', 'error');
    }
  };

  // 일정 삭제 확인
  const handleDeleteConfirm = () => {
    setConfirmConfig({
      title: '일정 삭제',
      message: '이 일정을 삭제하시겠습니까?',
      confirmText: '삭제',
      onConfirm: handleDelete,
      isDangerous: true
    });
    setShowConfirmModal(true);
  };

  // 일정 삭제 실행
  const handleDelete = async () => {
    try {
      await axios.delete(`${host}/api/study/calendar/${selectedEvent.id}`, {
        headers: { 'X-USER-ID': userId }
      });
      selectedEvent.remove();
      setShowModal(false);
      setShowConfirmModal(false);
      showAlert('삭제가 완료되었습니다.');
    } catch (err) {
      console.error('삭제 실패:', err);
      showAlert('삭제에 실패했습니다.', 'error');
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={isHost}
        select={handleSelect}
        events={events}
        eventClick={handleEventClick}
      />

      {/* 기존 일정 상세보기/수정 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* X 버튼 */}
            <button className="modal-close-x" onClick={() => setShowModal(false)}>
              ×
            </button>

            <div className="modal-body">
              {/* 제목 섹션 */}
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

              {/* 내용 섹션 */}
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
            </div>

            {/* 버튼 섹션 - 호스트인 경우만 액션 버튼 표시 */}
            {isHost && (
              <div className="modal-buttons">
                <div className="action-buttons">
                  <button onClick={handleUpdate} className="update-button">수정</button>
                  <button onClick={handleDeleteConfirm} className="delete-button">삭제</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 새 일정 입력 모달 */}
      {showInputModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* X 버튼 */}
            <button className="modal-close-x" onClick={() => setShowInputModal(false)}>
              ×
            </button>

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

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            {/* X 버튼 */}
            <button className="modal-close-x" onClick={() => setShowConfirmModal(false)}>
              ×
            </button>

            <div className="modal-header">
              <h3 className="modal-title">{confirmConfig.title}</h3>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <p className="confirm-message">{confirmConfig.message}</p>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={confirmConfig.onConfirm}
                className={`confirm-button ${confirmConfig.isDangerous ? 'delete-button' : 'update-button'}`}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 알림 모달 */}
      {showAlertModal && (
        <div className="modal-overlay">
          <div className="modal-content alert-modal">
            {/* X 버튼 */}
            <button className="modal-close-x" onClick={() => setShowAlertModal(false)}>
              ×
            </button>

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
              <button
                onClick={() => setShowAlertModal(false)}
                className="update-button single-button"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}