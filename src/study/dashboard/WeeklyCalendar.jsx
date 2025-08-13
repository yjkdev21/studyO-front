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

  // 상태 관리
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); // 클릭한 일정 정보
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Context 및 권환 관리 (월간 캘린더와 동일)
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const userId = user?.id; // 사용자 ID (api 호출 시 사용)
  const { studyInfo } = useStudy(); // 스터디 정보(studyContext에서 가져옴)
  const [host, setHost] = useState(import.meta.env.VITE_AWS_API_HOST); // API 서버 주소

  /* 스터디장 여부 확인
    현재 로그인한 사용자가 스터디 그룹의 소뉴자인지 판단
    스터디장만 일정 등록 수정 삭제 가눙 
   */
  const isHost = useMemo(() => {
    return !!(user?.id && studyInfo?.groupOwnerId && user.id === studyInfo.groupOwnerId);
  }, [user?.id, studyInfo?.groupOwnerId]);

  // 데이터 조회(월간 캘린더와 동일한 API 사용)

  // 캘린더 이벤트 데이터 가져오기
  const fetchCalendarEvents = async () => {
    try {
      setIsLoading(true);
      // 월간 캘린더와 동일한 API 엔드포인트 사용
      const response = await axios.get(`${host}/api/study/calendar/study/${groupId}`);

      // 백엔드 데이터를 FullCalendar 형식으로 변환
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,                              // 일정 제목
        start: event.startDate,
        end: event.endDate,
        allDay: true, // 종일 일정으로 설정
        backgroundColor: event.bgColor || '#FDB515',
        textColor: event.textColor || '#666666',
        extendedProps: { // 추가 데이터 (모달에서 사용)
          content: event.content
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('캘린더 데이터 로딩 실패:', error);
      setEvents([]); // 실패 시 빈 배열로 초기화
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 일정 데이터 로드
  useEffect(() => {
    if (groupId) {
      fetchCalendarEvents();
    }
  }, [groupId]);

  // 일정 등록 (스터디장만 가능)
  const handleSelect = async (info) => {
    // 권한 체크: 스터디장이 아니면 함수 종료
    if (!isHost) return;

    // 사용자 입력받기 (간단한 prompt 사용)
    let title = prompt("제목을 입력하세요 (필수):");
    if (!title) return;  // 제목이 없으면 취소
    const content = prompt("내용을 입력하세요 (선택):");

    // 백엔드로 전송할 데이터 구성 (월간 캘린더와 동일한 형식)
    const newEvent = {
      groupId,                    // 스터디 그룹 ID
      title,                      // 일정 제목
      content,                    // 일정 내용 (선택사항)
      startDate: info.startStr,   // 시작 날짜
      endDate: info.endStr,       // 종료 날짜
      bgColor: "#FDB515",         // 월간 캘린더와 동일한 기본 배경색
      textColor: "#666666",       // 월간 캘린더와 동일한 기본 텍스트 색상
    };

    try {
      // API 호출: 일정 등록
      const res = await axios.post(`${host}/api/study/calendar`, newEvent, {
        headers: {
          'X-USER-ID': userId  // 백엔드에서 작성자 확인용
        }
      });
      const saved = res.data;  // 백엔드에서 저장된 일정 정보 반환

      // 화면에 바로 반영 (페이지 새로고침 없이 즉시 표시)
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
      // API 호출: 일정 수정
      await axios.put(`${host}/api/study/calendar`, {
        id: selectedEvent.id,
        title: newTitle,
        content: newContent,
        groupId: groupId,
      }, {
        headers: {
          'X-USER-ID': userId
        }
      });

      // 화면에서 즉시 업데이트 (FullCalendar 객체 직접 수정)
      selectedEvent.setProp('title', newTitle);
      selectedEvent.setExtendedProp('content', newContent);

      alert('수정 완료');
      setShowModal(false);  // 모달 닫기
    } catch (err) {
      console.error(err);
      alert('수정 실패');
    }
  };

  // 일정 삭제(스터디 장만)
  const handleDelete = async () => {
    // 삭제 확인
    if (!window.confirm('삭제하시겠습니까?')) return;

    try {
      // API 호출: 일정 삭제
      await axios.delete(`${host}/api/study/calendar/${selectedEvent.id}`, {
        headers: {
          'X-USER-ID': userId  // 권한 확인용
        }
      });

      // 화면에서 즉시 제거
      selectedEvent.remove();

      alert('삭제 완료');
      setShowModal(false);  // 모달 닫기
    } catch {
      alert('삭제 실패');
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
        <h3>이번 주 일정</h3>
      </div>

      {/* FullCalendar 컴포넌트 */}
      <FullCalendar
        // 필수 플러그인
        plugins={[dayGridPlugin, interactionPlugin]}

        // 주간 보기로 설정 (월간 캘린더와의 차이점)
        initialView="dayGridWeek"

        // 헤더 설정 (간단하게 구성)
        headerToolbar={{
          left: 'prev,next',     // 이전/다음 버튼
          center: 'title',       // 현재 주 표시
          right: ''              // 보기 변경 버튼 없음 (주간 고정)
        }}

        // 한국어 설정
        locale="ko"

        // 높이 설정 (StudyMain에 적합한 컴팩트 사이즈)
        height="200px"

        // 권한별 설정
        selectable={isHost}        // 스터디장만 날짜 선택 가능
        select={handleSelect}      // 날짜 선택시 일정 등록 함수 실행

        // 일정 데이터
        events={events}

        // 일정 클릭 처리 (모든 사용자 가능)
        eventClick={handleEventClick}

        // 기타 설정
        weekends={true}            // 주말 표시
        dayMaxEvents={3}           // 하루 최대 3개 일정 표시 (초과시 +more)
        moreLinkClick="popover"    // +more 클릭시 팝오버로 표시

        // 요일 헤더 형식 (예: 월 8/13)
        dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
      />

      {/* ================================================================ */}
      {/* 11. 일정 상세보기/수정 모달 (월간 캘린더와 동일한 구조)           */}
      {/* ================================================================ */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            {/* 제목 입력 섹션 */}
            <div className="modal-section">
              <div className="modal-label">제목</div>
              <input
                type='text'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='제목을 입력하세요'
                className="modal-input"
                readOnly={!isHost}  // 스터디장만 수정 가능
              />
            </div>

            {/* 내용 입력 섹션 */}
            <div className="modal-section">
              <div className="modal-label">내용</div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder='내용을 입력하세요'
                rows="3"
                className="modal-textarea"
                readOnly={!isHost}  // 스터디장만 수정 가능
              />
            </div>

            {/* 버튼 섹션 */}
            <div className="modal-buttons">
              {/* 스터디장만 수정/삭제 버튼 표시 */}
              {isHost && (
                <div className="action-buttons">
                  <button onClick={handleUpdate} className="update-button">수정</button>
                  <button onClick={handleDelete} className="delete-button">삭제</button>
                </div>
              )}
              {/* 모든 사용자에게 닫기 버튼 표시 */}
              <button onClick={() => setShowModal(false)} className="close-button">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}