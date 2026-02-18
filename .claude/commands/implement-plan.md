Read workflow_state.md in the project root. Check the Phase field under ## State.

If Phase is READY_FOR_IMPLEMENTATION:
1. Read the complete ## Plan section
2. Read the ## Context section for architectural decisions
3. Execute every numbered task in ## Plan sequentially
4. After each task:
   - Mark it [x] in ## Plan
   - Append a timestamped log entry to ## Log describing what was done
   - Run relevant tests or linters if they exist
5. After all tasks complete:
   - Set Phase to VALIDATE under ## State
   - Set Status to IMPLEMENTATION_COMPLETE
   - Update LastUpdated
   - Write a detailed ## CompletionReport: files created, files modified, tests passed, deviations from plan and why

If Phase is NOT READY_FOR_IMPLEMENTATION:
- Report current Phase and Status
- Tell user to switch to Strategic Planner mode in Cursor to create a plan
