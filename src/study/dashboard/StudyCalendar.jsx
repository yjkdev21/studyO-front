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
  /********** 상태 선언 **********/
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
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
  
  /********** 이벤트 핸들러 **********/
  // 일정 등록
  const handleSelect = async (info) => {
    if (!isHost) return; // 스터디장만 등록 가능

    let title = prompt("제목을 입력하세요 (필수):");
    if (!title) return;
    const content = prompt("내용을 입력하세요 (선택):");

    const newEvent = {
      groupId,
      title,
      content,
      startDate: info.startStr,
      endDate: info.endStr,
      bgColor: "#FDB515",
      textColor: "#666666",
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

      alert('등록 완료');
    } catch (err) {
      console.error("등록 실패:", err);
      alert('등록 실패');
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
      alert('수정 완료');
      setShowModal(false);
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 실패');
    }
  };

  // 일정 삭제
  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${host}/api/study/calendar/${selectedEvent.id}`, {
        headers: { 'X-USER-ID': userId }
      });
      selectedEvent.remove();
      alert('삭제 완료');
      setShowModal(false);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 실패');
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
      {/* 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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

            {/* 버튼 섹션 */}
            <div className="modal-buttons">
              {isHost && (
                <div className="action-buttons">
                  <button onClick={handleUpdate} className="update-button">수정</button>
                  <button onClick={handleDelete} className="delete-button">삭제</button>
                </div>
              )}
              <button onClick={() => setShowModal(false)} className="close-button">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}