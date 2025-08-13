export default function PromotionSummary({ group, post }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const recruitStartDate = post?.recruitStartDate
    ? formatDate(post.recruitStartDate)
    : "날짜 미정";
  const recruitEndDate = post?.recruitEndDate
    ? formatDate(post.recruitEndDate)
    : "날짜 미정";
  const updatedAt = post?.updatedAt ? formatDate(post.updatedAt) : "날짜 미정";
  const createdAt = post?.createdAt ? formatDate(post.createdAt) : "날짜 미정";

  return (
    <>
      <div className="view-author-info">
        <img
          src={post.profileImage || "/default-profile.png"}
          alt="프로필 이미지"
          className="view-profile-image"
        />
        <span className="view-author">{group.nickName}</span>
        <span className="view-date"> | {createdAt}</span>
      </div>
      <div className="view-meta-info-flex">
        <div className="meta-item">
          <span className="meta-label">카테고리</span>
          <span className="meta-value">{group.category}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">모집인원</span>
          <span className="meta-value">{group.maxMembers}명</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">진행방식</span>
          <span className="meta-value">{group.studyMode}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">지역</span>
          <span className="meta-value">{group.region}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">연락방법</span>
          <span className="meta-value">{group.contact}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">수정일</span>
          <span className="meta-value">{updatedAt}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">모집시작일</span>
          <span className="meta-value">{recruitStartDate}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">모집종료일</span>
          <span className="meta-value">{recruitEndDate}</span>
        </div>
      </div>
    </>
  );
}
