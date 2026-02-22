import * as core from '@actions/core';
import * as github from '@actions/github';

function getRatePerMinute(): number {
  const os = process.env.RUNNER_OS; // 'Linux', 'Windows', 'macOS'
  const arch = process.env.RUNNER_ARCH; // 'X64', 'ARM64'

  const isSelfHosted =
    process.env.RUNNER_ENVIRONMENT === 'self-hosted' ||
    process.env.RUNNER_NAME?.toLowerCase().includes('self');

  if (isSelfHosted) return 0.002;

  switch (os) {
    case 'macOS':
      return 0.062;
    case 'Windows':
      return 0.010;
    case 'Linux':
    default:
      return arch === 'ARM64' ? 0.005 : 0.006;
  }
}

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token);
    const context = github.context;

    // Fetch repo details
    const { data: repo } = await octokit.rest.repos.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
    });

    // Public repos are free
    if (!repo.private) {
      core.info("Public repository detected. Cost is $0.00 (Free for Open Source).");
      return;
    }

    const rate = getRatePerMinute();

    // Fetch workflow run metadata
    const { data: runData } = await octokit.rest.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId,
    });

    // Calculate duration safely using REST fields
    const start = new Date(
      runData.run_started_at ?? runData.created_at
    ).getTime();

    const end = new Date(runData.updated_at).getTime();

    const durationMs = Math.max(0, end - start);
    const durationMin = Math.max(1, Math.ceil(durationMs / 60000));

    const totalCost = (durationMin * rate).toFixed(4);

    const message = `### 💰 Trim-CI Cost Audit
- **Runner:** ${process.env.RUNNER_OS} (${process.env.RUNNER_ARCH})
- **Duration:** ~${durationMin} minute(s)
- **Estimated Cost:** \`$${totalCost}\`
*Prices based on official GitHub 2026 rates.*`;

    core.info(message);

    // Comment only if PR event
    if (context.payload.pull_request) {
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
        body: message,
      });
    }

    // Optional: expose output for advanced users
    core.setOutput("total-cost", totalCost);

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("Unknown error occurred.");
    }
  }
}

run();