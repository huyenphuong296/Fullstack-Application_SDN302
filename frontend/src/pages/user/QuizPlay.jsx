import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuizzes, startQuiz, answerQuestion, nextQuestion, submitQuiz
} from '../../features/quizzes/quizSlice';

export default function QuizPlay() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const { items, status, error, play } = useSelector((state) => state.quizzes);
  const quiz = items.find((q) => q._id === quizId);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchQuizzes());
  }, [status, dispatch]);

  // New quiz opened -> reset the progress
  useEffect(() => {
    if (play.quizId !== quizId) dispatch(startQuiz(quizId));
  }, [quizId, play.quizId, dispatch]);

  if (status === 'loading' && !quiz) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>;
  }
  if (status === 'failed') return <div className="alert alert-danger">{error}</div>;
  if (!quiz) {
    return (
      <div className="alert alert-warning">
        Quiz not found. <Link to="/dashboard/quiz">Back to quizzes</Link>
      </div>
    );
  }
  if (play.quizId !== quizId) return null;

  // ----- Finished -----
  if (play.result) {
    const { score, total, results } = play.result;
    return (
      <div className="mx-auto" style={{ maxWidth: 640 }}>
        <div className="text-center mb-4">
          <h2>Quiz Completed</h2>
          <p className="fs-5">Your score: {score} / {total}</p>
          <button type="button" className="btn btn-primary me-2" onClick={() => dispatch(startQuiz(quizId))}>
            Restart Quiz
          </button>
          <Link to="/dashboard/quiz" className="btn btn-outline-secondary">Other quizzes</Link>
        </div>

        <h3 className="h5">Review</h3>
        <ul className="list-group">
          {results.map((r, i) => (
            <li key={r.questionId} className="list-group-item">
              <div className="fw-semibold">
                {r.correct ? '✅' : '❌'} {i + 1}. {r.text}
              </div>
              <div className="small">
                Your answer: {r.selected === null ? '—' : r.options[r.selected]}
                {!r.correct && <> · Correct answer: <strong>{r.options[r.correctAnswerIndex]}</strong></>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ----- One question at a time -----
  const question = quiz.questions[play.current];
  if (!question) return null;
  const selected = play.answers[question._id];
  const isLast = play.current === quiz.questions.length - 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected === undefined) return;
    if (isLast) {
      dispatch(submitQuiz({ quizId, answers: play.answers }));
    } else {
      dispatch(nextQuestion());
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 640 }}>
      <h2 className="text-center mb-1">Quiz</h2>
      <p className="text-center text-body-secondary mb-4">
        {quiz.title} · Question {play.current + 1} of {quiz.questions.length}
      </p>

      <form onSubmit={handleSubmit}>
        <h3 className="mb-3">{question.text}</h3>
        {question.options.map((option, index) => (
          <div className="form-check mb-1" key={index}>
            <input
              className="form-check-input"
              type="radio"
              name={`q-${question._id}`}
              id={`q-${question._id}-${index}`}
              checked={selected === index}
              onChange={() => dispatch(answerQuestion({ questionId: question._id, index }))}
            />
            <label className="form-check-label option-label" htmlFor={`q-${question._id}-${index}`}>
              {option}
            </label>
          </div>
        ))}

        {play.error && <div className="alert alert-danger mt-3">{play.error}</div>}

        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={selected === undefined || play.submitting}
        >
          {play.submitting ? 'Submitting…' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
