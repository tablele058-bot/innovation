export const DESIGN_PRESETS = {
  "instagram-post": { width: 1080, height: 1080, label: "Instagram Post", aspect: "1:1" },
  "instagram-story": { width: 1080, height: 1920, label: "Instagram Story", aspect: "9:16" },
  "facebook-post": { width: 1200, height: 630, label: "Facebook Post", aspect: "1.91:1" },
  "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail", aspect: "16:9" },
  "youtube-banner": { width: 2560, height: 1440, label: "YouTube Banner", aspect: "16:9" },
  "linkedin-post": { width: 1200, height: 627, label: "LinkedIn Post", aspect: "1.91:1" },
  "presentation": { width: 1920, height: 1080, label: "Presentation Slide", aspect: "16:9" },
  "a4": { width: 2480, height: 3508, label: "A4 Document", aspect: "1:1.414" },
  "resume": { width: 2550, height: 3300, label: "Resume", aspect: "1:1.294" },
  "business-card": { width: 1050, height: 600, label: "Business Card", aspect: "1.75:1" },
  "poster": { width: 2400, height: 3600, label: "Poster", aspect: "2:3" },
  "certificate": { width: 2400, height: 1800, label: "Certificate", aspect: "4:3" },
  "flyer": { width: 2100, height: 2970, label: "Flyer", aspect: "1:1.414" },
  "portfolio": { width: 1920, height: 1080, label: "Portfolio", aspect: "16:9" },
} as const;

export const TEMPLATE_CATEGORIES = [
  { id: "instagram-post", label: "Instagram Post", icon: "📸" },
  { id: "instagram-story", label: "Instagram Story", icon: "📱" },
  { id: "youtube-thumbnail", label: "YouTube Thumbnail", icon: "▶️" },
  { id: "youtube-banner", label: "YouTube Banner", icon: "🎬" },
  { id: "linkedin-post", label: "LinkedIn Post", icon: "💼" },
  { id: "resume", label: "Resume", icon: "📄" },
  { id: "certificate", label: "Certificate", icon: "🏆" },
  { id: "poster", label: "Poster", icon: "🖼️" },
  { id: "flyer", label: "Flyer", icon: "📃" },
  { id: "portfolio", label: "Portfolio", icon: "📁" },
  { id: "presentation", label: "Presentation", icon: "📊" },
  { id: "business-card", label: "Business Card", icon: "💳" },
];

export const TEMPLATES: Record<string, { name: string; preset: string; thumbnail: string; elements: any[] }[]> = {
  "instagram-post": [
    { name: "Modern Quote", preset: "instagram-post", thumbnail: "", elements: [] },
    { name: "Product Showcase", preset: "instagram-post", thumbnail: "", elements: [] },
    { name: "Minimal Grid", preset: "instagram-post", thumbnail: "", elements: [] },
    { name: "Gradient Glow", preset: "instagram-post", thumbnail: "", elements: [] },
  ],
  "instagram-story": [
    { name: "Poll Story", preset: "instagram-story", thumbnail: "", elements: [] },
    { name: "Q&A Story", preset: "instagram-story", thumbnail: "", elements: [] },
    { name: "Countdown", preset: "instagram-story", thumbnail: "", elements: [] },
  ],
  "presentation": [
    { name: "Pitch Deck", preset: "presentation", thumbnail: "", elements: [] },
    { name: "Corporate Blue", preset: "presentation", thumbnail: "", elements: [] },
    { name: "Creative Agency", preset: "presentation", thumbnail: "", elements: [] },
  ],
  "resume": [
    { name: "Clean Professional", preset: "resume", thumbnail: "", elements: [] },
    { name: "Creative Designer", preset: "resume", thumbnail: "", elements: [] },
    { name: "Modern Minimal", preset: "resume", thumbnail: "", elements: [] },
  ],
  "poster": [
    { name: "Event Poster", preset: "poster", thumbnail: "", elements: [] },
    { name: "Sale Banner", preset: "poster", thumbnail: "", elements: [] },
    { name: "Music Festival", preset: "poster", thumbnail: "", elements: [] },
  ],
  "certificate": [
    { name: "Achievement", preset: "certificate", thumbnail: "", elements: [] },
    { name: "Completion", preset: "certificate", thumbnail: "", elements: [] },
    { name: "Gold Award", preset: "certificate", thumbnail: "", elements: [] },
  ],
  "business-card": [
    { name: "Modern Minimal", preset: "business-card", thumbnail: "", elements: [] },
    { name: "Corporate", preset: "business-card", thumbnail: "", elements: [] },
  ],
};

