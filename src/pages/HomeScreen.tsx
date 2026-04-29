import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const releases = useAppStore((s) => s.releases);
  const createRelease = useAppStore((s) => s.createRelease);
  const navigate = useNavigate();

  function handleCreate() {
    createRelease({ name: 'New Release' });
    const id = useAppStore.getState().activeReleaseId;
    if (id) navigate(`/release/${id}`);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        PrioritizeHQ
      </h1>
      <button
        onClick={handleCreate}
        style={{
          padding: '0.5rem 1rem',
          background: 'var(--accent-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}
      >
        + New Release
      </button>
      {releases.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No releases yet. Create one to get started.</p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {releases.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => navigate(`/release/${r.id}`)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {r.features.length} features · {r.status}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
