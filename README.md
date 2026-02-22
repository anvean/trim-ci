# ⚡ TRIM-CI: Real-Time CI Cost Auditor

**Stop flying blind.** TrimCI brings financial visibility to your DevOps pipeline by injecting real-time cost auditing directly into your Pull Requests.

## ❓ Why TrimCI?

In 2026, GitHub Actions pricing is more complex than ever. With the introduction of the **$0.002 platform fee** for self-hosted runners and varied rates for ARM64 vs. X64, developers often don't realize how much a "quick test" costs until the monthly bill arrives.

**TrimCI** solves this by:

* **Instant Visibility:** Detects runner type (Linux/Mac/Windows) and Architecture (ARM64/X64).  
* **Automated Auditing:** Posts a cost breakdown directly to the PR.  
* **Open Source Friendly:** Automatically detects public repos and reports `$0.00` cost.

## 🚀 Quick Start

Add TrimCI as the final step in your `.github/workflows/ci.yml`. It is recommended to place it at the end to capture the full duration of your tests.

jobs:  
  test:  
    runs-on: ubuntu-latest  
    permissions:  
      pull-requests: write \# Required to post comments  
    steps:  
      \- uses: actions/checkout@v4  
        
      \# ... your build/test steps ...

      \- name: TrimCI Cost Audit  
        uses: anvean/trim-ci@v1  
        if: always() \# Ensures it runs even if tests fail  
        with:  
          github-token: ${{ secrets.GITHUB\_TOKEN }}

## 🗺️ Roadmap: The Future of TrimCI

We are just getting started. Our mission is to make cloud waste visible across the entire development lifecycle.

* \[ \] **Cross-Platform Support:** Expanding real-time auditing to GitLab and Bitbucket.  
* \[ \] **Intelligence Hub:** A centralized dashboard to track cumulative savings across all repositories.  
* \[ \] **Budget Guardrails:** Automatically stop "zombie runs" that exceed a predefined cost threshold.  
* \[ \] **Historical Analytics:** Export CSV/JSON reports for your monthly financial reviews.

## 📊 2026 Pricing Matrix (Included)

TrimCI comes pre-loaded with the March 2026 GitHub price list to ensure accuracy without needing administrative billing access:

| Runner Type | Architecture | Price / Minute |
| ----- | ----- | ----- |
| **Linux** | ARM64 | **$0.005** |
| **Linux** | X64 | **$0.006** |
| **Windows** | X64 | **$0.010** |
| **macOS** | M1/M2 Standard | **$0.062** |
| **Self-Hosted** | Any | **$0.002** (Platform Fee) |

## 🛠 Developer Setup

1. **Install dependencies:** `npm install`  
2. **Build the bundle:** `npm run build` *Note: The `dist/` folder must be committed to Git for the action to function.*

## 🛡 Security & Privacy

TrimCI is **Local-First**. It calculates costs using environment variables already present in your runner. No source code or sensitive data is ever sent to external servers.

Created by **anvean** • Helping teams ship faster and cheaper.

