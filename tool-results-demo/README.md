# AI Agent Tools & Output Reference

## 1. execute_bash
Executes bash commands.

**Input:**
```json
{
  "command": "echo 'hello' && ls -la",
  "summary": "optional description"
}
```

**Output:**
```json
{
  "exit_status": "0",
  "stderr": "",
  "stdout": "hello\ntotal 12\ndrwxr-xr-x 2 user user 4096 Jan  5 19:15 .\n-rw-r--r-- 1 user user   75 Jan  5 19:15 test-file.txt"
}
```

---

## 2. fs_read

### Line Mode
**Input:**
```json
{
  "operations": [{
    "mode": "Line",
    "path": "/path/to/file.txt",
    "start_line": 1,
    "end_line": 3
  }]
}
```

**Output:** (Plain text)
```
Hello World
This is line 2
Search for this: KEYWORD
```

### Search Mode
**Input:**
```json
{
  "operations": [{
    "mode": "Search",
    "path": "/path/to/file.txt",
    "pattern": "KEYWORD",
    "context_lines": 1
  }]
}
```

**Output:**
```json
[{
  "line_number": 3,
  "context": "  2: This is line 2\n→ 3: Search for this: KEYWORD\n  4: Line 4 here\n"
}]
```

### Directory Mode
**Input:**
```json
{
  "operations": [{
    "mode": "Directory",
    "path": "/path/to/dir",
    "depth": 1,
    "max_entries": 1000,
    "exclude_patterns": ["node_modules", ".git"]
  }]
}
```

**Output:** (Plain text)
```
# Total entries: 1

-rw-r--r-- 1 1000 1000 75 Jan 05 19:15 /path/to/file.txt
```

### Image Mode
**Input:**
```json
{
  "operations": [{
    "mode": "Image",
    "image_paths": ["/path/to/image.png"]
  }]
}
```

---

## 3. fs_write

### Create
**Input:**
```json
{
  "command": "create",
  "path": "/path/to/file.txt",
  "file_text": "file content here",
  "summary": "optional description"
}
```

**Output:**
```xml
<system>Tool ran without output or errors</system>
```

### str_replace
**Input:**
```json
{
  "command": "str_replace",
  "path": "/path/to/file.txt",
  "old_str": "exact text to find",
  "new_str": "replacement text",
  "summary": "optional description"
}
```

**Output:**
```xml
<system>Tool ran without output or errors</system>
```

### Insert
**Input:**
```json
{
  "command": "insert",
  "path": "/path/to/file.txt",
  "insert_line": 5,
  "new_str": "text to insert after line 5"
}
```

### Append
**Input:**
```json
{
  "command": "append",
  "path": "/path/to/file.txt",
  "new_str": "text to append at end"
}
```

---

## 4. glob
Find files by pattern.

**Input:**
```json
{
  "pattern": "**/*.txt",
  "path": "/optional/root/path",
  "limit": 100,
  "max_depth": 10
}
```

**Output:**
```json
{
  "filePaths": [
    "/home/user/project/file1.txt",
    "/home/user/project/dir/file2.txt"
  ],
  "totalFiles": 2,
  "truncated": false
}
```

---

## 5. grep
Search text patterns in files.

**Input:**
```json
{
  "pattern": "KEYWORD|TODO",
  "path": "/search/directory",
  "include": "*.ts",
  "case_sensitive": false,
  "max_files": 50,
  "max_matches_per_file": 10,
  "output_mode": "content"
}
```

**Output:**
```json
{
  "numFiles": 1,
  "numMatches": 1,
  "results": [
    {
      "count": 1,
      "file": "/path/to/file.txt",
      "matches": [
        "3:Search for this: KEYWORD"
      ]
    }
  ],
  "truncated": false
}
```

**output_mode options:**
- `"content"` → returns `"line_number:content"`
- `"files_with_matches"` → returns only file paths
- `"count"` → returns match counts per file

---

## 6. web_search
Search the web.

**Input:**
```json
{
  "query": "OpenAI function calling format"
}
```

**Output:**
```json
{
  "query": "OpenAI function calling format",
  "results": [
    {
      "domain": "openai.com",
      "id": "1",
      "maxVerbatimWordLimit": 30,
      "publicDomain": true,
      "publishedDate": 1741651200000,
      "snippet": "Brief excerpt from the page...",
      "title": "Function Calling in the OpenAI API",
      "url": "https://help.openai.com/en/articles/..."
    }
  ],
  "totalResults": 10
}
```

---

## 7. web_fetch
Fetch content from URL.

**Input:**
```json
{
  "url": "https://example.com/page",
  "mode": "selective",
  "search_terms": "pricing installation"
}
```

**Modes:**
- `"selective"` → extracts sections around search_terms
- `"truncated"` → first 8000 chars
- `"full"` → complete content

**Output:** (Plain text content from the page)

---

## 8. use_aws
Make AWS CLI calls.

**Input:**
```json
{
  "region": "us-east-1",
  "service_name": "s3api",
  "operation_name": "list-buckets",
  "parameters": {},
  "label": "List all S3 buckets",
  "profile_name": "default"
}
```

**Output:** (AWS CLI JSON response)
```json
{
  "Buckets": [
    {
      "Name": "my-bucket",
      "CreationDate": "2024-01-01T00:00:00+00:00"
    }
  ]
}
```

---

## 9. use_subagent
Delegate tasks to parallel subagents.

**Input (List agents):**
```json
{
  "command": "ListAgents"
}
```

**Input (Invoke):**
```json
{
  "command": "InvokeSubagents",
  "content": {
    "subagents": [
      {
        "query": "task description",
        "agent_name": "optional agent name",
        "relevant_context": "optional context"
      }
    ]
  }
}
```

---

## Error Responses

When a tool fails, you typically get:
```json
{
  "error": "Error message here",
  "exit_status": "1"
}
```

Or for fs_write validation errors:
```
Error: old_str not found in file
```
