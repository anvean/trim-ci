import * as core from '@actions/core';
import * as github from '@actions/github';

function getRatePerMinute(): number {
  const os = process.env.RUNNER_OS; // Linux, Windows, macOS
  const arch = process.env.RUNNER_ARCH; // X64, ARM64

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
    const forceBilling = core.getInput('force-billing') === 'true';
    const debug = core.getInput('debug') === 'true';

    const octokit = github.getOctokit(token);
    const context = github.context;

    const { owner, repo } = context.repo;

    // Fetch repository details
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    if (!repoData.private && !forceBilling) {
      core.info("Public repository detected. Cost is $0.00 (Free for Open Source).");
      return;
    }

    const rate = getRatePerMinute();

    // Fetch all jobs in this workflow run
    const { data: jobsData } =
      await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: context.runId,
      });

    let totalMs = 0;

    for (const job of jobsData.jobs) {
      if (job.started_at && job.completed_at) {
        const start = new Date(job.started_at).getTime();
        const end = new Date(job.completed_at).getTime();
        totalMs += Math.max(0, end - start);
      }
    }

    const durationMinRaw = totalMs / 60000;
    const durationMin = Math.max(1, Math.ceil(durationMinRaw));
    const totalCost = (durationMin * rate).toFixed(4);

    if (debug) {
      core.info(`Runner OS: ${process.env.RUNNER_OS}`);
      core.info(`Runner Arch: ${process.env.RUNNER_ARCH}`);
      core.info(`Rate per minute: $${rate}`);
      core.info(`Total milliseconds: ${totalMs}`);
      core.info(`Total minutes (rounded): ${durationMin}`);
      core.info(`Total cost: $${totalCost}`);
    }

    const message = `### 💰 Trim-CI Cost Audit

- **Runner:** ${process.env.RUNNER_OS} (${process.env.RUNNER_ARCH})
- **Total Job Time:** ~${durationMin} minute(s)
- **Rate:** \`$${rate}/min\`
- **Estimated Cost:** \`$${totalCost}\`

*Prices based on official GitHub 2026 rates.*`;

    core.info(message);

    // Comment on PR if applicable
    if (context.payload.pull_request) {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: context.payload.pull_request.number,
        body: message,
      });
    }

    core.setOutput("total-cost", totalCost);
    core.setOutput("total-minutes", durationMin.toString());

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("Unknown error occurred.");
    }
  }
}

run();