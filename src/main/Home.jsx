import { Link } from "react-router-dom";
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>study-o project</p>
      <Link to="/sample/5">Go to Sample 5</Link>
    </div>
  );
}
