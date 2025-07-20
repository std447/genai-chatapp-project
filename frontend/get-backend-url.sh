#!/bin/bash

# This script dynamically determines the backend API URL during Cloudflare Pages builds.
# It generates a .env file for Vite.

# --- Handle Local Development (Early Return) ---
# Exit if not running in a Cloudflare Pages build environment.
# CF_PAGES is "1" in Cloudflare Pages builds.
if [[ -z "$CF_PAGES" || "$CF_PAGES" != "1" ]]; then
    echo "Not running in Cloudflare Pages build environment. Skipping .env file generation."
    exit 0 # Exit cleanly
fi

# --- Configuration ---
WORKER_BASE_NAME="genai-chatapp"
WORKER_DOMAIN="st-d447.workers.dev"

# --- Determine API URL for Cloudflare Pages Build Environment ---

# Default API_URL to the production Worker URL.
API_URL="https://${WORKER_BASE_NAME}.${WORKER_DOMAIN}"

# If it's a non-production branch, override with the preview Worker URL.
# CF_PAGES_BRANCH and CF_PAGES_COMMIT_SHA are provided by Cloudflare Pages.
if [[ "$CF_PAGES_BRANCH" != "main" && "$CF_PAGES_BRANCH" != "master" ]]; then
    # Preview build: Use the short commit SHA for the dynamic preview Worker URL.
    # CF_PAGES_COMMIT_SHA contains the full commit hash; take the first 8 characters.
    COMMIT_SHORT_SHA="${CF_PAGES_COMMIT_SHA:0:8}"
    API_URL="https://${COMMIT_SHORT_SHA}-${WORKER_BASE_NAME}.${WORKER_DOMAIN}"
fi

# --- Inject URL into .env file for Vite ---
# This file will be created in the frontend directory relative to the monorepo root.
# Vite automatically picks up variables from .env files during its build process.
ENV_FILE=".env" # Or .env.development if preferred for preview builds
echo "VITE_BASE_API_URL=$API_URL" > "$ENV_FILE"
echo "Injected VITE_BASE_API_URL: $API_URL into $ENV_FILE"
