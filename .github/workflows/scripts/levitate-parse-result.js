// Parses the "levitate" artifact produced by the "Detect breaking changes" workflow.
// That workflow runs on (possibly fork) pull requests, so the artifact is untrusted:
// every value is validated or rebuilt here before being exposed as a step output.
const PACKAGE_NAME = /^[a-z0-9-]+$/;
const MESSAGE_ENTRY = /^\*\*`([^`]*)`\*\* has possible breaking changes \(\[more info\]\([^)]*\)\)<br \/>/;
const MAX_ENTRIES = 50;

async function resolvePrNumber({ github, context, run }) {
  const { owner, repo } = context.repo;
  const fromRun = (run.pull_requests || []).find(
    (pr) => pr.head.sha === run.head_sha && pr.base.repo.id === run.repository.id
  );
  if (fromRun) {
    return fromRun.number;
  }

  // `workflow_run.pull_requests` is empty for runs triggered from forks.
  if (!run.head_repository || !run.head_branch) {
    return null;
  }
  const pulls = await github.paginate(github.rest.pulls.list, {
    owner,
    repo,
    state: 'open',
    head: `${run.head_repository.owner.login}:${run.head_branch}`,
    per_page: 100,
  });
  const match = pulls.find(
    (pr) => pr.head.sha === run.head_sha && pr.head.repo && pr.head.repo.id === run.head_repository.id
  );
  return match ? match.number : null;
}

function sanitizeJobLink(value, run) {
  const runUrl = run.html_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${runUrl}/(job|jobs)/\\d+(\\?check_suite_focus=true)?(#step:\\d+:\\d+)?$`);
  return typeof value === 'string' && pattern.test(value) ? value : run.html_url;
}

function rebuildMessage(value, jobLink) {
  if (typeof value !== 'string') {
    return '';
  }
  const packages = [];
  let rest = value;
  while (rest.length > 0 && packages.length < MAX_ENTRIES) {
    const match = MESSAGE_ENTRY.exec(rest);
    if (!match || !PACKAGE_NAME.test(match[1])) {
      return 'Possible breaking changes detected (see the console output).';
    }
    packages.push(match[1]);
    rest = rest.slice(match[0].length);
  }
  return packages
    .map((name) => `**\`${name}\`** has possible breaking changes ([more info](${jobLink}))<br />`)
    .join('');
}

module.exports = async ({ github, context, core, filePath }) => {
  try {
    const fs = require('fs').promises;
    const run = context.payload.workflow_run;

    if (!run || run.event !== 'pull_request') {
      core.info('Not triggered by a pull_request workflow run, skipping.');
      core.setOutput('shouldSkip', 'true');
      return;
    }

    const result = JSON.parse(await fs.readFile(filePath, 'utf8'));
    if (result.shouldSkip === true) {
      core.setOutput('shouldSkip', 'true');
      return;
    }

    const prNumber = await resolvePrNumber({ github, context, run });
    if (!prNumber) {
      core.warning(`Could not find an open pull request for ${run.head_sha}, skipping.`);
      core.setOutput('shouldSkip', 'true');
      return;
    }
    if (result.pr_number !== undefined && String(result.pr_number) !== String(prNumber)) {
      throw new Error(
        `Artifact pr_number (${result.pr_number}) does not match the triggering pull request (#${prNumber}).`
      );
    }

    const exitCode = String(result.exit_code);
    if (exitCode !== '0' && exitCode !== '1') {
      throw new Error(`Unexpected exit_code in artifact: ${exitCode}`);
    }

    const jobLink = sanitizeJobLink(result.job_link, run);
    const message = rebuildMessage(result.message, jobLink);
    const { owner, repo } = context.repo;

    core.setOutput('shouldSkip', 'false');
    core.setOutput('pr_number', String(prNumber));
    core.setOutput('exit_code', exitCode);
    core.setOutput('job_link', jobLink);
    core.setOutput('message', message);
    core.setOutput(
      'slack_payload',
      JSON.stringify({
        pr_link: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
        pr_number: String(prNumber),
        job_link: jobLink,
        reporting_job_link: run.html_url,
        message,
      })
    );
  } catch (error) {
    core.setFailed(error.message);
  }
};
