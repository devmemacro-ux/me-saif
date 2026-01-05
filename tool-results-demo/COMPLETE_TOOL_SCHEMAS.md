# Complete Tool List with Full Schemas

## 1. execute_bash
```json
{
  "name": "execute_bash",
  "description": "Execute the specified bash command.",
  "parameters": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "description": "Bash command to execute"
      },
      "summary": {
        "type": "string",
        "description": "A brief explanation of what the command does"
      }
    },
    "required": ["command"]
  }
}
```

---

## 2. fs_read
```json
{
  "name": "fs_read",
  "description": "Tool for reading files, directories and images. Always provide an 'operations' array.\n\nFor single operation: provide array with one element.\nFor batch operations: provide array with multiple elements.\n\nAvailable modes:\n- Line: Read lines from a file\n- Directory: List directory contents\n- Search: Search for patterns in files\n- Image: Read and process images\n\nExamples:\n1. Single: {\"operations\": [{\"mode\": \"Line\", \"path\": \"/file.txt\"}]}\n2. Batch: {\"operations\": [{\"mode\": \"Line\", \"path\": \"/file1.txt\"}, {\"mode\": \"Search\", \"path\": \"/file2.txt\", \"pattern\": \"test\"}]}",
  "parameters": {
    "type": "object",
    "properties": {
      "operations": {
        "type": "array",
        "description": "Array of operations to execute. Provide one element for single operation, multiple for batch.",
        "minItems": 1,
        "items": {
          "type": "object",
          "properties": {
            "mode": {
              "type": "string",
              "enum": ["Line", "Directory", "Search", "Image"],
              "description": "The operation mode to run in: `Line`, `Directory`, `Search`. `Line` and `Search` are only for text files, and `Directory` is only for directories. `Image` is for image files, in this mode `image_paths` is required."
            },
            "path": {
              "type": "string",
              "description": "Path to the file or directory. The path should be absolute, or otherwise start with ~ for the user's home (required for Line, Directory, Search modes)."
            },
            "start_line": {
              "type": "integer",
              "default": 1,
              "description": "Starting line number (optional, for Line mode). A negative index represents a line number starting from the end of the file."
            },
            "end_line": {
              "type": "integer",
              "default": -1,
              "description": "Ending line number (optional, for Line mode). A negative index represents a line number starting from the end of the file."
            },
            "pattern": {
              "type": "string",
              "description": "Pattern to search for (required, for Search mode). Case insensitive. The pattern matching is performed per line."
            },
            "context_lines": {
              "type": "integer",
              "default": 2,
              "description": "Number of context lines around search results (optional, for Search mode)"
            },
            "depth": {
              "type": "integer",
              "default": 0,
              "description": "Depth of a recursive directory listing (optional, for Directory mode)"
            },
            "max_entries": {
              "type": "integer",
              "default": 1000,
              "description": "Maximum number of entries to return (optional, for Directory mode). When limit is reached, results are truncated and metadata shows 'showing X of Y entries'. Use to prevent context window overflow. Default: 1000"
            },
            "offset": {
              "type": "integer",
              "default": 0,
              "description": "Number of entries to skip for pagination (optional, for Directory mode). Use with max_entries to iterate through large directories. Entries are sorted by last modified time (most recent first). Default: 0"
            },
            "exclude_patterns": {
              "type": "array",
              "items": {"type": "string"},
              "default": ["node_modules", ".git", "dist", "build", "out", ".cache", "target"],
              "description": "Glob patterns to exclude from directory listing (optional, for Directory mode). If omitted, uses defaults. If empty array [] is provided, no exclusions are applied (shows everything). If patterns are provided, they completely override the defaults. Examples: '**/target/**', '*.log'"
            },
            "image_paths": {
              "type": "array",
              "items": {"type": "string"},
              "description": "List of paths to the images. This is currently supported by the Image mode."
            }
          },
          "required": ["mode"]
        }
      },
      "summary": {
        "type": "string",
        "description": "Optional description of the purpose of this batch operation (mainly useful for multiple operations)"
      }
    },
    "required": ["operations"]
  }
}
```

---

