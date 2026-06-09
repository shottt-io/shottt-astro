# Shottt (شات) 🚀

Shottt is an independent, lightning-fast, and highly localized digital catalog and online menu platform. Specifically designed to optimize performance, it enables business owners (vendors) to build and publish premium menus and product catalogs.

---

## 🌟 Key Features

- **Multi-Layout Support**: Choose between three catalog presentation layouts dynamically:
  - **Pinterest (Masonry)**: Perfect for visually-rich catalogs with variable image heights (e.g., fashion, galleries, boutique cafes).
  - **Compact List**: Clean, space-efficient, text-oriented layout ideal for quick navigation.
  - **Card View**: Media-forward layout displaying larger images and descriptive text on load.
- **Dynamic Image Storage**: Out-of-the-box support for multiple storage providers. Dynamically switches between:
  - **Local Filesystem** (for local development and self-contained instances).
  - **AWS S3 / S3-compatible cloud storage** (e.g., Cloudflare R2, ArvanCloud Object Storage).
  - **Vercel Blob Storage**.
- **Unified CDN Cache Purging**: Keeps catalog response times lightning-fast with edge caching, while ensuring data updates are reflected instantly:
  - Supports **ArvanCloud** and **Cloudflare** caching strategies.
  - Automatically purges CDN cache for the vendor catalog and homepage when changes occur.
- **Support & Ticketing System**: In-app support ticketing channel between vendors and system administrators (Super Admins) featuring image attachments.
- **Advanced UI Confirmations/Dialogs**: Premium user experience avoiding native browser prompts (`alert`/`confirm`) in favor of customized, responsive HTML `<dialog>` modals with backdrop blur effects.
- **Robust Localization**: Built-in support for Persian (`fa`), English (`en`), and Turkish (`tr`) with customizable currencies and timezone localization.

---

## 🛠️ Tech Stack

- **Framework**: [Astro (v6.x)](https://astro.build/) - Server-Side Rendering (SSR) mode.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/) for migrations and queries.
- **Styling**: Modern Vanilla CSS adhering to strict design tokens (e.g., Outfit/Estedad typography).
- **Deployment**: Dockerized multi-stage builder (`node:22-alpine`) configured with optimized npm registry mirrors for reliable regional deployments.

---

## 📁 Directory Structure

```text
├── drizzle/                # Database migration schemas
├── public/                 # Static assets (logos, fallback local uploads)
├── src/
│   ├── components/         # Shared layouts, dialogs, and regional homepages
│   ├── config/             # Regional and env configuration
│   ├── db/                 # Drizzle client initialization and schema declarations
│   ├── layouts/            # Global page wrappers
│   ├── middleware.ts       # Authentication & localization middleware
│   ├── pages/              # Astro routing (dynamic [vendor] routes & API endpoints)
│   ├── styles/             # Global design system & theme variables
│   └── utils/              # Helper modules (auth, CDN purging, storage providers, i18n)
├── astro.config.mjs        # Astro adapter configuration
├── drizzle.config.ts       # Database schema registry for drizzle-kit
└── Dockerfile              # Multi-stage production container setup
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= `22.12.0`
- PostgreSQL Database

### Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd shottt
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root folder based on the default configurations:
   ```env
   # Database connection string
   DATABASE_URL=postgres://localhost:5432/shottt

   # AI Integration for asset generation (e.g., Google AI Studio or GapGPT proxy)
   AI_API_KEY=your_ai_key
   AI_BASE_URL=https://api.gapgpt.app/v1
   AI_MODEL=gpt-4.1-mini

   # Multi-Region & Localization Settings
   PUBLIC_TOTAL_FREE=true
   PUBLIC_DEFAULT_LOCALE=fa
   PUBLIC_SUPPORTED_CURRENCIES=هزارتومان,تومان,ریال

   # CDN & Base Site URL
   PUBLIC_SITE_URL=http://localhost:4321
   PURGE_BASE_URLS=http://localhost:4321
   CDN_STRATEGY=none # options: 'arvan', 'cloudflare', 'none'
   ```

4. **Initialize the Database:**
   Apply database schemas using Drizzle Kit:
   ```bash
   npx drizzle-kit push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:4321` in your browser.

---

## 📦 Production Deployment

### Docker Setup

The project contains a production-ready multi-stage `Dockerfile` which configures a localized npm registry mirror for high-speed builds on Iranian servers.

To build and run the Docker image:

```bash
# Build the production image
docker build -t shottt-app .

# Run the container exposing port 3000
docker run -p 3000:3000 --env-file .env shottt-app
```

---

## 🎨 Design System & Custom Dialogs

To maintain visual integrity, the project enforces a strict policy against browser-native popups (`confirm()`, `alert()`). Use the pre-configured globally available custom modals instead:

```javascript
// 1. Prompt a confirmation dialog (e.g., delete confirmation)
const confirmed = await window.showConfirmDialog('آیا از حذف این مورد مطمئن هستید؟', {
  okText: 'حذف شود',
  cancelText: 'انصراف',
  type: 'warning'
});

// 2. Present a feedback alert
await window.showAlertDialog('تیکت شما با موفقیت ثبت شد.', {
  type: 'success',
  okText: 'باشه'
});
```

See [DESIGN_SYSTEM.md](file:///Users/mahdi.ketabdar/Developer/shottt/DESIGN_SYSTEM.md) for full guidelines.
