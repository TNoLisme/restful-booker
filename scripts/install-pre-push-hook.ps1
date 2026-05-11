$ErrorActionPreference = 'Stop'

git config core.hooksPath .githooks
Write-Host 'Configured Git to use hooks from .githooks'
Write-Host 'The pre-push hook now runs ApiTest when pushed commits include app-code changes.'
