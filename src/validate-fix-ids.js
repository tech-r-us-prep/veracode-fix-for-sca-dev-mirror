const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

function validateFixIds(fixScaParams, workspaceDir) {
  // Parse Fix IDs from comma-separated string
  const requestedFixIds = fixScaParams.split(',').map(id => id.trim()).filter(id => id.length > 0);

  // Read the veracode-cli.vuln.listing.json file
  const vulnListingPath = path.join(workspaceDir, 'veracode_artifact_directory/sca-vuln-listing-json', 'veracode-cli.vuln.listing.json');

  if (!fs.existsSync(vulnListingPath)) {
    core.error(`Vulnerability listing file not found at: ${vulnListingPath}`);
    return [ false, [ "Unable to process due to missing vulnerability listing file from SCA scan run" ] ];
  }

  let vulnListingData;
  try {
    const fileContent = fs.readFileSync(vulnListingPath, 'utf8');
    vulnListingData = JSON.parse(fileContent);
  } catch (error) {
    core.error(`Failed to read or parse vulnerability listing file: ${error.message}`);
    return [ false, [ "Unable to process due to failure in reading the vulnerability listing file from SCA scan run" ] ];
  }

  // Extract all valid fix_ids from the vulnerability listing
  const validFixIds = vulnListingData.map(vuln => vuln.fix_id);

  // Check for invalid Fix IDs
  const invalidFixIds = requestedFixIds.filter(id => !validFixIds.includes(id));

  if (invalidFixIds.length > 0) {
    core.error(`Invalid Fix IDs detected: ${invalidFixIds.join(', ')}. These Fix IDs do not exist in the vulnerability listing.`);
    return [false, `Invalid unknown Fix ID(s) supplied: ${invalidFixIds.join(',')}. Please supply valid Fix IDs.` ];
  }

  const infoMsg = `All Fix IDs are valid: ${requestedFixIds.join(', ')}`
  core.info(infoMsg);
  return [ true, [ infoMsg ] ];
}

module.exports = validateFixIds;
