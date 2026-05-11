$ErrorActionPreference = 'Stop'

git config core.hooksPath .githooks
Write-Host 'Configured Git to use hooks from .githooks'
Write-Host 'The pre-push hook now runs the selected gate in .githooks/pre-push for CI-gated changes.'
Write-Host 'Default gate: F4 MockRunner. Switch PRE_PUSH_SUITE to f1 in .githooks/pre-push to demo a failing F1 gate.'
