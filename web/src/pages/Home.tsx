import { GoogleLoginButton } from '../auth/GoogleLoginButton';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      padding: '1rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, color: '#5c6bc0' }}>me-feels</h1>
        <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '480px', marginTop: '0.5rem' }}>
          Express, retain, manage and understand your emotions — with a little help from AI.
        </p>
      </div>
      <GoogleLoginButton />
    </main>
  );
}
