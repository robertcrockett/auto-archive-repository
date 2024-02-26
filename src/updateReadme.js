// Scenarios
// 1. No README.md file exists in the repository
// 2. README.md file exists

const fs = require('fs')

const commitMessage = 'Add a note that this repository has been archived'
const commitContent =
  'This repository has been archived and is no longer maintained.'
const commitSHA = 'master'