## 3. fs_write
```json
{
  "name": "fs_write",
  "description": "A tool for creating and editing files\n * The `create` command will override the file at `path` if it already exists as a file, and otherwise create a new file\n * The `append` command will add content to the end of an existing file, automatically adding a newline if the file doesn't end with one. The file must exist.\n Notes for using the `str_replace` command:\n * The `old_str` parameter should match EXACTLY one or more consecutive lines from the original file. Be mindful of whitespaces!\n * If the `old_str` parameter is not unique in the file, the replacement will not be performed. Make sure to include enough context in `old_str` to make it unique\n * The `new_str` parameter should contain the edited lines that should replace the `old_str`.",
  "parameters": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "enum": ["create", "str_replace", "insert", "append"],
        "description": "The commands to run. Allowed options are: `create`, `str_replace`, `insert`, `append`."
      },
      "path": {
        "type": "string",
        "description": "Absolute path to file or directory, e.g. `/repo/file.py` or `/repo`."
      },
      "file_text": {
        "type": "string",
        "description": "Required parameter of `create` command, with the content of the file to be created."
      },
      "old_str": {
        "type": "string",
        "description": "Required parameter of `str_replace` command containing the string in `path` to replace."
      },
      "new_str": {
        "type": "string",
        "description": "Required parameter of `str_replace` command containing the new string. Required parameter of `insert` command containing the string to insert. Required parameter of `append` command containing the content to append to the file."
      },
      "insert_line": {
        "type": "integer",
        "description": "Required parameter of `insert` command. The `new_str` will be inserted AFTER the line `insert_line` of `path`."
      },
      "summary": {
        "type": "string",
        "description": "A brief explanation of what the file change does or why it's being made."
      }
    },
    "required": ["command", "path"]
  }
}
```

---

## 4. glob
```json
{
  "name": "glob",
  "description": "Find files and directories whose paths match a glob pattern. Respects .gitignore. Prefer this over the bash 'find' command for listing or discovering paths. Returns JSON with totalFiles (count found), truncated (true if limited), and filePaths array. When truncated is true, just mention results are truncated, don't state the limit number.",
  "parameters": {
    "type": "object",
    "properties": {
      "pattern": {
        "type": "string",
        "description": "Glob pattern, e.g. \"**/*.rs\", \"src/**/*.{ts,tsx}\" or \"**/test*\"."
      },
      "path": {
        "type": "string",
        "description": "Root directory to search from. Only set this when the user explicitly mentions a directory path. In all other cases, omit this so the tool searches from the current working directory (the project root)."
      },
      "limit": {
        "type": "integer",
        "description": "Maximum files to return. If totalFiles exceeds this, truncated will be true."
      },
      "max_depth": {
        "type": "integer",
        "description": "Maximum directory depth to traverse. Increase for deep nested structures."
      }
    },
    "required": ["pattern"]
  }
}
```

---

## 5. grep
```json
{
  "name": "grep",
  "description": "Fast text pattern search in files using regex. ALWAYS use this tool instead of 'grep', 'rg', or 'ag' commands in bash. Respects .gitignore.\n\n## Text Discovery Only\nUse grep for literal text/pattern matching: error messages, TODOs, config values, regex patterns.\n\n## For Semantic Code Understanding → Use 'code' tool if available\n- Finding symbol definitions or usages → code tool (search_symbols, goto_definition, find_references)\n- Understanding code structure/relationships → code tool\n- Distinguishing definition vs call vs import → code tool\n\n## Fallback\nIf the 'code' tool is available but returns insufficient symbol info, use grep to discover candidate files/lines, then return to 'code' for precise navigation.\n\nWhen you use this tool, prefer to show the user a small list of representative matches (including file paths and line numbers) instead of only giving a high-level summary.",
  "parameters": {
    "type": "object",
    "properties": {
      "pattern": {
        "type": "string",
        "description": "Regex pattern to search for. Examples: \"fn main\", \"class.*Component\", \"TODO|FIXME\". Start with simple patterns first (e.g. just the word you're looking for), then refine if needed."
      },
      "path": {
        "type": "string",
        "description": "Directory to search from. Defaults to current working directory."
      },
      "case_sensitive": {
        "type": "boolean",
        "description": "Case-sensitive search. Defaults to false (case-insensitive)."
      },
      "include": {
        "type": "string",
        "description": "File filter glob. Examples: \"*.rs\", \"*.{ts,tsx}\", \"*.py\""
      },
      "max_depth": {
        "type": "integer",
        "description": "Max directory depth to traverse when searching (search limit). Increase for deeply nested structures."
      },
      "max_files": {
        "type": "integer",
        "description": "Max number of files returned (output limit). Increase for comprehensive codebase searches."
      },
      "max_matches_per_file": {
        "type": "integer",
        "description": "Max matches returned per file (output limit). Increase to see all occurrences in a file."
      },
      "max_total_lines": {
        "type": "integer",
        "description": "Max total matched lines returned across all files (output limit). Increase when searching for many occurrences."
      },
      "output_mode": {
        "type": "string",
        "enum": ["content", "files_with_matches", "count"],
        "description": "Output format: 'content' returns matches as 'file:line:content' (default, best for seeing actual matches), 'files_with_matches' returns only file paths, 'count' returns match counts per file."
      }
    },
    "required": ["pattern"]
  }
}
```

