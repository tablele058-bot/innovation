import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PIN_TEMPLATES = [
  {
    title: "YC Startup School",
    description: "Free online program with video lectures from top founders on how to start a startup.",
    url: "https://startupschool.org",
    category: "Learning",
    tags: "yc, education, free, video-lectures",
    imageUrl: "",
  },
  {
    title: "Product Hunt",
    description: "Discover and launch new products. The best place to find what's next in tech.",
    url: "https://producthunt.com",
    category: "Tools & Resources",
    tags: "products, launch, discovery, tech",
    imageUrl: "",
  },
  {
    title: "Pitch Deck Template",
    description: "Sequoia Capital's recommended pitch deck structure with 10 slides covering problem, solution, market, and team.",
    url: "https://www.sequoiacap.com",
    category: "Templates",
    tags: "pitch-deck, fundraising, sequoia, template",
    imageUrl: "",
  },
  {
    title: "Indie Hackers",
    description: "Community where profitable founders share their revenue, strategies, and lessons learned.",
    url: "https://indiehackers.com",
    category: "Startup Ideas",
    tags: "indie, community, revenue, interviews",
    imageUrl: "",
  },
  {
    title: "a16z Podcast",
    description: "Conversations with tech leaders about building companies, investing, and the future of technology.",
    url: "https://a16z.com/podcasts",
    category: "News & Articles",
    tags: "podcast, vc, tech-trends, investing",
    imageUrl: "",
  },
  {
    title: "AngelList",
    description: "Platform connecting startups with investors and job seekers. Find funding or your next role.",
    url: "https://angel.co",
    category: "Funding & Investors",
    tags: "fundraising, jobs, investors, platform",
    imageUrl: "",
  },
  {
    title: "Stripe Atlas",
    description: "Incorporation, banking, and tax services for startups. Launch your company in days.",
    url: "https://stripe.com/atlas",
    category: "Tools & Resources",
    tags: "incorporation, legal, banking, stripe",
    imageUrl: "",
  },
  {
    title: "First Round Review",
    description: "In-depth articles on startup management, culture, hiring, and product strategy from First Round Capital.",
    url: "https://review.firstround.com",
    category: "Learning",
    tags: "management, culture, hiring, strategy",
    imageUrl: "",
  },
  {
    title: "Paul Graham's Essays",
    description: "Essential reading for founders covering startups, growth, and technology from Y Combinator co-founder.",
    url: "https://paulgraham.com/articles.html",
    category: "Learning",
    tags: "essays, paul-graham, yc, founder-wisdom",
    imageUrl: "",
  },
  {
    title: "Crunchbase",
    description: "Database of investors, funding rounds, and startup acquisitions. Research and track companies.",
    url: "https://crunchbase.com",
    category: "Funding & Investors",
    tags: "funding, database, research, investors",
    imageUrl: "",
  },
  {
    title: "Notion Startup OS",
    description: "All-in-one workspace template with OKRs, hiring pipeline, meeting notes, and more for startups.",
    url: "https://www.notion.so/templates/startup-os",
    category: "Templates",
    tags: "notion, template, productivity, operations",
    imageUrl: "",
  },
  {
    title: "TechCrunch",
    description: "Breaking tech news, startup coverage, and analysis of emerging technology trends.",
    url: "https://techcrunch.com",
    category: "News & Articles",
    tags: "news, tech, startup-news, media",
    imageUrl: "",
  },
  {
    title: "Lean Canvas",
    description: "One-page business plan template adapted from Lean Startup methodology by Ash Maurya.",
    url: "https://leanstack.com/lean-canvas",
    category: "Templates",
    tags: "lean, canvas, business-model, planning",
    imageUrl: "",
  },
  {
    title: "HN Front Page",
    description: "Hacker News — tech community sharing and discussing the most interesting startup and tech content daily.",
    url: "https://news.ycombinator.com",
    category: "News & Articles",
    tags: "hacker-news, community, discussion, tech",
    imageUrl: "",
  },
  {
    title: "MicroConf",
    description: "Conference for bootstrapped SaaS founders. Talks on pricing, marketing, and building profitable products.",
    url: "https://microconf.com",
    category: "Startup Ideas",
    tags: "conference, bootstrapped, saas, community",
    imageUrl: "",
  },
  {
    title: "OpenAI API Cookbook",
    description: "Practical examples and patterns for using OpenAI APIs in your startup products.",
    url: "https://cookbook.openai.com",
    category: "Tools & Resources",
    tags: "openai, api, cookbook, ai, examples",
    imageUrl: "",
  },
  {
    title: "NFX Signal",
    description: "Data-driven insights on network effects, marketplace dynamics, and startup growth strategies.",
    url: "https://signal.nfx.com",
    category: "Learning",
    tags: "network-effects, growth, data, research",
    imageUrl: "",
  },
  {
    title: "Y Combinator SAFE",
    description: "Standardized founder-friendly investment agreement used by YC and most early-stage investors.",
    url: "https://www.ycombinator.com/documents",
    category: "Funding & Investors",
    tags: "safe, investment, legal, yc, fundraising",
    imageUrl: "",
  },
  {
    title: "Awesome Indie",
    description: "Curated list of resources for indie founders — from idea validation to marketing and growth.",
    url: "https://github.com/mezod/awesome-indie",
    category: "Startup Ideas",
    tags: "indie, resources, curated, github",
    imageUrl: "",
  },
  {
    title: "GrowthHackers",
    description: "Community and resource hub for growth marketing experiments, case studies, and strategies.",
    url: "https://growthhackers.com",
    category: "Tools & Resources",
    tags: "growth, marketing, experiments, community",
    imageUrl: "",
  },
];

function getImageForCategory(category: string): string {
  const colors: Record<string, string> = {
    "Startup Ideas": "6366f1",
    "Tools & Resources": "06b6d4",
    "Funding & Investors": "22c55e",
    Learning: "f97316",
    "News & Articles": "ec4899",
    Templates: "a855f7",
  };
  const color = colors[category] || "6366f1";
  const emojis: Record<string, string> = {
    "Startup Ideas": "💡",
    "Tools & Resources": "🔧",
    "Funding & Investors": "💰",
    Learning: "📚",
    "News & Articles": "📰",
    Templates: "📋",
  };
  const emoji = emojis[category] || "📌";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#${color}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#${color}" stop-opacity="0.05"/>
    </linearGradient></defs>
    <rect width="600" height="400" fill="url(#g)" rx="12"/>
    <text x="300" y="180" text-anchor="middle" font-family="system-ui" font-size="64">${emoji}</text>
    <text x="300" y="260" text-anchor="middle" font-family="system-ui" font-size="18" fill="#${color}" fill-opacity="0.7" font-weight="bold">${category}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { count = 5, category } = body;

    let pool = PIN_TEMPLATES;
    if (category) {
      pool = pool.filter((p) => p.category === category);
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, 10));

    const pins = selected.map((p) => ({
      ...p,
      imageUrl: p.imageUrl || getImageForCategory(p.category),
      isAiGenerated: "true",
    }));

    return NextResponse.json({ pins });
  } catch (err: any) {
    console.error("Error in POST /api/startup-board/generate:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