export const ELEMENTS_LIBRARY = {
  shapes: [
    { type: "rect", label: "Rectangle", icon: "▬" },
    { type: "circle", label: "Circle", icon: "●" },
    { type: "triangle", label: "Triangle", icon: "▲" },
    { type: "star", label: "Star", icon: "★" },
    { type: "arrow-right", label: "Arrow", icon: "→" },
    { type: "line", label: "Line", icon: "━" },
    { type: "hexagon", label: "Hexagon", icon: "⬡" },
    { type: "diamond", label: "Diamond", icon: "◆" },
    { type: "pentagon", label: "Pentagon", icon: "⬠" },
    { type: "cross", label: "Cross", icon: "✚" },
  ],
  icons: [
    { name: "Heart", category: "general" },
    { name: "Star", category: "general" },
    { name: "Check", category: "general" },
    { name: "Arrow Up", category: "arrows" },
    { name: "Arrow Down", category: "arrows" },
    { name: "Arrow Left", category: "arrows" },
    { name: "Arrow Right", category: "arrows" },
    { name: "Home", category: "ui" },
    { name: "Settings", category: "ui" },
    { name: "User", category: "people" },
  ],
};

export const FONT_LIST = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Courier New",
  "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS", "Palatino",
  "Garamond", "Bookman", "Tahoma", "Lucida Console", "Monaco",
];

export const COLOR_PALETTES = {
  default: ["#1e1e1e", "#ffffff", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#78716c"],
  pastel: ["#fecaca", "#fed7aa", "#fde68a", "#d9f99d", "#bbf7d0", "#a7f3d0", "#99f6e4", "#a5f3fc", "#bae6fd", "#c7d2fe", "#ddd6fe", "#fbc7d4"],
  vibrant: ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#be185d", "#4f46e5", "#0d9488"],
  dark: ["#0a0a0a", "#1a1a2e", "#16213e", "#0f3460", "#533483", "#1b1b2f", "#2d2d44", "#3d3d5c", "#1e1e2f", "#2a2a40"],
};

export const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
  "exclusion", "hue", "saturation", "color", "luminosity",
];

export const IMAGE_FILTERS = [
  { name: "Normal", value: "none" },
  { name: "Blur", value: "blur" },
  { name: "Grayscale", value: "grayscale" },
  { name: "Sepia", value: "sepia" },
  { name: "Vintage", value: "vintage" },
  { name: "Warm", value: "warm" },
  { name: "Cool", value: "cool" },
  { name: "Dramatic", value: "dramatic" },
  { name: "Fade", value: "fade" },
];

export const KEYBOARD_SHORTCUTS = [
  { keys: "Ctrl+Z", action: "Undo" },
  { keys: "Ctrl+Shift+Z", action: "Redo" },
  { keys: "Ctrl+C", action: "Copy" },
  { keys: "Ctrl+V", action: "Paste" },
  { keys: "Ctrl+D", action: "Duplicate" },
  { keys: "Delete", action: "Delete" },
  { keys: "Ctrl+A", action: "Select All" },
  { keys: "Ctrl+G", action: "Group" },
  { keys: "Ctrl+Shift+G", action: "Ungroup" },
  { keys: "Ctrl+S", action: "Save" },
  { keys: "Ctrl+E", action: "Export" },
  { keys: "+/-", action: "Zoom In/Out" },
  { keys: "Ctrl+P", action: "Presentation Mode" },
];
