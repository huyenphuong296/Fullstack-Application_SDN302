import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestions, addQuestion, updateQuestion, deleteQuestion
} from '../../features/questions/questionSlice';
import { fetchQuizzes } from '../../features/quizzes/quizSlice';

const emptyForm = { text: '', options: ['', '', '', ''], correctAnswerIndex: 0, quizId: '' };

export default function ManageQuestions() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.questions);
  const quizzes = useSelector((state) => state.quizzes.items);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const setOption = (i, value) => {
    const options = [...form.options];
    options[i] = value;
    setForm({ ...form, options });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const validate = () => {
    if (!form.text.trim()) return 'Question text is required';
    const filled = form.options.filter((o) => o.trim());
    if (filled.length < 2) return 'Enter at least 2 options';
    if (form.options.slice(0, filled.length).some((o) => !o.trim())) return 'Fill the options from the top, without gaps';
    const idx = Number(form.correctAnswerIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= filled.length) {
      return `Correct answer index must be between 0 and ${filled.length - 1}`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setFormError(problem); return; }

    const payload = {
      text: form.text.trim(),
      options: form.options.map((o) => o.trim()).filter(Boolean),
      correctAnswerIndex: Number(form.correctAnswerIndex)
    };
    setSaving(true);
    const result = editingId
      ? await dispatch(updateQuestion({ id: editingId, ...payload }))
      : await dispatch(addQuestion({ ...payload, quizId: form.quizId || undefined }));
    setSaving(false);

    if (result.error) {
      setFormError(result.payload);
    } else {
      if (!editingId && form.quizId) dispatch(fetchQuizzes());
      resetForm();
    }
  };

  const handleEdit = (q) => {
    const options = [...q.options, '', '', '', ''].slice(0, Math.max(4, q.options.length));
    setForm({ text: q.text, options, correctAnswerIndex: q.correctAnswerIndex, quizId: '' });
    setEditingId(q._id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (q) => {
    if (!window.confirm(`Delete "${q.text}"? It will also be removed from every quiz.`)) return;
    const result = await dispatch(deleteQuestion(q._id));
    if (result.error) window.alert(result.payload);
    if (editingId === q._id) resetForm();
  };

  return (
    <>
      <h2 className="mb-3">Questions</h2>

      <form className="card card-body shadow-sm mb-4" onSubmit={handleSubmit}>
        <h3 className="h6 text-body-secondary mb-3">{editingId ? 'Edit question' : 'New question'}</h3>
        {formError && <div className="alert alert-danger py-2">{formError}</div>}

        <div className="row mb-3">
          <label htmlFor="text" className="col-sm-3 col-lg-2 col-form-label">Question Text:</label>
          <div className="col-sm-9 col-lg-10">
            <input id="text" className="form-control" value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
        </div>

        <div className="row mb-3">
          <label className="col-sm-3 col-lg-2 col-form-label">Options:</label>
          <div className="col-sm-9 col-lg-10">
            {form.options.map((option, i) => (
              <div className="input-group mb-2" key={i}>
                <span className="input-group-text">{i}</span>
                <input className="form-control" value={option} aria-label={`Option ${i}`}
                  onChange={(e) => setOption(i, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="row mb-3">
          <label htmlFor="correct" className="col-sm-3 col-lg-2 col-form-label">Correct Answer Index:</label>
          <div className="col-sm-9 col-lg-10">
            <input id="correct" type="number" min="0" max={form.options.length - 1} className="form-control"
              value={form.correctAnswerIndex}
              onChange={(e) => setForm({ ...form, correctAnswerIndex: e.target.value })} />
          </div>
        </div>

        {!editingId && (
          <div className="row mb-3">
            <label htmlFor="quiz" className="col-sm-3 col-lg-2 col-form-label">Add to Quiz:</label>
            <div className="col-sm-9 col-lg-10">
              <select id="quiz" className="form-select" value={form.quizId}
                onChange={(e) => setForm({ ...form, quizId: e.target.value })}>
                <option value="">— None (question bank only) —</option>
                {quizzes.map((quiz) => <option key={quiz._id} value={quiz._id}>{quiz.title}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary flex-grow-1" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Question' : 'Add Question'}
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
      {status === 'succeeded' && items.length === 0 && <div className="alert alert-info">No questions yet.</div>}

      <div className="list-group shadow-sm">
        {items.map((q) => (
          <div className={`list-group-item p-3${editingId === q._id ? ' list-group-item-warning' : ''}`} key={q._id}>
            <h3 className="h4">{q.text}</h3>
            <ul>
              {q.options.map((option, i) => (
                <li key={i} className={i === q.correctAnswerIndex ? 'fw-semibold text-success' : ''}>
                  {option}{i === q.correctAnswerIndex && ' ✓'}
                </li>
              ))}
            </ul>
            <div className="btn-group">
              <button type="button" className="btn btn-warning" onClick={() => handleEdit(q)}>Edit</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(q)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
