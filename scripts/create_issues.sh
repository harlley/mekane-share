#!/bin/bash
# Script to create GitHub issues from user stories

# Set your GitHub username and repository name
OWNER="harlley"
REPO="mekane-share"

# Create the main user story issue
echo "Creating main issue for US-002..."
ISSUE_URL=$(gh issue create --repo "$OWNER/$REPO" \
  --title "US-002: Screenshot Upload and Storage" \
  --body "$(cat .docs/user-stories/US-002/story.md)" \
  --label "enhancement" \
  --label "backend")

echo "Main issue created: $ISSUE_URL"

# Create task issues based on the tasks.md file
echo "Creating task issues from US-002/tasks.md..."

# These are the main sections from your tasks.md file
TASKS=(
  "Analysis and Preparation: Type Definitions" 
  "Unit Tests Implementation" 
  "Endpoint Implementation" 
  "Integration Tests" 
  "Documentation" 
  "Review and Refinement"
)

for task in "${TASKS[@]}"; do
  echo "Creating issue for task: $task"
  TASK_URL=$(gh issue create --repo "$OWNER/$REPO" \
    --title "US-002: $task" \
    --body "Task for US-002: Screenshot Upload and Storage. See details in .docs/user-stories/US-002/tasks.md" \
    --label "task")
  
  echo "Task issue created: $TASK_URL"
done

echo "All issues created! You can now add them to your project board through the GitHub web interface." 
