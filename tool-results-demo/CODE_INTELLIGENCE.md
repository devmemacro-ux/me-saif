# Code Intelligence Tool (LSP Integration)

LSP-powered code intelligence for semantic code analysis. Uses Language Server Protocol for IDE-quality understanding.

IMPORTANT: The code tool provides semantic understanding - prefer it for all code-related tasks. Only use grep/fs_read for non-semantic file operations.

## When to Use
- Find where symbols are defined (goto_definition, search_symbols)
- Find all usages of a symbol (find_references)
- Understand code structure (get_document_symbols, search_symbols)
- Get compiler errors/warnings (get_diagnostics)
- Rename symbols across files (rename_symbol)
- Get type info or completions at a position (get_hover, get_completions)

## When NOT to Use
- Reading file contents - use fs_read
- Searching literal text patterns - use grep
- Listing directories - use glob or fs_read

For code-related tasks, follow this order:
1. Use code tool for semantic code analysis (symbols, definitions, references, structure)
2. Use fs_read only or grep for simple file reading when you need to see specific content
3. Initialize workspace first if code tool operations fail: /code init

## Advantages Over fs_read
- Semantic understanding: Distinguishes between function definitions vs function calls
- Cross-file navigation: Finds all usages across entire project
- Type-aware: Understands classes, methods, interfaces
- Precise locations: Returns exact line/column positions

## Workspace Initialization
- Run /code init to detect languages and start LSP servers
- If operations fail with "LSP not available", run /code init --force
- Supported languages configured in .kiro/settings/lsp.json

## Supported Language Servers
- TypeScript/JavaScript: typescript-language-server
- Rust: rust-analyzer
- Python: pylsp or pyright
- Go: gopls
- Java: jdtls
- Ruby: solargraph
- C/C++: clangd

---

# Code Tool Schema

```json
{
  "name": "code",
  "description": "LSP-powered code intelligence for semantic code analysis. Uses Language Server Protocol for IDE-quality understanding.\nIMPORTANT: The code tool provides semantic understanding - prefer it for all code-related tasks. Only use grep/fs_read for non-semantic file operations.\n\n## When to Use\n- Find where symbols are defined (goto_definition, search_symbols)\n- Find all usages of a symbol (find_references)\n- Understand code structure (get_document_symbols, search_symbols)\n- Get compiler errors/warnings (get_diagnostics)\n- Rename symbols across files (rename_symbol)\n- Get type info or completions at a position (get_hover, get_completions)\n\n## When NOT to Use\n- Reading file contents - use fs_read\n- Searching literal text patterns - use grep\n- Listing directories - use glob or fs_read\n\nFor code-related tasks, follow this order:\n1. Use code tool for semantic code analysis (symbols, definitions, references, structure)\n2. Use fs_read only or grep for simple file reading when you need to see specific content\n3. Initialize workspace first if code tool operations fail: /code init\n\n## Advantages Over fs_read\n- Semantic understanding: Distinguishes between function definitions vs function calls\n- Cross-file navigation: Finds all usages across entire project\n- Type-aware: Understands classes, methods, interfaces\n- Precise locations: Returns exact line/column positions\n\n## Workspace Initialization\n- Run /code init to detect languages and start LSP servers\n- If operations fail with \"LSP not available\", run /code init --force\n- Supported languages configured in .kiro/settings/lsp.json\n\n## Operations\n- search_symbols: LSP workspace/symbol or textDocument/documentSymbol (if file provided) - find definitions by name\n- get_completions: LSP textDocument/completion - what's available at cursor (use filter for fuzzy search)\n- find_references: LSP textDocument/references - all usages at a position\n- goto_definition: LSP textDocument/definition - jump to definition\n- get_document_symbols: LSP textDocument/documentSymbol - list symbols in a file\n- lookup_symbols: Get detailed info for symbol names\n- get_diagnostics: LSP textDocument/publishDiagnostics - compiler errors/warnings\n- rename_symbol: LSP textDocument/rename - rename across all files\n- get_hover: LSP textDocument/hover - type info and docs at position\n- initialize_workspace: Detect languages and start LSP servers\n\n## Key Distinction: search_symbols vs get_completions\n- search_symbols: Find WHERE symbols are DEFINED (no position needed)\n- get_completions: Find what's IN SCOPE at cursor position (position required, use filter param)\n\n## Examples\n1. 'Where is UserService defined?' - search_symbols with symbol_name='UserService'\n2. 'What methods can I call here?' - get_completions with file_path, row, column, filter='methodPrefix'\n3. 'What type is this variable?' - get_hover with file_path, row, column\n4. 'Find all usages of process()' - search_symbols to find it, then find_references at that location\n5. 'What functions are in main.rs?' - get_document_symbols with file_path\n6. 'Show me the code in main.rs' - use fs_read (NOT code tool)",
  "parameters": {
    "type": "object",
    "properties": {
      "operation": {
        "type": "string",
        "enum": ["search_symbols", "find_references", "goto_definition", "rename_symbol", "get_document_symbols", "lookup_symbols", "get_diagnostics", "get_hover", "get_completions", "initialize_workspace"],
        "description": "The code intelligence operation to perform"
      },
      "file_path": {
        "type": "string",
        "description": "Absolute path to a specific source code file (NOT a directory). Example: '/path/to/project/src/main.rs'. Optional for search_symbols (scopes search to that file), required for find_references, goto_definition, rename_symbol, get_document_symbols, get_diagnostics."
      },
      "row": {
        "type": "integer",
        "description": "Line number (1-based, required for find_references, goto_definition, rename_symbol, hover, completion)"
      },
      "column": {
        "type": "integer",
        "description": "Column number (1-based, required for find_references, goto_definition, rename_symbol, hover, completion)"
      },
      "symbol_name": {
        "type": "string",
        "description": "Name of symbol to search for (required for search_symbols operation)"
      },
      "symbols": {
        "type": "array",
        "items": {"type": "string"},
        "description": "List of symbol names to lookup (required for lookup_symbols operation)"
      },
      "new_name": {
        "type": "string",
        "description": "New name for symbol rename (required for rename_symbol operation)"
      },
      "dry_run": {
        "type": "boolean",
        "description": "Preview changes without applying (optional for rename_symbol)"
      },
      "show_source": {
        "type": "boolean",
        "description": "Whether to include source code (optional for goto_definition)"
      },
      "exact_match": {
        "type": "boolean",
        "description": "Whether to use exact matching (optional for search_symbols, default: false)"
      },
      "workspace_only": {
        "type": "boolean",
        "description": "Only include references within the workspace, excluding dependencies (optional for find_references, default: true)"
      },
      "top_level_only": {
        "type": "boolean",
        "description": "If true (default), return only top-level symbols like structs, enums, impl blocks. If false, include all nested symbols like methods and inner functions (optional for get_document_symbols, default: true)"
      },
      "language": {
        "type": "string",
        "description": "Filter by programming language (optional for search_symbols, e.g., 'rust', 'typescript', 'python'). Case-insensitive."
      },
      "symbol_type": {
        "type": "string",
        "description": "Symbol type filter (for search_symbols and get_completions). Values: Function, Method, Class, Struct, Enum, Interface, Constant, Variable, Module, Import."
      },
      "limit": {
        "type": "integer",
        "description": "Maximum results to return. For search_symbols and get_completions: default 50, max 50. For find_references: default 500, max 1000."
      },
      "filter": {
        "type": "string",
        "description": "Fuzzy search filter for completion results (recommended for completion operation). Uses Jaro-Winkler algorithm. Example: filter='get' finds 'getUserData', 'getConfig', 'targetElement'. Without filter, completion returns 1000+ results."
      },
      "trigger_character": {
        "type": "string",
        "description": "Optional trigger character that initiated completion (optional for completion, e.g., '.', '::')"
      }
    },
    "required": ["operation"]
  }
}
```

