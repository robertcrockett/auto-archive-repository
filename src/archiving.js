// Scenarios
// 1. No README.md file exists in the repository
// 2. README.md file exists
const { Octokit } = require('@octokit/rest')

/**
 * Returns the list of repositories for the specified organization.
 *
 * @param organization - The GitHub organization.
 * @param token - The GitHub PAT token to use for the request.
 * @returns A Promise representing the repositories in the GitHub organization.
 *
 */
async function listRepositories(org, token) {
  // Create a new instance of the GitHub API helper module octokit
  const octokit = new Octokit({
    // Set the authentication token for the request
    auth: `${token}`
  })

  try {
    // Asynchronous request to retrieve the list of repositories for the specified organization
    const response = await octokit.request(`GET /orgs/${org}/repos`, {
      // Include the preferred API version
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    // Return the list of repositories for the specified organization
    return response.data
  } catch (error) {
    // Log an error that the organization cannot be found
    console.log(`Cannot find organization.`)
    throw new Error('Cannot find organization.')
  }
}

/**
 * Returns the File SHA of the specified file path in the GitHub repository.
 *
 * @param owner - The owner of the GitHub repository to retrieve the file SHA from.
 * @param repo - The name of the repository to retrieve the file SHA from.
 * @param path - The path and filename of the file in the repository.
 * @param token - The GitHub PAT token to use for the request.
 * @returns A Promise representing the SHA of the file in the GitHub repository.
 *
 */
async function getFileSHA(owner, repo, path, token) {
  // Create a new instance of the GitHub API helper module octokit
  const octokit = new Octokit({
    // Set the authentication token for the request
    auth: `${token}`
  })

  try {
    // Asynchronous request to the retrieve metadata for the specified file
    const response = await octokit.request(
      `GET /repos/${owner}/${repo}/contents/${path}`,
      {
        // Include the preferred API version
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    // The OctokitResponse returns an object with a specified sha
    const file_sha = JSON.stringify(response.data.sha)
    // This returns a quoted string, so we need to remove the quotes
    return file_sha.replace(/['"]+/g, '')
  } catch (error) {
    // Determine if the rate limit has been hit.
    if (
      error.response &&
      error.status === 403 &&
      error.response.headers['x-ratelimit-remaining'] === '0'
    ) {
      // Log an error that the rate limit has been exceeded
      console.log(`You have exceeded your rate limit.`)
      throw new Error('You have exceeded your rate limit.')
    } else if (error.response && error.status === 401) {
      // Log an error that bad credentials were provided
      console.log(`Bad credentials were provided.`)
      throw new Error('Bad credentials were provided.')
    } else {
      // Log an error that the respository cannot be found
      console.log(`Cannot find repository or file`)
      throw new Error('Cannot find repository or file')
    }
  }
}

/**
 * Returns the downloaded file as a string from the repository retrieved by the Blob SHA
 *
 * @param owner - The owner of the GitHub repository to retrieve the file from.
 * @param repo - The name of the repository to retrieve the file from.
 * @param file_sha - The sha of the file in the repository.
 * @param token - The GitHub PAT token to use for the request.
 * @returns A Promise that resolves to a string for the downloaded file from the GitHub repository.
 *
 */
async function downloadFile(owner, repo, file_sha, token) {
  // Create a new instance of the GitHub API helper module octokit
  const octokit = new Octokit({
    // Set the authentication token for the request
    auth: `${token}`
  })

  try {
    // Asynchronous request to the retrieve blob for the specified file
    const response = await octokit.request(
      `GET /repos/${owner}/${repo}/git/blobs/${file_sha}`,
      {
        // Include the preferred API version
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    // Retrieve the file content from the response
    return response.data.content
  } catch (error) {
    // Log an error that the file cannot be downloaded
    console.log('Error:', error)
    throw new Error('Cannot download file.')
  }
}

/**
 * Archives the specified repository.
 *
 * @param owner - The owner of the GitHub repository to archive.
 * @param repo - The name of the repository to archive.
 * @param token - The GitHub PAT token to use for the request.
 * @returns A Promise representing the archive status of the GitHub repository.
 *
 */
async function archiveRepository(owner, repo, token) {
  // Create a new instance of the GitHub API helper module octokit
  const octokit = new Octokit({
    // Set the authentication token for the request
    auth: `${token}`
  })

  try {
    // Asynchronous request to archive the specified repository
    const response = await octokit.request(`PATCH /repos/${owner}/${repo}`, {
      archived: true,
      // Include the preferred API version
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    // Return the status of the archived repository
    return response.data.archived
  } catch (error) {
    // Determine if the rate limit has been hit.
    if (error.response && error.status === 403) {
      // Log an error that access has been forbidden
      console.log(`Access has been forbidden.`)
      throw new Error('Access has been forbidden.')
    } else if (error.response && error.status === 404) {
      // Log an error that repository cannot be found
      console.log(`Repository cannot be found.`)
      throw new Error('Repository cannot be found.')
    } else {
      // Log an unknown error has occurred
      console.log(
        `An unknown error has occurred. The repository has not been archived.`
      )
      throw new Error(
        'An unknown error has occurred. The repository has not been archived.'
      )
    }
  }
}

module.exports = {
  listRepositories,
  getFileSHA,
  downloadFile,
  archiveRepository
}
