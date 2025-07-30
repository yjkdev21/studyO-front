import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function StudyCalendar() {
  const [events, setEvents] = useState([]);

 const handleSelect = (info) => {
  let title = null;

  // 제목이 입력될 때까지 무한반복
  while (true) {
    title = prompt("제목을 입력하세요 (필수):");

    // 취소 누르면 완전 취소 됨
    if (title === null) return;

    // 빈칸이면 다시 반복 (alert 후)
    if (title.trim() === "") {
      alert("제목은 필수입니다.");
      continue;
    }

    break; // 제목 정상 입력 시 while 루프 탈출
  }

  const content = prompt("내용을 입력하세요 (선택):");
  if (content === null) return; // 내용도 취소 가능

  const newEvent = {
    title: title.trim(),
    start: info.startStr,
    end: info.endStr,
    allDay: true,
    extendedProps: {
      content: content || "",
    },
  };

  setEvents((prevEvents) => [...prevEvents, newEvent]);
};

  const handleEventClick = (clickInfo) => {
    const { title, extendedProps } = clickInfo.event;
    alert(`${title}\n\n${extendedProps.content || '내용 없음'}`);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleSelect}
        selectMirror={true}
        events={events}
        eventClick={handleEventClick}
      />
    </div>
  );
}
