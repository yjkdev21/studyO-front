import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudyCalendar.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


export default function StudyCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST);
  console.log("API Host:", host); // 디버깅을 위해 호스트 값 출력

  // 임시로 지정(기능 구현 전까지)
  const studyId = 1;
  const writerId = 1;

  // 일정 목록 조회
  useEffect(() => {
    axios.get(`${host}/api/study/calendar/study/${studyId}`).then((res) => {
      console.log("백엔드 응답:", res.data);

      // 받은 일정 데이터를 FullCalendar에 맞게 변환
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
      // 변환된 일정 저장, FullCalendar에 반영
      setEvents(fetched);
    });
  }, []);


  // 일정 등록
  const handleSelect = async (info) => {
    let title = prompt("제목을 입력하세요 (필수):");
    if (!title) return;
    const content = prompt("내용을 입력하세요 (선택):");

    const newEvent = {
      studyId,
      writerId,
      title,
      content,
      startDate: info.startStr,
      endDate: info.endStr,
      bgColor: "#FDB515",
      textColor: "#666666",
    };

    try {
      await axios.post(`${host}/api/study/calendar`, newEvent);
      alert('등록 완료');

      // 화면에 추가
      setEvents((prev) => [
        ...prev,
        {
          ...newEvent,
          id: Date.now(), // 임시 아이디
          allDay: true,
          backgroundColor: newEvent.bgColor,
          textColor: newEvent.textColor,
          extendedProps: { content },
        },
      ]);
    } catch (err) {
      alert('등록 실패');
    }
  };

  // 일정 클릭(모달 열기)
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setNewTitle(clickInfo.event.title);
    setNewContent(clickInfo.event.extendedProps.content || '');
    setShowModal(true);
  };

  // 일정 수정(PUT)
  const handleUpdate = async () => {
    try {
      await axios.put(`${host}/api/study/calendar`, {
        id: selectedEvent.id,
        title: newTitle,
        content: newContent,
      });

      selectedEvent.setProp('title', newTitle);
      selectedEvent.setExtendedProp('content', newContent);
      alert('수정 완료');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('수정 실패');
    }
  };

  // 일정 삭제
  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${host}/api/study/calendar/${selectedEvent.id}`);
      selectedEvent.remove();
      alert('삭제 완료');
      setShowModal(false);
    } catch {
      alert('삭제 실패');
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleSelect}
        // selectMirror={true}
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
              />
            </div>

            {/* 버튼 섹션 */}
            <div className="modal-buttons">
              <div className="action-buttons">
                <button onClick={handleUpdate} className="update-button">수정</button>
                <button onClick={handleDelete} className="delete-button">삭제</button>
              </div>
              <button onClick={() => setShowModal(false)} className="close-button">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

