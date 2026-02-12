import { useParams, useNavigate } from "react-router-dom";

export default function Timetable() {
  const { classId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>
      <h2>Timetable Planner</h2>
      <p>Class ID: {classId}</p>
    </div>
  );
}
