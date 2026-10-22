import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes, addQuiz, updateQuiz, deleteQuiz } from '../../features/quizzes/quizSlice';
import { fetchQuestions } from '../../features/questions/questionSlice';

const emptyForm = { title: '', description: '', questions: [] };

export default function ManageQuizzes() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.quizzes);
  const questions = useSelector((state) => state.questions.items);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchQuestions());
  }, [dispatch]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const toggleQuestion = (id) => {
    const selected = form.questions.includes(id)
      ? form.questions.filter((q) => q !== id)
      : [...form.questions, id];
    setForm({ ...form, questions: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required'); return; }

    const payload = { title: form.title.trim(), description: form.description.trim(), questions: form.questions };
    setSaving(true);
    const result = editingId
      ? await dispatch(updateQuiz({ id: editingId, ...payload }))
      : await dispatch(addQuiz(payload));
    setSaving(false);

    if (result.error) setFormError(result.payload);
    else resetForm();
  };

  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      questions: quiz.questions.map((q) => q._id)
    });
    setEditingId(quiz._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Delete quiz "${quiz.title}"? Its questions stay in the question bank.`)) return;
    const result = await dispatch(deleteQuiz(quiz._id));
    if (result.error) window.alert(result.payload);
    if (editingId === quiz._id) resetForm();
  };

  return (
    <>
      <h2 className="mb-3">Quizzes</h2>

      <form className="card card-body shadow-sm mb-4" onSubmit={handleSubmit}>
        <h3 className="h6 text-body-secondary mb-3">{editingId ? 'Edit quiz' : 'New quiz'}</h3>
        {formError && <div className="alert alert-danger py-2">{formError}</div>}

        <div className="row mb-3">
          <label htmlFor="title" className="col-sm-3 col-lg-2 col-form-label">Title:</label>
          <div className="col-sm-9 col-lg-10">
            <input id="title" className="form-control" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
        </div>

        <div className="row mb-3">
          <label htmlFor="description" className="col-sm-3 col-lg-2 col-form-label">Description:</label>
          <div className="col-sm-9 col-lg-10">
            <textarea id="description" rows="2" className="form-control" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-3 col-lg-2 col-form-label">Questions:</label>
          <div className="col-sm-9 col-lg-10">
            {questions.length === 0 && <p className="form-text">No questions in the bank yet.</p>}
            <div className="border rounded p-2" style={{ maxHeight: 240, overflowY: 'auto' }}>
              {questions.map((q) => (
                <div className="form-check" key={q._id}>
                  <input className="form-check-input" type="checkbox" id={`pick-${q._id}`}
                    checked={form.questions.includes(q._id)} onChange={() => toggleQuestion(q._id)} />
                  <label className="form-check-label" htmlFor={`pick-${q._id}`}>{q.text}</label>
                </div>
              ))}
            </div>
            <div className="form-text">{form.questions.length} selected</div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Quiz' : 'Add Quiz'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      {status === 'loading' && items.length === 0 && (
        <div className="text-center py-4"><div className="spinner-border text-primary" role="status" /></div>
      )}
      {status === 'failed' && <div className="alert alert-danger">{error}</div>}
      {status === 'succeeded' && items.length === 0 && <div className="alert alert-info">No quizzes yet.</div>}

      <div className="list-group shadow-sm">
        {items.map((quiz) => (
          <div className={`list-group-item p-3${editingId === quiz._id ? ' list-group-item-warning' : ''}`} key={quiz._id}>
            <h3 className="h4 mb-1">{quiz.title}</h3>
            {quiz.description && <p className="text-body-secondary mb-2">{quiz.description}</p>}
            <p className="small mb-2">{quiz.questions.length} questions</p>
            <div className="btn-group">
              <button type="button" className="btn btn-warning" onClick={() => handleEdit(quiz)}>Edit</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(quiz)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