---

## 6. web_search
```json
{
  "name": "web_search",
  "description": "WebSearch looks up information that is outside the model's training data or cannot be reliably inferred from the current codebase/context.\nTool performs basic compliance wrt content licensing and restriction.\nAs an agent you are responsible for adhering to compliance and attribution requirements.\nIMPORTANT: The snippets often contain enough information to answer questions - only use web_fetch if you need more detailed content from a specific webpage.\n\n## When to Use\n- When the user asks for current or up-to-date information (e.g., pricing, versions, technical specs) or explicitly requests a web search.\n- When verifying information that may have changed recently, or when the user provides a specific URL to inspect.\n\n## When NOT to Use\n- When the question involves basic concepts, historical facts, or well-established programming syntax/technical documentation.\n- When the topic does not require current or evolving information.\n- If the query concerns non-coding topics (e.g., news, current affairs, religion, economics, society). You must not invoke this tool.\n\nFor any code-related tasks, follow this order:\n1. Search within the repository (if tools are available) and check if it can be inferred from existing code or documentation.\n2. Use this tool only if still unresolved and the library/data is likely new/unseen.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query - can be keywords, questions, or specific topics"
      }
    },
    "required": ["query"]
  }
}
```

---

## 7. web_fetch
```json
{
  "name": "web_fetch",
  "description": "Fetch and extract content from a specific URL. Supports three modes: 'selective' (default, extracts relevant sections around search terms), 'truncated' (first 8000 chars), 'full' (complete content). Use 'selective' mode to read specific parts of a page multiple times without filling context. Provide 'search_terms' in selective mode to find relevant sections (e.g., 'pricing', 'installation').",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "URL to fetch content from"
      },
      "mode": {
        "type": "string",
        "enum": ["selective", "truncated", "full"],
        "description": "Extraction mode: 'selective' for smart extraction (default), 'truncated' for first 8000 chars, 'full' for complete content"
      },
      "search_terms": {
        "type": "string",
        "description": "Optional: Keywords to find in selective mode (e.g., 'pricing cost', 'installation setup'). Returns ~10 lines before and after matches. If not provided, returns beginning of page."
      }
    },
    "required": ["url"]
  }
}
```

---

## 8. use_aws
```json
{
  "name": "use_aws",
  "description": "Make an AWS CLI api call with the specified service, operation, and parameters. All arguments MUST conform to the AWS CLI specification. Should the output of the invocation indicate a malformed command, invoke help to obtain the the correct command.",
  "parameters": {
    "type": "object",
    "properties": {
      "region": {
        "type": "string",
        "description": "Region name for calling the operation on AWS."
      },
      "service_name": {
        "type": "string",
        "pattern": "^[^-].*",
        "description": "The name of the AWS service. If you want to query s3, you should use s3api if possible. Must not start with a dash (-)."
      },
      "operation_name": {
        "type": "string",
        "description": "The name of the operation to perform."
      },
      "parameters": {
        "type": "object",
        "description": "The parameters for the operation. The parameter keys MUST conform to the AWS CLI specification. You should prefer to use JSON Syntax over shorthand syntax wherever possible. For parameters that are booleans, prioritize using flags with no value. Denote these flags with flag names as key and an empty string as their value. You should also prefer kebab case."
      },
      "label": {
        "type": "string",
        "description": "Human readable description of the api that is being called."
      },
      "profile_name": {
        "type": "string",
        "description": "Optional: AWS profile name to use from ~/.aws/credentials. Defaults to default profile if not specified."
      }
    },
    "required": ["region", "service_name", "operation_name", "label"]
  }
}
```

---

