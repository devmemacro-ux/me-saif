# AI Agent System Tools Documentation

## 1. grep
Fast text pattern search in files using regex. ALWAYS use this tool instead of 'grep', 'rg', or 'ag' commands in bash. Respects .gitignore.

### Text Discovery Only
Use grep for literal text/pattern matching: error messages, TODOs, config values, regex patterns.

### For Semantic Code Understanding → Use 'code' tool if available
- Finding symbol definitions or usages → code tool (search_symbols, goto_definition, find_references)
- Understanding code structure/relationships → code tool
- Distinguishing definition vs call vs import → code tool

### Fallback
If the 'code' tool is available but returns insufficient symbol info, use grep to discover candidate files/lines, then return to 'code' for precise navigation.

When you use this tool, prefer to show the user a small list of representative matches (including file paths and line numbers) instead of only giving a high-level summary.

**Parameters:**
```json
{
  "pattern": "Regex pattern to search for. Examples: \"fn main\", \"class.*Component\", \"TODO|FIXME\". Start with simple patterns first (e.g. just the word you're looking for), then refine if needed.",
  "path": "Directory to search from. Defaults to current working directory.",
  "case_sensitive": "Case-sensitive search. Defaults to false (case-insensitive).",
  "include": "File filter glob. Examples: \"*.rs\", \"*.{ts,tsx}\", \"*.py\"",
  "max_depth": "Max directory depth to traverse when searching (search limit). Increase for deeply nested structures.",
  "max_files": "Max number of files returned (output limit). Increase for comprehensive codebase searches.",
  "max_matches_per_file": "Max matches returned per file (output limit). Increase to see all occurrences in a file.",
  "max_total_lines": "Max total matched lines returned across all files (output limit). Increase when searching for many occurrences.",
  "output_mode": "Output format: 'content' returns matches as 'file:line:content' (default, best for seeing actual matches), 'files_with_matches' returns only file paths, 'count' returns match counts per file."
}
```

---

## 2. glob
Find files and directories whose paths match a glob pattern. Respects .gitignore. Prefer this over the bash 'find' command for listing or discovering paths. Returns JSON with totalFiles (count found), truncated (true if limited), and filePaths array. When truncated is true, just mention results are truncated, don't state the limit number.

**Parameters:**
```json
{
  "pattern": "Glob pattern, e.g. \"**/*.rs\", \"src/**/*.{ts,tsx}\" or \"**/test*\".",
  "path": "Root directory to search from. Only set this when the user explicitly mentions a directory path. In all other cases, omit this so the tool searches from the current working directory (the project root).",
  "limit": "Maximum files to return. If totalFiles exceeds this, truncated will be true.",
  "max_depth": "Maximum directory depth to traverse. Increase for deep nested structures."
}
```

---

## 3. fs_read
Tool for reading files, directories and images. Always provide an 'operations' array.

For single operation: provide array with one element.
For batch operations: provide array with multiple elements.

### Available modes:
- Line: Read lines from a file
- Directory: List directory contents
- Search: Search for patterns in files
- Image: Read and process images

### Examples:
1. Single: `{"operations": [{"mode": "Line", "path": "/file.txt"}]}`
2. Batch: `{"operations": [{"mode": "Line", "path": "/file1.txt"}, {"mode": "Search", "path": "/file2.txt", "pattern": "test"}]}`

**Parameters:**
```json
{
  "operations": "Array of operations to execute. Provide one element for single operation, multiple for batch.",
  "summary": "Optional description of the purpose of this batch operation (mainly useful for multiple operations)"
}
```

