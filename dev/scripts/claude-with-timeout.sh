#!/bin/bash
# Claude Code launcher with timeout settings

export API_TIMEOUT_MS=600000
export BASH_DEFAULT_TIMEOUT_MS=300000
export BASH_MAX_TIMEOUT_MS=900000
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=50000

echo "Starting Claude Code with extended timeouts..."
echo "API_TIMEOUT_MS=$API_TIMEOUT_MS"
echo "BASH_DEFAULT_TIMEOUT_MS=$BASH_DEFAULT_TIMEOUT_MS"
echo "BASH_MAX_TIMEOUT_MS=$BASH_MAX_TIMEOUT_MS"

claude "$@"