import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../../features/questions/questionSlice';
import { fetchQuizzes } from '../../features/quizzes/quizSlice';

export default function AdminHome() {
  const dispatch = useDispatch();
  const questions = useSelector((state) => state.questions.items);
  const quizzes = useSelector((state) => state.quizzes.items);

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  return (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h2 className="h5">Questions</h2>
            <p className="display-6">{questions.length}</p>
            <Link to="/admin/questions" className="btn btn-primary">Manage Questions</Link>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h2 className="h5">Quizzes</h2>
            <p className="display-6">{quizzes.length}</p>
            <Link to="/admin/quizzes" className="btn btn-primary">Manage Quizzes</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