## 9. use_subagent
```json
{
  "name": "use_subagent",
  "description": "⚠️ CRITICAL DELEGATION TOOL ⚠️\n\n🔍 BEFORE attempting ANY task, CHECK if you have the required tools in YOUR current tool list.\n\n❌ If you DON'T have the necessary tools → YOU MUST use this tool to delegate to a subagent that does.\n✅ If you DO have the tools → Handle the task yourself.\n\n## When to Use (MANDATORY scenarios):\n\n1. **MISSING TOOLS**: The user asks you to do something but you don't see the required tool in your available tools list\n   - Example: User asks to read a file, but you don't have 'fs_read' → USE THIS TOOL\n   - Example: User asks to search code, but you don't have 'code' tool → USE THIS TOOL\n   - Example: User asks to run bash command, but you don't have 'execute_bash' → USE THIS TOOL\n\n2. **PARALLEL PROCESSING**: A complex task can be split into independent subtasks that different specialized agents can handle simultaneously\n\n3. **CAPABILITY CHECK**: Use ListAgents command first to see what specialized agents and their toolsets are available\n\n## How Subagents Are Different:\n- Subagents have DIFFERENT, SPECIALIZED toolsets than you\n- Each subagent may have tools you don't have access to\n- They operate independently with their own context\n- Up to 4 subagents can work in parallel\n\n## Decision Flow:\n```\nUser makes request → Check YOUR tools list → Missing required tool? → USE use_subagent\n                                          → Have required tool? → Handle it yourself\n```\n\n⚡ Remember: Don't apologize about lacking tools - just delegate to a subagent that has them! Also note that subagents that are spawned together could not communicate with each other. If they are to perform tasks that are dependent on each other. Spawn them with a different tool call!",
  "parameters": {
    "type": "object",
    "properties": {
      "command": {
        "type": "string",
        "enum": ["ListAgents", "InvokeSubagents"],
        "description": "The commands to run. Allowed options are `ListAgents` to query available agents, or `InvokeSubagents` to invoke one or more subagents"
      },
      "content": {
        "type": "object",
        "description": "Required for `InvokeSubagents` command. Contains subagents array and optional conversation ID.",
        "properties": {
          "subagents": {
            "type": "array",
            "description": "Array of subagent invocations to execute in parallel. Each invocation specifies a query, optional agent name, and optional context.",
            "items": {
              "type": "object",
              "properties": {
                "query": {
                  "type": "string",
                  "description": "The query or task to be handled by the subagent"
                },
                "agent_name": {
                  "type": "string",
                  "description": "Optional name of the specific agent to use. If not provided, uses the default agent"
                },
                "relevant_context": {
                  "type": "string",
                  "description": "Optional additional context that should be provided to the subagent to help it understand the task better"
                }
              },
              "required": ["query"]
            }
          }
        },
        "required": ["subagents"]
      }
    },
    "required": ["command"]
  }
}
```

---

## 10. introspect
```json
{
  "name": "introspect",
  "description": "ALWAYS use this tool when users ask ANY question about Q CLI itself, its capabilities, features, commands, or functionality. This includes questions like 'Can you...', 'Do you have...', 'How do I...', 'What can you do...', or any question about Q's abilities. When mentioning commands in your response, always prefix them with '/' (e.g., '/save', '/load', '/context'). CRITICAL: Only provide information explicitly documented in Q CLI documentation. If details about any tool, feature, or command are not documented, clearly state the information is not available rather than generating assumptions.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The user's question about Q CLI usage, features, or capabilities"
      }
    },
    "required": []
  }
}
```

---

## 11. report_issue
```json
{
  "name": "report_issue",
  "description": "Opens the browser to a pre-filled gh (GitHub) issue template to report chat issues, bugs, or feature requests. Pre-filled information includes the conversation transcript, chat context, and chat request IDs from the service.",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The title of the GitHub issue."
      },
      "steps_to_reproduce": {
        "type": "string",
        "description": "Optional: Previous user chat requests or steps that were taken that may have resulted in the issue or error response."
      },
      "expected_behavior": {
        "type": "string",
        "description": "Optional: The expected chat behavior or action that did not happen."
      },
      "actual_behavior": {
        "type": "string",
        "description": "Optional: The actual chat behavior that happened and demonstrates the issue or lack of a feature."
      }
    },
    "required": ["title"]
  }
}
```

---

## 12. dummy
```json
{
  "name": "dummy",
  "description": "This is a dummy tool. If you are seeing this that means the tool associated with this tool call is not in the list of available tools. This could be because a wrong tool name was supplied or the list of tools has changed since the conversation has started. Do not show this when user asks you to list tools.",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```
