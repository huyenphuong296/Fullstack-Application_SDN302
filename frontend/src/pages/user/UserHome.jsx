import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UserHome() {
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="p-4 bg-body-tertiary rounded">
      <h2 className="h4">Hello {user?.username}!</h2>
      <p>Pick a quiz, answer the questions one by one and see your score at the end.</p>
      <Link to="/dashboard/quiz" className="btn btn-primary">Take a quiz</Link>
    </div>
  );
}
