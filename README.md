# Innovation — Startup Founders Platform

A collaborative workspace built for **startup founders** to share ideas, showcase goals, and build together. Still actively developing.

## Features

### Workspace Tools
| Tool | Description |
|---|---|
| **Startup Board** | Pinterest-style board to save, organize, and discover elite startup content (tools, funding, learning, news, templates) |
| **AI Book** | AI-powered children's story generator with illustrations & narration |
| **Web Builder** | Build websites with AI prompts & live preview |
| **Canva.io** | Full-stack design tool with Fabric.js |
| **Easier.io** | Diagramming & whiteboarding with Eraser.io-style UI |
| **YouTube Notes** | Take timestamped notes while watching videos |
| **Coding** | Monaco editor with GitHub sync |
| **Attendance** | Track daily attendance |

### Startup Board Highlights
- **Pin from URL** — paste any URL, auto-fetches page metadata + images, pick one and pin
- **Browser Bookmarklet** — drag the Pin Button to your bookmarks bar, click on any webpage to save content
- **AI Generate** — one-click to add curated startup resources (YC, Product Hunt, Stripe Atlas, etc.)
- **Masonry Grid** — Pinterest-style layout with category filters and search
- **Categories** — Startup Ideas, Tools & Resources, Funding & Investors, Learning, News & Articles, Templates

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (YugabyteDB) via Drizzle ORM
- **Auth:** Clerk
- **AI:** Groq (llama-3.3-70b), Hugging Face
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Getting Started

```bash
git clone https://github.com/tablele058-bot/innovation.git
cd innovation
npm install
cp .env.local.example .env.local  # Add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GROQ_API_KEY=
HUGGINGFACE_API_KEY=
```

## Push Schema to Database

```bash
npm run db:push
```

## License

MIT
