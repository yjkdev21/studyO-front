import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './StudyMain.css';
import { useAuth } from '../../contexts/AuthContext';

export default function StudyMain() {
  const { groupId } = useParams(); // URL 파라미터로부터 studyId 추출
  const { user } = useAuth(); // 현재 로그인한 사용자 정보

  const [studyInfo, setStudyInfo] = useState(null); // 스터디 정보

  const [isNotice, setIsNotice] = useState(false); // 공지 여부 체크박스 상태
  const [allNotices, setAllNotices] = useState([]); // 공지 목록
  const [allPosts, setAllPosts] = useState([]); // 일반 글 목록

  const [weekCalendar, setWeekCalendar] = useState(); // 주간 캘린더

  // 글 작성 입력값 상태
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [message, setMessage] = useState(''); // 글 작성 완료 메시지

  // 수정
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  const host = import.meta.env.VITE_AWS_API_HOST;

  // 대시 보드 상단 (공지 1개, 일반글 3개)
  // const topNotice = allNotices[0] || null;
  // const topAllPosts = allPosts.slice(0, 3);

  // const isAdmin = user?.id === studyInfo?.groupOwnerId; // 스터디장인지 확인


  // 스터디 정보 가져오기
  // useEffect(() => {
  //   const host = import.meta.env.VITE_AWS_API_HOST;

  //   const fetchStudyInfo = async () => {
  //     try {
  //       const res = await fetch(`${host}/api/study/${groupId}`);
  //       const result = await res.json();
  //       setStudyInfo(result.data);
  //     } catch (error) {
  //       console.log('스터디 정보 가져오기 실패', error);
  //     }
  //   };

  //   fetchStudyInfo();
  // }, [groupId]);

  const fetchStudyInfo = async () => {
    try {
      const res = await fetch(`${host}/api/study/${groupId}`);
      const result = await res.json();
      setStudyInfo(result.data);
    } catch (error) {
      console.log('스터디 정보 가져오기 실패', error);
    }
  };

  // 공지 및 일반글 가져오기
  // useEffect(() => {
  //   const host = import.meta.env.VITE_AWS_API_HOST;

  //   const fetchPosts = async () => {
  //     try {
  //       const [noticeRes, postRes] = await Promise.all([
  //         fetch(`${host}/api/study/board/group/${groupId}/notice`),
  //         fetch(`${host}/api/study/board/group/${groupId}/normal`)
  //       ]);
  //       const notices = await noticeRes.json();
  //       const posts = await postRes.json();

  //       setAllNotices(notices);
  //       setAllPosts(posts);
  //     } catch (error) {
  //       console.error('게시글 불러오기 실패', error);
  //     }
  //   };
  //   fetchPosts();
  // }, [groupId]);

  const fetchPosts = async () => {
    try {
      const [noticeRes, postRes] = await Promise.all([
        fetch(`${host}/api/study/board/group/${groupId}/notice`),
        fetch(`${host}/api/study/board/group/${groupId}/normal`)
      ]);
      setAllNotices(await noticeRes.json());
      setAllPosts(await postRes.json());
    } catch (error) {
      console.error('게시글 불러오기 실패', error);
    }
  };

  useEffect(() => {
    fetchStudyInfo();
    fetchPosts();
  }, [groupId]);

  // 글 작성 핸들러
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      setMessage('제목과 내용을 입력하세요.');
      return;
    }

    try {
      const res = await fetch(`${host}/api/study/board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': user.id // 사용자 ID 헤더로 전달
        },
        body: JSON.stringify({
          userId: user.id,
          groupId: groupId,
          dashboardPostTitle: postTitle,
          dashboardPostText: postContent,
          isNotice: isNotice ? 'Y' : 'N'
        })
      });

      if (!res.ok) throw new Error('등록 실패');

      setMessage('작성 완료');
      setPostTitle('');
      setPostContent('');
      setIsNotice(false);
    } catch (error) {
      console.error('글 작성 실패', error);
      setMessage('작성 실패');
    }

    setTimeout(() => setMessage(''), 2000);
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditedTitle(post.dashboardPostTitle);
    setEditedContent(post.dashboardPostText);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedTitle('');
    setEditedContent('');
  };

  const handleConfirmEdit = async () => {
    try {
      const res = await fetch(`${host}/api/study/board`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': user.id
        },
        body: JSON.stringify({
          id: editingPostId,
          userId: user.id,
          groupId: groupId,
          dashboardPostTitle: editedTitle,
          dashboardPostText: editedContent
        })
      });

      if (!res.ok) throw new Error('수정 실패');

      await fetchPosts();
      handleCancelEdit();
    } catch (error) {
      console.error('수정 오류', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('정말 삭제하시겠습니까?'))
      return;

    try {
      const res = await fetch(`${host}/api/study/board/${postId}`, {
        method: 'DELETE',
        headers: {
          'X-USER-ID': user.id
        }
      });
      if (!res.ok) throw new Error('삭제 실패');
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='study-main-container'>
      {/* 스터디 정보 + 공지 + 최신글 */}
      <div className='dashboard-top'>
        {/* 스터디 정보 */}
        <div className='study-info-box'>
          {studyInfo ? (
            <>
              <p>카테고리: {studyInfo.category}</p>
              <p>인원: {studyInfo.maxMembers}</p>
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
            <span>{allNotices[0]?.dashboardPostTitle}</span>
            <span className='date'>{allNotices[0]?.createdAt}</span>
          </div>
          {/* 일반글 */}
          <ul className='latest-posts'>
            {allPosts.slice(0, 3).map((post) => (
              <li key={post.id}>
                <span>{post.dashboardPostTitle}</span>
                <span className='date'>{post.createdAt?.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 주간 캘린더 자리 */}
        <div className='week-calendar'>
          주간 캘린더 자리임
        </div>

        {/* 글 작성 영역 */}
        <section className='post-form'>
          <form onSubmit={handlePostSubmit}>
            <label>제목</label>
            <input
              type='text'
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder='제목을 입력하세요'
            />
            <label>내용</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder='내용을 입력하세요'
            />
            {studyInfo && user?.id === studyInfo.groupOwnerId && (
              <label>
                <input
                  type='checkbox'
                  checked={isNotice}
                  onChange={(e) => setIsNotice(e.target.checked)}
                />
                공지
              </label>
            )}
            <button type='submit'>작성</button>
            {message && <p className='submit-message'>{message}</p>}
          </form>
        </section>

        {/* 전체 게시글 목록(공지 + 일반글) */}
        <section className='all-post-list'>
          {allPosts.map((post) => (
            <li key={post.id} className='post-item'>
              <div className='post-header'>
                <img
                  src={post.writerProfileImage || '/default-profile.png'}
                  alt='프로필'
                  className='profile-img'
                />
                <div className='post-meta'>
                  <span className='nickname'>{post.writerNickname}</span>
                  <span className='date'>{post.createdAt?.slice(0, 10)}</span>
                </div>
                {user?.id === post.writerId && (
                  <div className='post-actions'>
                    {editingPostId === post.id ? (
                      <>
                        <button onClick={handleConfirmEdit}>확인</button>
                        <button onClick={handleCancelEdit}>취소</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEdit(post)}>수정</button>
                        <button onClick={() => handleDelete(post.id)}>삭제</button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className='post-body'>
                {editingPostId === post.id ? (
                  <>
                    <input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <strong className='post-title'>{post.dashboardPostTitle}</strong>
                    <p className='post-content'>{post.dashboardPostText}</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </section>
      </div>
    </div>
  );
}