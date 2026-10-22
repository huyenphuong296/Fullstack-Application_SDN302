// Shown in the menu of the sample screenshots; not part of the assignment requirements
export default function Article({ admin = false }) {
  return (
    <div className="text-center text-body-secondary py-5">
      <h2 className="h4">{admin ? 'Manage Articles' : 'Articles'}</h2>
      <p className="mb-0">Coming soon.</p>
    </div>
  );
}
