# Tool Definitions JSON Schema Format

Each tool is defined with this JSON Schema structure:

```json
{
  "name": "tool_name",
  "description": "Description of what the tool does and when to use it",
  "parameters": {
    "type": "object",
    "properties": {
      "param1": {
        "type": "string",
        "description": "Description of param1"
      },
      "param2": {
        "type": "integer",
        "description": "Description of param2"
      },
      "param3": {
        "type": "boolean",
        "description": "Description of param3"
      },
      "param4": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Description of param4"
      },
      "param5": {
        "enum": ["option1", "option2", "option3"],
        "type": "string",
        "description": "Description of param5"
      }
    },
    "required": ["param1", "param2"]
  }
}
```

## Parameter Types
- `string` - Text value
- `integer` - Whole number
- `boolean` - true/false
- `array` - List of items
- `object` - Nested object with properties
- `enum` - Restricted set of allowed values

## Required vs Optional
- Parameters listed in `required` array MUST be provided
- Other parameters are optional and have default values
