const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const { DefaultArtifactClient } = require('@actions/artifact');

async function uploadNoPrComment(workspaceDir, repository, prNumber) {
  try {  
      const scaFixReportMdFilePath = path.join(workspaceDir, 'source-code', 'sca-fix-report.md');    
      const scaFixReportMd = fs.readFileSync(scaFixReportMdFilePath, 'utf8');
  
      // Generate the comment body
      let commentBody = generateCommentBody(scaFixReportMd);    
      core.info(`Comment body: ${commentBody}`);
      if (!commentBody || commentBody.trim().length === 0) {
        core.warning('Comment body is empty. Skipping comment post.');
        return;
      }
  
      core.info(`Upload comment to PR #${prNumber} as an artifact...`);
  
      // Parse repository string (format: owner/repo)
      const [owner, repo] = repository.split('/');
      if (!owner || !repo) {
        throw new Error(`Invalid repository format. Expected 'owner/repo', got '${repository}'`);
      }
  
      // Upload PR comment data as artifact
      const artifactData = {
        repository_owner: owner,
        repository_name: repo,
        issue_number: parseInt(prNumber),
        body: commentBody
      };
  
      const artifactDir = path.join(workspaceDir, 'veracode_artifact_directory');
      fs.mkdirSync(artifactDir, { recursive: true });
      const artifactFilePath = path.join(artifactDir, 'veracode-cli.pr-comment.json');
      fs.writeFileSync(artifactFilePath, JSON.stringify(artifactData, null, 2));
  
      core.info('== Start upload ==')
      const artifactClient = new DefaultArtifactClient();
      const artifactName = 'veracode-cli-pr-comment-json';
      const uploadResponse = await artifactClient.uploadArtifact(
        artifactName,
        [artifactFilePath],
        workspaceDir,
        { continueOnError: false }
      );
      core.info('== End upload ==')
  
      core.info(`Artifact uploaded successfully: ${uploadResponse.artifactName}`);
    } catch (artifactError) {
      core.warning(`Failed to upload artifact: ${artifactError.message}`);
      // Don't fail the action if uploading fails
    }
}

function generateCommentBody(scaFixReportMd) {
    return `## Veracode Fix for SCA Workflow Completed (Placeholder for actual comment content)

No automated fixes were generated for the selected vulnerabilities.

<details>
<summary>Result</summary>

${scaFixReportMd}

</details>

`;

}

module.exports = uploadNoPrComment;
