# GenAI ChatApp: A Multi-Cloud, Free-Tier Driven Generative AI Chat Application

This project is a sophisticated demonstration of building a generative AI chat application that leverages multiple cloud providers to maximize free-tier usage, enhance resilience, and provide a rich learning experience.

## Project Overview

The GenAI ChatApp is designed to be a full-stack application featuring:
* A **React (Vite + TypeScript)** frontend for a dynamic user interface.
* A dual-deployed **serverless backend** on both **Cloudflare Workers** and **Deno Deploy** for API proxying and core logic.
* **Groq** for high-speed Generative AI, utilizing `gemma2-9b-it` for chat and `meta-llama/llama-guard-4-12b` for content moderation.
* **Firebase Authentication** for user management.
* Robust **rate limiting** and **caching** mechanisms to stay within free-tier limits.

## Key Features

* **Multi-Cloud Architecture:** Frontend and backend components are deployed across different cloud providers (Cloudflare, Deno Deploy, Groq, Firebase) for redundancy and free-tier maximization.
* **Generative AI Chat (via Groq):** Powered by Groq's fast inference for models like `gemma2-9b-it` for efficient AI interactions.
* **User Authentication:** Secure user management and authentication via Firebase.
* **Intelligent Rate Limiting:**
    * Authenticated Users: **100 requests per 24 hours per user.**
    * Anonymous Users: **10 requests per 24 hours per IP address + Canvas Fingerprint hash.**
    * Limits are tracked using platform-native KV stores (Cloudflare KV, Deno KV).
    * Crucially, cached AI responses **do NOT count** towards user limits.
* **Response Caching:** AI responses are cached for 1 hour in KV stores to reduce redundant Groq API calls and improve performance.
* **Content Moderation:** User inputs are pre-filtered using `meta-llama/llama-guard-4-12b` on Groq to prevent the generation of harmful content.
* **Resilient Backend:** Core backend logic is shared and deployed on both Cloudflare Workers and Deno Deploy. The frontend is designed to potentially fall back to the secondary backend in case of primary service issues.
* **Secure API Key Management:** Groq API keys are securely stored as environment secrets on the backend platforms.
* **Privacy-Conscious Design:** Emphasis on transparent data handling, user responsibility regarding PII, and minimal data retention for rate limiting.
* **Automated Deployments:** Full CI/CD pipelines integrated with Git for seamless deployments across all components.

## Architecture Highlights

```mermaid
graph TD
    subgraph Frontend (React / Vite / TypeScript)
        A[User Browser] -->|HTTP/3 (where available)| B(Cloudflare Pages)
        A -->|HTTP/3 (where available)| C(Deno Deploy Static Host)
        B -- ENV_VAR_CF_API_URL --> D(Cloudflare Worker Backend)
        C -- ENV_VAR_DENO_API_URL --> E(Deno Deploy Backend)
    end

    subgraph Backend (Serverless Functions - TypeScript / Hono)
        D -- Shared Logic --> F(Firebase Auth Token Verify)
        D -- Shared Logic --> G(Cloudflare KV - User Limits & AI Cache)
        E -- Shared Logic --> F
        E -- Shared Logic --> H(Deno KV - User Limits & AI Cache)
    end

    subgraph External Services
        F --> I(Firebase Auth Public Keys)
        D & E --> J(Groq API)
        J --> K(gemma2-9b-it for Chat)
        J --> L(meta-llama/llama-guard-4-12b for Moderation)
    end

    K & L --> M(Groq Free Tier: 14.4k RPD / 30 RPM for selected models)
  ```

**Note:** The shared logic in the backend ensures consistent behavior, with an abstraction layer handling platform-specific KV and environment access. Content moderation is performed by Llama Guard on user input before the main chat model (gemma2-9b-it) is invoked.


## Project Dir structure
genai-chatapp-project/
├── frontend/                     # React (Vite + TS) UI
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.tsx               # Updated with Tailwind & Dark Mode
│   │   ├── index.css             # Updated with Tailwind directives
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── exampleEnv              # For frontend env vars
│   ├── .env.local                # Your local frontend env vars (ignored by Git)
│   ├── index.html                # Updated for Dark Mode
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── backend/
│   ├── cloudflare-worker/        # Cloudflare Worker specific code & config
│   │   ├── src/                  # CF Worker entry point (imports from shared)
│   │   │   └── index.ts          # Minimal entry point
│   │   ├── wrangler.jsonc        # Cloudflare Worker config (JSONC format)
│   │   ├── .gitignore            # Specific for Cloudflare worker
│   │   ├── package.json          # For wrangler CLI, Hono, etc.
│   │   ├── package-lock.json
│   │   ├── tsconfig.json         # TS config for Cloudflare Worker
│   │   ├── .dev.vars             # Local dev env vars (ignored by Git)
│   │   └── node_modules/
│   ├── deno-deploy/              # Deno Deploy specific code & config (empty for now)
│   │   ├── src/
│   │   └── ...
│   └── shared/                   # Core backend logic shared between CF and Deno
│       └── src/
│           ├── types.ts          # Shared TypeScript interfaces
│           ├── ... (other shared files will go here later)
├── README.md
├── .gitignore                    # Updated with all necessary ignores
└── # No root package.json for now, will add later if needed for monorepo scripts
