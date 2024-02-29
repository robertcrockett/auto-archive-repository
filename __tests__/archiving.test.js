/**
 * Unit tests for src/updateReadme.js
 */
const { expect } = require('@jest/globals')
const { createHmac } = require('node:crypto')
const { Octokit } = require('@octokit/rest')
const { getFileSHA, downloadFile } = require('../src/archiving')

// TODO: Mock the Octokit module and return values for the tests
// jest.mock('@octokit/rest', () => {
// Remove tokens
// Mock response for error handling
// Mock response for error on downloading file

// Mock the Octokit module
jest.mock('@octokit/rest')

describe('archiving.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Cannot find repository', async () => {
    const owner = ''
    const repo = 'bogus_repo'
    const path = 'README.md'
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 404,
      response: {
        message: 'Not Found',
        status: 404,
        headers: {
          'x-ratelimit-limit': '60'
        }
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(getFileSHA(owner, repo, path, token)).rejects.toThrow(
      'Cannot find repository or file'
    )
  })

  it('Invalid token', async () => {
    const owner = ''
    const repo = 'archive_test'
    const path = 'README.md'
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 401,
      response: {
        message: 'Bad credentials were provided.',
        status: 401,
        headers: {
          'x-ratelimit-limit': '60'
        }
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(getFileSHA(owner, repo, path, token)).rejects.toThrow(
      'Bad credentials were provided.'
    )
  })

  it('Testing token rate_limits', async () => {
    const owner = ''
    const repo = 'archive_test'
    const path = 'README.md'
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 403,
      response: {
        message: 'You have exceeded your rate limit.',
        status: 403,
        headers: {
          'x-ratelimit-limit': '0',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1709160095',
          'x-ratelimit-resource': 'core',
          'x-ratelimit-used': '1',
          'x-xss-protection': '0'
        }
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(getFileSHA(owner, repo, path, token)).rejects.toThrow(
      'You have exceeded your rate limit.'
    )
  })

  it('Retrieves the file sha', async () => {
    const owner = ''
    const repo = 'archive_test'
    const path = 'README.md'
    const token = ''

    // Mock a random SHA to return. This has does not map to any real data.
    const randomized_sha = createHmac('sha-1', 'random')
      .update('random')
      .digest('hex')

    const request = () =>
      new Promise((resolve, reject) => {
        resolve({
          status: 200,
          data: { sha: randomized_sha }
        })
      })
    Octokit.mockImplementation(() => ({ request }))

    expect(await getFileSHA(owner, repo, path, token)).toBe(randomized_sha)
  })

  it('Retrieves the file contents', async () => {
    const owner = ''
    const repo = 'archive_test'
    const file_sha = ''
    const token = ''

    const request = () =>
      new Promise((resolve, reject) => {
        resolve({
          status: 200,
          data: {
            content: `# archive_test\nA test repo for auto archiving action.\n`
          }
        })
      })
    Octokit.mockImplementation(() => ({ request }))

    expect(await downloadFile(owner, repo, file_sha, token)).toBe(
      `# archive_test\nA test repo for auto archiving action.\n`
    )
  })

  it('Error thrown when a file fails to download', async () => {
    const owner = ''
    const repo = 'archive_test'
    const file_sha = ''
    const token = ''

    // Mock up an error response
    const errResponse = {
      status: 404,
      response: {
        message: 'Cannot download file.'
      }
    }

    // Reject the mocked up error response
    const request = () =>
      new Promise((resolve, reject) => {
        reject(errResponse)
      })
    // Mock the Octokit module and return the mocked up error response
    Octokit.mockImplementation(() => ({ request }))

    await expect(downloadFile(owner, repo, file_sha, token)).rejects.toThrow(
      'Cannot download file.'
    )
  })
})
