import { useParams } from "react-router-dom";

export default function Sample() {
  const { id } = useParams();
  return (
    <div>
      <h1>Hello Sample!</h1>
      <h4>3th Project</h4>
      <p>param id = {id}</p>
      <Link to="/sample/1">Go to Sample 1</Link>
    </div>
  );
}
