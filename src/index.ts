import * as core from '@actions/core';
import * as github from '@actions/github';

function getRatePerMinute(): number {
  const os = process.env.RUNNER_OS; // 'Linux', 'Windows', 'macOS'
  const arch = process.env.RUNNER_ARCH; // 'X64', 'ARM64'
  const isSelfHosted = process.env.RUNNER_ENVIRONMENT === 'self-hosted';

  // 2026 March Update: New Platform Fee for Self-Hosted
  if (isSelfHosted) return 0.002;

  // 2026 January Update: Reduced Hosted Runner Rates
  switch (os) {
    case 'macOS':
      return 0.062; // Standard 3/4-core M1/Intel
    case 'Windows':
      return 0.010; // Standard 2-core
    case 'Linux':
    default:
      // ARM64 is now the budget king in 2026
      return arch === 'ARM64' ? 0.005 : 0.006; 
  }
}

async function run() {
  try {
    const token = core.getInput('github-token');
    const octokit = github.getOctokit(token);
    const context = github.context;

    // Check if repo is public (Actions are free for Open Source)
    const { data: repo } = await octokit.rest.repos.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
    });

    if (!repo.private) {
      core.info("Public repository detected. Cost is $0.00 (Free for Open Source).");
      return;
    }

    const rate = getRatePerMinute();
    
    // Fetch run metadata to get precise start time
    const { data: runData } = await octokit.rest.actions.getWorkflowRun({
      ...context.repo,
      run_id: context.runId,
    });

    const startTime = new Date(runData.created_at).getTime();
    const durationMin = Math.max(1, Math.ceil((Date.now() - startTime) / 60000));
    const totalCost = (durationMin * rate).toFixed(4);

    const message = `### 💰 TrimCI Cost Audit
- **Runner:** ${process.env.RUNNER_OS} (${process.env.RUNNER_ARCH})
- **Duration:** ~${durationMin} minute(s)
- **Estimated Cost:** \`$${totalCost}\`
*Prices based on official GitHub 2026 rates.*`;

    core.info(message);

    if (context.payload.pull_request) {
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: context.payload.pull_request.number,
        body: message
      });
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();