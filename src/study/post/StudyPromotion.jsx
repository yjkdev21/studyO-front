import StudyPostView from "./StudyPostView";
import "./Post.css";
import { useParams } from "react-router-dom";

export default function StudyPromotion() {
  const { groupId } = useParams();

  console.log("groupId: ", groupId);

  const handleStudyJoin = () => {
    alert("study Group Id : " + groupId);
  };

  return (
    <div className="promotion-container">
      <h2 className="form-title">
        <span className="form-badge">✔</span>
        스터디 홍보글
      </h2>
      <StudyPostView groupId={groupId} onStudyJoin={handleStudyJoin} />
    </div>
  );
}