### Operation Properties:
```json
{
  "mode": "The operation mode to run in: `Line`, `Directory`, `Search`. `Line` and `Search` are only for text files, and `Directory` is only for directories. `Image` is for image files, in this mode `image_paths` is required.",
  "path": "Path to the file or directory. The path should be absolute, or otherwise start with ~ for the user's home (required for Line, Directory, Search modes).",
  "start_line": "Starting line number (optional, for Line mode). A negative index represents a line number starting from the end of the file. Default: 1",
  "end_line": "Ending line number (optional, for Line mode). A negative index represents a line number starting from the end of the file. Default: -1",
  "pattern": "Pattern to search for (required, for Search mode). Case insensitive. The pattern matching is performed per line.",
  "context_lines": "Number of context lines around search results (optional, for Search mode). Default: 2",
  "depth": "Depth of a recursive directory listing (optional, for Directory mode). Default: 0",
  "max_entries": "Maximum number of entries to return (optional, for Directory mode). When limit is reached, results are truncated and metadata shows 'showing X of Y entries'. Use to prevent context window overflow. Default: 1000",
  "offset": "Number of entries to skip for pagination (optional, for Directory mode). Use with max_entries to iterate through large directories. Entries are sorted by last modified time (most recent first). Default: 0",
  "exclude_patterns": "Glob patterns to exclude from directory listing (optional, for Directory mode). If omitted, uses defaults. If empty array [] is provided, no exclusions are applied (shows everything). If patterns are provided, they completely override the defaults. Examples: '**/target/**', '*.log'. Default: [\"node_modules\", \".git\", \"dist\", \"build\", \"out\", \".cache\", \"target\"]",
  "image_paths": "List of paths to the images. This is currently supported by the Image mode."
}
```

---

## 4. fs_write
A tool for creating and editing files.
- The `create` command will override the file at `path` if it already exists as a file, and otherwise create a new file
- The `append` command will add content to the end of an existing file, automatically adding a newline if the file doesn't end with one. The file must exist.

### Notes for using the `str_replace` command:
- The `old_str` parameter should match EXACTLY one or more consecutive lines from the original file. Be mindful of whitespaces!
- If the `old_str` parameter is not unique in the file, the replacement will not be performed. Make sure to include enough context in `old_str` to make it unique
- The `new_str` parameter should contain the edited lines that should replace the `old_str`.

**Parameters:**
```json
{
  "command": "The commands to run. Allowed options are: `create`, `str_replace`, `insert`, `append`.",
  "path": "Absolute path to file or directory, e.g. `/repo/file.py` or `/repo`.",
  "file_text": "Required parameter of `create` command, with the content of the file to be created.",
  "old_str": "Required parameter of `str_replace` command containing the string in `path` to replace.",
  "new_str": "Required parameter of `str_replace` command containing the new string. Required parameter of `insert` command containing the string to insert. Required parameter of `append` command containing the content to append to the file.",
  "insert_line": "Required parameter of `insert` command. The `new_str` will be inserted AFTER the line `insert_line` of `path`.",
  "summary": "A brief explanation of what the file change does or why it's being made."
}
```

---

## 5. execute_bash
Execute the specified bash command.

**Parameters:**
```json
{
  "command": "Bash command to execute",
  "summary": "A brief explanation of what the command does"
}
```

---

## 6. web_search
WebSearch looks up information that is outside the model's training data or cannot be reliably inferred from the current codebase/context.
Tool performs basic compliance wrt content licensing and restriction.
As an agent you are responsible for adhering to compliance and attribution requirements.
IMPORTANT: The snippets often contain enough information to answer questions - only use web_fetch if you need more detailed content from a specific webpage.

### When to Use
- When the user asks for current or up-to-date information (e.g., pricing, versions, technical specs) or explicitly requests a web search.
- When verifying information that may have changed recently, or when the user provides a specific URL to inspect.

### When NOT to Use
- When the question involves basic concepts, historical facts, or well-established programming syntax/technical documentation.
- When the topic does not require current or evolving information.
- If the query concerns non-coding topics (e.g., news, current affairs, religion, economics, society). You must not invoke this tool.

For any code-related tasks, follow this order:
1. Search within the repository (if tools are available) and check if it can be inferred from existing code or documentation.
2. Use this tool only if still unresolved and the library/data is likely new/unseen.

