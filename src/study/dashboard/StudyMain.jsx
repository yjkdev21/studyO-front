import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './StudyMain.css';
import { useAuth } from '../../contexts/AuthContext';

export default function StudyMain() {
  const { groupId } = useParams(); // URL 파라미터로부터 studyId 추출

  const { user } = useAuth(); // 현재 로그인한 유저가
  
  const [studyInfo, setStudyInfo] = useState(null); // 스터디 정보
  const [isNotice, setIsNotice] = useState(false);
  
  const [allNotices, setAllNotices] = useState([]); // 전체 공지
  const [allPosts, setAllPosts] = useState([]); // 전체 글 목록
  
  const [weekCalendar, setWeekCalendar] = useState(); // 주간 캘린더
  
  // 글 작성 입력값 상태
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  
  // 글 작성 완료 메시지
  const [message, setMessage] = useState('');
  
  // 대시 보드 상단 (공지 1개, 일반글 3개)
  const topNotice = allNotices[0] || null;
  const topAllPosts = allPosts.slice(0, 3);
  
  // const isAdmin = user?.id === studyInfo?.groupOwnerId; // 스터디장인지 확인
  
  useEffect(() => {
    const notices = [
      { id: 1, title: '📢 공지사항입니다.', createdAt: '2025-08-05' },
      { id: 2, title: '스터디 규칙을 확인해주세요.', createdAt: '2025-08-04' },
    ];

    // 예시용 더미 일반글 데이터
    const posts = [
      { id: 1, title: '첫 글입니다', createdAt: '2025-08-05' },
      { id: 2, title: '두 번째 글', createdAt: '2025-08-04' },
      { id: 3, title: '세 번째 글', createdAt: '2025-08-03' },
      { id: 4, title: '네 번째 글', createdAt: '2025-08-02' },
    ];

    // 상태에 저장
    setAllNotices(notices);
    setAllPosts(posts);
  }, []);


  const handlePostSubmit = (e) => {
    e.preventDefault();
    // 실제로는 서버에 post 요청 보내야 함
    setMessage('작성 완료');
    setPostTitle('');
    setPostContent('');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className='study-main-container'>
      {/* 스터디 정보 + 공지 + 최신글 */}
      <div className='dashboard-top'>
        {/* 스터디 정보 */}
        <div className='study-info-box'>
          {studyInfo ? (
            <>
              {/* <p>{studyInfo.thumbnail}</p> */}
              <p>카테고리: {studyInfo.category}</p>
              <p>인원: {studyInfo.maxMember}</p>
              <p>진행방식: {studyInfo.studyMode}</p>
              <p>지역: {studyInfo.region}</p>
              <p>연락방법: {studyInfo.contact}</p>
            </>
          ) : (
            <p>로딩 중...</p>
          )}
        </div>
        {/* 최신 공지 1 + 일반글 3 */}
        <div className='dashboard-latest'>
          {/* 공지 */}
          <div className='latest-notice'>
            <span className='badge'>공지</span>
            <strong>{topNotice?.title}</strong>
            <span className='date'>{topNotice?.createdAt}</span>
          </div>
          {/* 일반글 */}
          <ul className='latest-posts'>
            {topAllPosts.map((post) => (
              <li key={post.id}>
                <span>{post.title}</span>
                <span className='date'>{post.createdAt}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* 주간 캘린더 자리 */}
        <div className='week-calendar'>

        </div>
        {/* 글 작성 영역 */}
        <section className='post-form'>
          <form onSubmit={handlePostSubmit}>
            <label>제목</label>
            <input
              type='text'
              placeholder='제목을 입력하세요'
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <label>내용</label>
            <textarea
              placeholder='내용을 입력하세요'
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            { studyInfo && user?.id === studyInfo.groupOwnerId && (
              <label>
                <input
                  type='checkbox'
                  checked={isNotice}
                  onChange={(e) => setIsNotice(e.target.checked)}
                />
                공지
              </label>
            )

            }
            <button type='submit'>작성</button>
            {message && <p className='submit-message'>{message}</p>}
          </form>
        </section>
        {/* 전체 게시글 목록(공지 + 일반글) */}
        <section className='all-post-list'>
          <ul className='notice-list'>
            {allNotices.map((notice) => (
              <li key={notice.id}>
                <span className='badge'>공지</span>
                <span>{notice.title}</span>
                <span className='date'>{notice.createdAt}</span>
              </li>
            ))}
          </ul>
          <ul className='post-list'>
            {allPosts.map((post) => (
              <li key={post.id}>
                <span>{post.title}</span>
                <span className='date'>{post.createdAt}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}