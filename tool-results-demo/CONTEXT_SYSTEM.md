# AI Agent Context System

## How Context is Provided to the Agent

The agent receives context in a specific structured format within each user message.

### Message Structure
User turns follow this specific structure:

1. Zero or more context entries with the format:
```
--- CONTEXT ENTRY BEGIN ---
Context data and instructions here.
--- CONTEXT ENTRY END ---
```

2. Followed by the actual user message:
```
--- USER MESSAGE BEGIN ---
The message sent by the end user.
--- USER MESSAGE END ---
```

### Important Guidelines:
- Only respond to the content between USER MESSAGE BEGIN/END markers
- Use the context entries only as supporting information and guidance to help form your response
- Never refer to this message structure in your responses to users

---

## System Context
The agent receives system context that includes:
- Operating System (e.g., linux, darwin, windows)
- Current Directory (the working directory path)

Example:
```
System Context:
- Operating System: linux
- Current Directory: /home/user/project-name
```

---

## File Context
When relevant files exist in the project, they may be provided as context entries. For example:

```
--- CONTEXT ENTRY BEGIN ---
[/home/user/project/README.md]
# Project Name

Project description and documentation here...

--- CONTEXT ENTRY END ---
```

This allows the agent to:
- Understand the project structure
- Reference existing code and documentation
- Make informed suggestions based on the codebase

---

## Time Context
Current time may be provided:
```
--- CONTEXT ENTRY BEGIN ---
Current time: Monday, 2026-01-05T19:25:37.464+00:00
--- CONTEXT ENTRY END ---
```

---

## How to Use Context

1. **Prioritize user's question context** - Information in the user's question takes precedence
2. **Fill gaps with system context** - Use system context when user's question lacks details
3. **Ignore conflicting context** - If user's info disagrees with system context, ignore system context
4. **Consider OS differences** - Provide OS-appropriate paths and commands
5. **Be aware of working directory** - Use it for relative path suggestions
6. **Don't mention context source** - Just use the information naturally