**Parameters:**
```json
{
  "query": "Search query - can be keywords, questions, or specific topics"
}
```

---

## 7. web_fetch
Fetch and extract content from a specific URL. Supports three modes: 'selective' (default, extracts relevant sections around search terms), 'truncated' (first 8000 chars), 'full' (complete content). Use 'selective' mode to read specific parts of a page multiple times without filling context. Provide 'search_terms' in selective mode to find relevant sections (e.g., 'pricing', 'installation').

**Parameters:**
```json
{
  "url": "URL to fetch content from",
  "mode": "Extraction mode: 'selective' for smart extraction (default), 'truncated' for first 8000 chars, 'full' for complete content",
  "search_terms": "Optional: Keywords to find in selective mode (e.g., 'pricing cost', 'installation setup'). Returns ~10 lines before and after matches. If not provided, returns beginning of page."
}
```

---

## 8. use_aws
Make an AWS CLI api call with the specified service, operation, and parameters. All arguments MUST conform to the AWS CLI specification. Should the output of the invocation indicate a malformed command, invoke help to obtain the the correct command.

**Parameters:**
```json
{
  "region": "Region name for calling the operation on AWS.",
  "service_name": "The name of the AWS service. If you want to query s3, you should use s3api if possible. Must not start with a dash (-).",
  "operation_name": "The name of the operation to perform.",
  "parameters": "The parameters for the operation. The parameter keys MUST conform to the AWS CLI specification. You should prefer to use JSON Syntax over shorthand syntax wherever possible. For parameters that are booleans, prioritize using flags with no value. Denote these flags with flag names as key and an empty string as their value. You should also prefer kebab case.",
  "label": "Human readable description of the api that is being called.",
  "profile_name": "Optional: AWS profile name to use from ~/.aws/credentials. Defaults to default profile if not specified."
}
```

---

## 9. use_subagent
⚠️ CRITICAL DELEGATION TOOL ⚠️

🔍 BEFORE attempting ANY task, CHECK if you have the required tools in YOUR current tool list.

❌ If you DON'T have the necessary tools → YOU MUST use this tool to delegate to a subagent that does.
✅ If you DO have the tools → Handle the task yourself.

### When to Use (MANDATORY scenarios):

1. **MISSING TOOLS**: The user asks you to do something but you don't see the required tool in your available tools list
   - Example: User asks to read a file, but you don't have 'fs_read' → USE THIS TOOL
   - Example: User asks to search code, but you don't have 'code' tool → USE THIS TOOL
   - Example: User asks to run bash command, but you don't have 'execute_bash' → USE THIS TOOL

2. **PARALLEL PROCESSING**: A complex task can be split into independent subtasks that different specialized agents can handle simultaneously

3. **CAPABILITY CHECK**: Use ListAgents command first to see what specialized agents and their toolsets are available

### How Subagents Are Different:
- Subagents have DIFFERENT, SPECIALIZED toolsets than you
- Each subagent may have tools you don't have access to
- They operate independently with their own context
- Up to 4 subagents can work in parallel

### Decision Flow:
```
User makes request → Check YOUR tools list → Missing required tool? → USE use_subagent
                                          → Have required tool? → Handle it yourself
```

⚡ Remember: Don't apologize about lacking tools - just delegate to a subagent that has them! Also note that subagents that are spawned together could not communicate with each other. If they are to perform tasks that are dependent on each other. Spawn them with a different tool call!

**Parameters:**
```json
{
  "command": "The commands to run. Allowed options are `ListAgents` to query available agents, or `InvokeSubagents` to invoke one or more subagents",
  "content": "Required for `InvokeSubagents` command. Contains subagents array and optional conversation ID."
}
```

### Content Structure:
```json
{
  "subagents": [
    {
      "query": "The query or task to be handled by the subagent",
      "agent_name": "Optional name of the specific agent to use. If not provided, uses the default agent",
      "relevant_context": "Optional additional context that should be provided to the subagent to help it understand the task better"
    }
  ]
}
```
