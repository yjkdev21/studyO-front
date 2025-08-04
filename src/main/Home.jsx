import { Link } from "react-router-dom";
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>study-o project</p>
      <Link to="/sample/5">Go to Sample 5</Link> <br />
      <br />
      <Link to="/study/promotion/list">Go Promotion List</Link>
      <br />
      <Link to="/study/dashboard/studyCalender">캘린더</Link>
    </div>
  );
}
