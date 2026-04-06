import { GoogleLoginButton } from '../auth/GoogleLoginButton';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8 px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold text-indigo-600 mb-3">me-feels</h1>
        <p className="text-lg text-slate-500">
          Express, retain, manage and understand your emotions — with a little help from AI.
        </p>
      </div>
      <GoogleLoginButton />
    </div>
  );
}