---

## Actions

### 1. search_symbols
Search for symbols (functions, classes, variables) across the codebase by name.

**Input:**
```json
{
  "action": "search_symbols",
  "query": "UserService"
}
```

**Output:**
```json
{
  "symbols": [
    {
      "name": "UserService",
      "kind": "class",
      "file": "/path/to/user.service.ts",
      "line": 10,
      "column": 14
    },
    {
      "name": "UserServiceImpl",
      "kind": "class",
      "file": "/path/to/user.service.impl.ts",
      "line": 5,
      "column": 14
    }
  ]
}
```

### 2. goto_definition
Navigate to where a symbol is defined.

**Input:**
```json
{
  "action": "goto_definition",
  "file_path": "/path/to/file.ts",
  "line": 25,
  "column": 10
}
```

**Output:**
```json
{
  "definition": {
    "file": "/path/to/definition.ts",
    "line": 15,
    "column": 7,
    "preview": "export function myFunction() {"
  }
}
```

### 3. find_references
Find all usages of a symbol across the codebase.

**Input:**
```json
{
  "action": "find_references",
  "file_path": "/path/to/file.ts",
  "line": 15,
  "column": 7
}
```

**Output:**
```json
{
  "references": [
    {
      "file": "/path/to/caller1.ts",
      "line": 30,
      "column": 5,
      "preview": "  myFunction();"
    },
    {
      "file": "/path/to/caller2.ts",
      "line": 12,
      "column": 10,
      "preview": "const result = myFunction();"
    }
  ]
}
```

### 4. get_diagnostics
Get compiler errors and warnings for a file.

**Input:**
```json
{
  "action": "get_diagnostics",
  "file_path": "/path/to/file.ts"
}
```

**Output:**
```json
{
  "diagnostics": [
    {
      "severity": "error",
      "message": "Property 'name' does not exist on type 'User'",
      "line": 25,
      "column": 10
    }
  ]
}
```

### 5. rename_symbol
Safely rename a symbol across all files.

**Input:**
```json
{
  "action": "rename_symbol",
  "file_path": "/path/to/file.ts",
  "line": 15,
  "column": 7,
  "new_name": "newFunctionName"
}
```

### 6. get_hover_info
Get type information and documentation for a symbol.

**Input:**
```json
{
  "action": "get_hover_info",
  "file_path": "/path/to/file.ts",
  "line": 25,
  "column": 10
}
```

**Output:**
```json
{
  "hover": {
    "type": "(method) UserService.getUser(id: string): Promise<User>",
    "documentation": "Fetches a user by their ID from the database."
  }
}
```

---

## Integration with grep

The `grep` tool description mentions:

> ## For Semantic Code Understanding → Use 'code' tool if available
> - Finding symbol definitions or usages → code tool (search_symbols, goto_definition, find_references)
> - Understanding code structure/relationships → code tool
> - Distinguishing definition vs call vs import → code tool
>
> ## Fallback
> If the 'code' tool is available but returns insufficient symbol info, use grep to discover candidate files/lines, then return to 'code' for precise navigation.

This means:
1. Use `code` tool first for semantic understanding
2. Fall back to `grep` for text-based search when needed
3. Combine both for comprehensive code navigation
