Automatic cycle handler:

1. Read workflow_state.md
2. Check Phase:
   - READY_FOR_IMPLEMENTATION: Execute the full plan (same behavior as /project:implement-plan)
   - VALIDATE or IMPLEMENTATION_COMPLETE: Report "Implementation complete. Switch to Strategic Planner mode in Cursor for GPT 5.2 to review and plan next cycle."
   - IDLE: Report "No plan exists. Switch to Strategic Planner mode in Cursor."
