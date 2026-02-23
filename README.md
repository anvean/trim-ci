# ⚡ TRIM-CI: Real-Time CI Cost Auditor

**Stop flying blind.** Trim-CI brings financial visibility to your DevOps pipeline by injecting real-time cost auditing directly into your Pull Requests.

---
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/anvean/trim-ci?color=green&label=version&logo=github&style=flat-square)](https://github.com/anvean/trim-ci/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/anvean/trim-ci/blob/main/LICENSE)
---
## ❓ Why Trim-CI?

In 2026, GitHub Actions pricing is more complex than ever. With the introduction of the **$0.002 platform fee** for self-hosted runners and varied rates for ARM64 vs. X64, developers often don't realize how much a "quick test" costs until the monthly bill arrives.

**Trim-CI** solves this by:

* **Instant Visibility** – Detects runner type (Linux/Mac/Windows) and Architecture (ARM64/X64)  
* **Automated Auditing** – Posts a cost breakdown directly to the PR  
* **Open Source Friendly** – Automatically detects public repos and reports `$0.00` cost

---

## 🚀 Quick Start

Add Trim-CI as the final step in your `.github/workflows/ci.yml`.  
It is recommended to place it at the end to capture the full duration of your tests.

1️⃣ Quick Start (Minimal Required Only)
```
jobs:
  test:
    runs-on: ubuntu-latest

    permissions:
      pull-requests: write # Required to post comments

    steps:
      - uses: actions/checkout@v4

      # ... your build/test steps ...

      - name: Trim-CI Cost Audit
        uses: anvean/trim-ci@v1
        if: always() # Ensures it runs even if tests fail
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```
2️⃣ Optional Configuration to force billing and debug

```
jobs:
  test:
    runs-on: ubuntu-latest

    permissions:
      pull-requests: write # Required to post comments

    steps:
      - uses: actions/checkout@v4

      # ... your build/test steps ...

      - name: Trim-CI Cost Audit
        uses: anvean/trim-ci@v1
        if: always() # Ensures it runs even if tests fail
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          force-billing: true   # Optional
          debug: true           # Optional
```

3️⃣ Inputs Table

⚙️ Inputs
| Input	| Required | Default | Description |
| ----- | ----- | ----- | ----- |
|**github-token**	| ✅ Yes | — | Used to post PR comments |
|**force-billing**| ❌ No | false	| Calculates cost even if GitHub shows free usage |
|**debug** | ❌ No | false	| Enables detailed runtime + pricing logs |

---

## 📊 2026 Pricing Matrix (Included)

Trim-CI comes pre-loaded with the March 2026 GitHub price list to ensure accuracy without needing administrative billing access:

| Runner Type | Architecture | Price / Minute |
| ----- | ----- | ----- |
| **Linux** | ARM64 | **$0.005** |
| **Linux** | X64 | **$0.006** |
| **Windows** | X64 | **$0.010** |
| **macOS** | M1/M2 Standard | **$0.062** |
| **Self-Hosted** | Any | **$0.002** (Platform Fee) |

---

## 🗺️ Roadmap: The Future of Trim-CI

We are just getting started. Our mission is to make cloud waste visible across the entire development lifecycle.

* **Cross-Platform Support** – GitLab & Bitbucket  
* **Intelligence Hub** – Central dashboard to track cumulative savings  
* **Budget Guardrails** – Automatically stop "zombie runs" exceeding cost thresholds  
* **Historical Analytics** – Export CSV/JSON reports

---

## 🛠 Developer Setup

npm install

npm run build

⚠️ The `dist/` folder must be committed to Git for the action to function.

---

## 🛡 Security & Privacy

Trim-CI is **Local-First**. It calculates costs using environment variables already present in your runner.

* No source code is sent externally  
* No billing API access required  
* No sensitive data leaves your CI

---

Created by **Anvean Technologies** • Helping teams ship faster and cheaper 🚀

---

