import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../../features/quizzes/quizSlice';

export default function QuizList() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.quizzes);

  useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);

  if (status === 'loading' && items.length === 0) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>;
  }
  if (status === 'failed') return <div className="alert alert-danger">{error}</div>;

  const playable = items.filter((q) => q.questions.length > 0);
  if (status === 'succeeded' && playable.length === 0) {
    return <div className="alert alert-info">No quizzes are available yet.</div>;
  }

  return (
    <>
      <h2 className="text-center mb-4">Quiz</h2>
      <div className="row g-3">
        {playable.map((quiz) => (
          <div className="col-12 col-md-6 col-lg-4" key={quiz._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h3 className="h5 card-title">{quiz.title}</h3>
                {quiz.description && <p className="card-text text-body-secondary">{quiz.description}</p>}
                <p className="small mb-3">{quiz.questions.length} questions</p>
                <Link to={`/dashboard/quiz/${quiz._id}`} className="btn btn-primary mt-auto">Start quiz</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
