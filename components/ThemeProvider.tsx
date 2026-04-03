@import "tailwindcss";

:root {
  --bg-primary: #090d1a;
  --bg-secondary: #0f1628;
  --bg-card: #0a0f1e;
  --border-color: rgba(79,142,247,0.15);
  --border-card: rgba(79,142,247,0.12);
  --text-primary: #e8edf8;
  --text-secondary: #6b7fa3;
  --accent: #4f8ef7;
  --accent-2: #00d4ff;
  --accent-glow: rgba(79,142,247,0.12);
  --nav-bg: #0f1628;
  --input-bg: #090d1a;
}

[data-theme="gris"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-card: #1e1e1e;
  --border-color: rgba(255,255,255,0.1);
  --border-card: rgba(255,255,255,0.08);
  --text-primary: #f0f0f0;
  --text-secondary: #999999;
  --accent: #4f8ef7;
  --accent-2: #00d4ff;
  --accent-glow: rgba(79,142,247,0.12);
  --nav-bg: #242424;
  --input-bg: #1a1a1a;
}

[data-theme="blanco"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fc;
  --bg-card: #ffffff;
  --border-color: rgba(0,0,0,0.1);
  --border-card: rgba(0,0,0,0.08);
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --accent: #4f8ef7;
  --accent-2: #0099cc;
  --accent-glow: rgba(79,142,247,0.08);
  --nav-bg: #ffffff;
  --input-bg: #f3f4f6;
}

[data-theme="blanco-gris"] {
  --bg-primary: #f0f2f5;
  --bg-secondary: #e8eaed;
  --bg-card: #f8f9fc;
  --border-color: rgba(0,0,0,0.08);
  --border-card: rgba(0,0,0,0.06);
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --accent: #4f8ef7;
  --accent-2: #0099cc;
  --accent-glow: rgba(79,142,247,0.08);
  --nav-bg: #e8eaed;
  --input-bg: #f0f2f5;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: Arial, Helvetica, sans-serif;
  transition: background 0.3s, color 0.3s;
}