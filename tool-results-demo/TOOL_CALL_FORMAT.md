# Tool Call XML Format

The agent makes function calls using XML format. Here is the exact structure:

## Single Tool Call
```
&lt;antml:function_calls&gt;
&lt;antml:invoke name="tool_name"&gt;
&lt;antml:parameter name="param1"&gt;value1&lt;/antml:parameter&gt;
&lt;antml:parameter name="param2"&gt;value2&lt;/antml:parameter&gt;
&lt;/antml:invoke&gt;
&lt;/antml:function_calls&gt;
```

## Multiple Independent Tool Calls (Parallel)
```
&lt;antml:function_calls&gt;
&lt;antml:invoke name="tool1"&gt;
&lt;antml:parameter name="param"&gt;value&lt;/antml:parameter&gt;
&lt;/antml:invoke&gt;
&lt;antml:invoke name="tool2"&gt;
&lt;antml:parameter name="param"&gt;value&lt;/antml:parameter&gt;
&lt;/antml:invoke&gt;
&lt;/antml:function_calls&gt;
```

## Tool Results Format
```
&lt;function_results&gt;
Result content here (JSON, text, or error message)
&lt;/function_results&gt;
```

## Error Result Example
```
&lt;function_results&gt;
&lt;error&gt;Error message here&lt;/error&gt;
&lt;/function_results&gt;
```

## Success with No Output
```
&lt;function_results&gt;
&lt;system&gt;Tool ran without output or errors&lt;/system&gt;
&lt;/function_results&gt;
```
