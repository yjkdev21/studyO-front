import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import StudySidebar from '../components/StudySidebar';
import './StudyMain.css';

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

      await fetchPosts(); // 작성한 글 화면에 바로 반영됨

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

//   const handleConfirmEdit = async () => {
//   try {
//     const res = await fetch(`${host}/api/study/board`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-USER-ID': user.id
//       },
//       body: JSON.stringify({
//         id: editingPostId,
//         userId: user.id,
//         groupId: groupId,
//         dashboardPostTitle: editedTitle,
//         dashboardPostText: editedContent
//       })
//     });

//     if (!res.ok) throw new Error('수정 실패');

//     // 상태 직접 업데이트 (fetchPosts 없이)
//     setAllNotices(prev => prev.map(post => 
//       post.id === editingPostId 
//         ? { ...post, dashboardPostTitle: editedTitle, dashboardPostText: editedContent }
//         : post
//     ));
    
//     setAllPosts(prev => prev.map(post => 
//       post.id === editingPostId 
//         ? { ...post, dashboardPostTitle: editedTitle, dashboardPostText: editedContent }
//         : post
//     ));

//     // 편집 상태 해제
//     handleCancelEdit();
    
//   } catch (error) {
//     console.error('수정 오류', error);
//   }
// };

  const handleConfirmEdit = async () => {
  try {
    // 현재 수정 중인 게시글 찾기
    const currentPost = [...allNotices, ...allPosts].find(post => post.id === editingPostId);

    await axios.put(`${host}/api/study/board`, {
      id: editingPostId,
      userId: user.id,
      groupId: groupId,
      dashboardPostTitle: editedTitle,
      dashboardPostText: editedContent,
      isNotice: currentPost.isNotice // 원래 isNotice 값 유지
    }, {
      headers: {
        'X-USER-ID': user.id
      }
    });

    // 상태 직접 업데이트
    setAllNotices(prev => prev.map(post =>
      post.id === editingPostId
      ? { ...post, dashboardPostTitle: editedTitle, dashboardPostText: editedContent }
      : post
    ));

    setAllPosts(prev => prev.map(post =>
      post.id === editingPostId
      ? { ...post, dashboardPostTitle: editedTitle, dashboardPostText: editedContent }
      : post
    ));

    // 편집 상태 해제 - handleCancelEdit() 호출
    handleCancelEdit(); // ← 이게 맞습니다!
    
  } catch (error) {
    console.log('수정 오류', error)
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

      await fetchPosts();
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
            {allNotices[0] ? (
              <>
                <span className='badge'>공지</span>
                <span className='title-ellipsis'>{allNotices[0].dashboardPostTitle}</span>
                <span className='date'>{allNotices[0].createdAt?.slice(0, 10)}</span>
              </>
            ) : (
              <span className='no-content'>등록된 공지가 없습니다.</span>
            )}
          </div>

          {/* 일반글 */}
          <ul className='latest-posts'>
            {allPosts.length > 0 ? (
              allPosts.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <span className='title-ellipsis'>{post.dashboardPostTitle}</span>
                  <span className='date'>{post.createdAt?.slice(0, 10)}</span>
                </li>
              ))
            ) : (
              <li>
                <span className='no-content'>작성된 글이 없습니다.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* 주간 캘린더 자리 */}
      <div className='week-calendar'>
        <h1>주간 캘린더 자리임</h1>
      </div>

      {/* 글 작성 영역 */}
      <section className='post-form'>
        <form onSubmit={handlePostSubmit}>
          <div className='form-row'>
            <label>제목</label>
            <input
              type='text'
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder='제목을 입력하세요'
            />
          </div>

          <div className='form-row'>
            <label>내용</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder='내용을 입력하세요'
            />
          </div>

          <div className='form-row'>
            <div></div> {/* 빈 공간 */}
            <div className='form-bottom'>
              {studyInfo && user?.id === studyInfo.groupOwnerId && (
                <label className='checkbox-label'>
                  <input
                    type='checkbox'
                    checked={isNotice}
                    onChange={(e) => setIsNotice(e.target.checked)}
                  />
                  공지
                </label>
              )}
              <button type='submit'>등록</button>
            </div>
          </div>

          {message && <p className='submit-message'>{message}</p>}
        </form>
      </section>

      {/* 전체 게시글 목록(공지 + 일반글) */}
      <ul className='all-post-list'>
        {/* 공지글 먼저 출력 */}
        {allNotices.map((post) => (
          <li key={post.id} className='post-item notice'>
            <div className='post-layout'>
              {/* 왼쪽: 프로필 이미지 + 닉네임 */}
              <div className='post-left'>
                <img
                  src={post.writerProfileImage ||
                    (post.userId === user?.id ? user.profileImage : null) ||
                    '/images/default-profile.png'}
                  alt='프로필'
                  className='profile-img'
                />
                <div className='nickname'>
                  {post.writerNickname || (post.userId === user?.id ? user.nickname : '작성자')}
                </div>
              </div>

              {/* 오른쪽: 글 제목 + 내용 + 하단(날짜, 수정삭제) */}
              <div className='post-right'>
                <div className='post-content-area'>
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
                      <div className='post-title'>
                        <span className='badge'>공지</span>
                        {post.dashboardPostTitle}
                      </div>
                      <p className='post-content'>{post.dashboardPostText}</p>
                    </>
                  )}
                </div>

                {/* 하단: 날짜 + 수정삭제 버튼 */}
                <div className='post-bottom'>
                  
                  {(user?.id === post.writerId || user?.id === post.userId) && (
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
                  <span className='post-date'>{post.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          </li>
        ))}

        {/* 일반글은 그대로 */}
        {allPosts.map((post) => (
          <li key={post.id} className='post-item'>
            <div className='post-layout'>
              <div className='post-left'>
                <img
                  src={post.writerProfileImage ||
                    (post.userId === user?.id ? user.profileImage : null) ||
                    '/images/default-profile.png'}
                  alt='프로필'
                  className='profile-img'
                />
                <div className='nickname'>
                  {post.writerNickname || post.studyNickname || (post.userId === user?.id ? user.nickname : '작성자')}
                </div>
              </div>

              <div className='post-right'>
                <div className='post-content-area'>
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

                <div className='post-bottom'>
                  
                  {(user?.id === post.writerId || user?.id === post.userId) && (
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
                  <span className='post-date'>{post.createdAt?.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}