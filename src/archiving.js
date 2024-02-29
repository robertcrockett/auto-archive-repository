// Scenarios
// 1. No README.md file exists in the repository
// 2. README.md file exists
const fs = require('fs')
const { Octokit } = require('@octokit/rest')

const commitMessage = 'Add a note that this repository has been archived'
const commitContent =
  'This repository has been archived and is no longer maintained.'

/**
 * Returns the File SHA of the specified file path in the GitHub repository.
 *
 * @param owner - The owner of the GitHub repository to retrieve the file from.
 * @param repo - The name of the repository to retrieve the SBOM from.
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
        // Include the API version that includes the SBOM API
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    // The OctokitResponse returns an object with a specified sha
    const file_sha = JSON.stringify(response.data.sha)
    // This returns a quoted string, so we need to remove the quotes
    return file_sha.replace(/['"]+/g, '')
    //return file_sha
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
 * @param repo - The name of the repository to retrieve the SBOM from.
 * @param file_sha - The SHA of the file in the repository.
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
      `GET /repos/${owner}/${repo}/git/blobs/${file_sha}`
    )

    // Create a string from the base64 encoded file content
    const file_content = response.data.content
    return file_content
  } catch (error) {
    // Log an error that the file cannot be downloaded
    console.log('Error:', error)
    throw new Error('Cannot download file.')
  }
}

module.exports = { getFileSHA, downloadFile }
