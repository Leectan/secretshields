# Dual-Model Orchestration

This project uses a dual-model workflow:
- GPT 5.2 plans in Cursor Agent chat (writes to workflow_state.md)
- Claude Code implements in the terminal (reads from workflow_state.md)

## Before Any Implementation
1. Read workflow_state.md
2. Check Phase under ## State
3. Only proceed if Phase is READY_FOR_IMPLEMENTATION
4. Otherwise inform user and stop

## Implementation Protocol
1. Read ## Plan completely
2. Read ## Context for architectural decisions
3. Execute each task in order
4. After each task: mark [x] in ## Plan, append to ## Log
5. After all tasks: set Phase to VALIDATE, write ## CompletionReport

## Quick Commands
- /project:implement-plan — Execute the current plan
- /project:check-state — View workflow status dashboard
- /project:continue-cycle — Smart cycle handler

## Rules
- Never modify ## Plan text or ## Context content (only mark checkboxes)
- Only update: task checkboxes, ## Log, ## CompletionReport, ## State fields
