/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("set the action's inputs", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'github_pat_token: ghp_111111111111111111111111111111111111'
    )
    expect(debugMock).toHaveBeenNthCalledWith(2, 'github_org: robertcrockett')
    expect(debugMock).toHaveBeenNthCalledWith(3, 'github_repo: archive_test')
    expect(debugMock).toHaveBeenNthCalledWith(4, 'inactive_days: 365')
  })

  it('fails if no github pat token input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          throw new Error(
            'Input required and not supplied: github_org_pat_token'
          )
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: github_org_pat_token'
    )
  })

  it('sets a failed status if pat token does not start with ghp_', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return '1111111111111111111111111111111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'github_pat_token not in a valid format'
    )
  })

  it('sets a failed status if pat token contains special characters', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_1111111111111_1111111[11111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'github_pat_token not in a valid format'
    )
  })

  it('sets a failed status if pat token is too short', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_1111too_short'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'github_pat_token not in a valid format'
    )
  })

  it('fails if no github org input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        case 'github_org':
          throw new Error('Input required and not supplied: github_org')
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: github_org'
    )
  })

  it('fails if no github repo input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          throw new Error('Input required and not supplied: github_repo')
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: github_repo'
    )
  })

  it('fails if no inactive days input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          throw new Error(
            'Input required and not supplied: github_repo_max_inactive_days'
          )
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: github_repo_max_inactive_days'
    )
  })

  it('sets a failed status if inactive days is not a number', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return 'this is not a number'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'github_repo_max_inactive_days not a number'
    )
  })

  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        case 'github_org':
          return 'robertcrockett'
        case 'github_repo':
          return 'archive_test'
        case 'github_repo_max_inactive_days':
          return '365'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'github_pat_token: ghp_111111111111111111111111111111111111'
    )
    expect(debugMock).toHaveBeenNthCalledWith(2, 'github_org: robertcrockett')
    expect(debugMock).toHaveBeenNthCalledWith(3, 'github_repo: archive_test')
    expect(debugMock).toHaveBeenNthCalledWith(4, 'inactive_days: 365')
    expect(debugMock).toHaveBeenNthCalledWith(5, 'Waiting 500 milliseconds ...')
    expect(debugMock).toHaveBeenNthCalledWith(
      6,
      expect.stringMatching(timeRegex)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      7,
      expect.stringMatching(timeRegex)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'time',
      expect.stringMatching(timeRegex)
    )
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        case 'github_org_pat_token':
          return 'ghp_111111111111111111111111111111111111'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'milliseconds not a number'
    )
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          throw new Error('Input required and not supplied: milliseconds')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: milliseconds'
    )
  })
})
