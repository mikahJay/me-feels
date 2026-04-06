export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">About me-feels</h1>
      <p className="text-slate-600 text-lg mb-4">
        me-feels is a personal emotion journal with AI-powered insights. Log how you're feeling,
        track patterns over time, and get thoughtful reflections powered by Claude.
      </p>
      <h2 className="text-xl font-semibold text-slate-700 mt-8 mb-2">How it works</h2>
      <ol className="list-decimal list-inside space-y-2 text-slate-600">
        <li>Sign in with your Google account</li>
        <li>Log an emotion with an intensity rating and optional notes</li>
        <li>Get an AI-generated summary of triggers and recommendations</li>
        <li>Review your recent entries to spot patterns</li>
      </ol>
      <h2 className="text-xl font-semibold text-slate-700 mt-8 mb-2">Stack</h2>
      <ul className="list-disc list-inside space-y-1 text-slate-600">
        <li>React 18 + TypeScript frontend</li>
        <li>Node.js + Express backend</li>
        <li>PostgreSQL for storage</li>
        <li>Anthropic Claude for AI insights</li>
      </ul>
    </div>
  );
}
