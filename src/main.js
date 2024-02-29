const core = require('@actions/core')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // Obtain the inputs defined in the metadata file
    const github_pat_token = core.getInput('github_org_pat_token', {
      required: true
    })
    const github_org = core.getInput('github_org', { required: true })
    const github_repo = core.getInput('github_repo', { required: true })
    const inactive_days = core.getInput('github_repo_max_inactive_days', {
      required: true
    })
    const ignore_files = core.getInput('ignore_files', { required: false })
    const readme_message = core.getInput('readme_message', { required: false })

    // Validate the github_pat_token
    try {
      validate_token(github_pat_token)
    } catch (error) {
      console.log('Error validating PAT token: ', error.message)
      throw error
    }
    // Validate that the inactive_days variable is a number
    if (isNaN(inactive_days)) {
      throw new Error('github_repo_max_inactive_days not a number')
    }

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`github_pat_token: ${github_pat_token}`)
    core.debug(`github_org: ${github_org}`)
    core.debug(`github_repo: ${github_repo}`)
    core.debug(`inactive_days: ${inactive_days}`)
    core.debug(`ignore_files: ${ignore_files}`)
    core.debug(`readme_message: ${readme_message}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

/**
 * Validate the formatting of a GitHub personal access token
 *
 * @param {github_pat_token} The GitHub Personal Access Token to validate
 * @returns boolean indicating if the token is valid
 */
function validate_token(github_pat_token) {
  // A regular expression that starts with ghp_, is alphanumeric with NO special characters and is exactly 40 characters long
  const pat_regex = /^ghp_[a-zA-Z0-9]{36}$/
  const pat_length = 40
  const pat_start = 'ghp_'

  if (github_pat_token.length !== pat_length) {
    throw new Error('github_pat_token not 40 characters long')
  } else if (!github_pat_token.startsWith(pat_start)) {
    throw new Error('github_pat_token does not start with ghp_')
  } else if (!github_pat_token.match(pat_regex)) {
    throw new Error('github_pat_token contains special characters')
  } else {
    return true
  }
}

module.exports = {
  run
}
