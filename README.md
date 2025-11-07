# 📊 Papa Parse MCP Server

Cloud-hosted CSV processing service powered by Papa Parse. Parse, validate, and convert CSV data via simple API calls.

## 🚀 Features

- ✅ **Parse CSV** - Convert CSV to JSON with intelligent type detection
- ✅ **Unparse JSON** - Convert JSON arrays to CSV format
- ✅ **Validate CSV** - Check CSV structure, find errors, detect issues
- ✅ **URL Support** - Fetch and process CSV files from URLs
- ✅ **Smart Parsing** - Auto-detects delimiters, handles quotes, trims whitespace
- ✅ **Error Handling** - Detailed error reporting with line numbers

## 📖 Use Cases

- **Data Import/Export** - Convert between CSV and JSON formats
- **Data Validation** - Validate CSV files before processing
- **ETL Workflows** - Integrate into n8n, Zapier, Make.com
- **AI Agents** - Enable Claude/GPT to process CSV data
- **Batch Processing** - Handle large CSV files in the cloud

## 🎯 Quick Start

### Operation 1: Parse CSV

**Input:**
```json
{
  "operation": "parse",
  "csvData": "name,age,city\nJohn,30,NYC\nJane,25,LA",
  "options": {
    "header": true,
    "dynamicTyping": true
  }
}
```

**Output:**
```json
{
  "success": true,
  "operation": "parse",
  "data": [
    {"name": "John", "age": 30, "city": "NYC"},
    {"name": "Jane", "age": 25, "city": "LA"}
  ],
  "rowCount": 2,
  "columnCount": 3
}
```

### Operation 2: Parse from URL

**Input:**
```json
{
  "operation": "parse",
  "csvData": "https://example.com/data.csv"
}
```

### Operation 3: Convert JSON to CSV

**Input:**
```json
{
  "operation": "unparse",
  "jsonData": [
    {"product": "Laptop", "price": 999, "stock": 50},
    {"product": "Mouse", "price": 29, "stock": 200}
  ]
}
```

**Output:**
```json
{
  "success": true,
  "operation": "unparse",
  "csv": "product,price,stock\nLaptop,999,50\nMouse,29,200",
  "rowCount": 2
}
```

### Operation 4: Validate CSV

**Input:**
```json
{
  "operation": "validate",
  "csvData": "name,age,city\nJohn,30,NYC\n,25,LA\nBob,invalid,Chicago"
}
```

**Output:**
```json
{
  "success": true,
  "operation": "validate",
  "isValid": false,
  "validations": {
    "hasData": true,
    "hasHeaders": true,
    "hasErrors": false,
    "isConsistent": true,
    "emptyFields": {
      "name": [1]
    },
    "duplicateHeaders": []
  }
}
```

## ⚙️ Configuration Options

All standard Papa Parse options are supported:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `header` | boolean | `true` | First row contains headers |
| `dynamicTyping` | boolean | `true` | Auto-convert numbers/booleans |
| `skipEmptyLines` | boolean | `true` | Skip blank lines |
| `delimiter` | string | `""` | Auto-detect delimiter |
| `newline` | string | `""` | Auto-detect line breaks |
| `quoteChar` | string | `"` | Quote character |
| `escapeChar` | string | `"` | Escape character |
| `comments` | string/boolean | `false` | Comment character |
| `trimHeaders` | boolean | `true` | Remove whitespace from headers |

## 🔌 Integration Examples

### Using with n8n

1. Add **HTTP Request** node
2. Set URL: `https://api.apify.com/v2/acts/YOUR_ACTOR_ID/runs`
3. Method: `POST`
4. Body: Your input JSON
5. Headers: `Authorization: Bearer YOUR_API_TOKEN`

### Using with Zapier

1. Add **Webhooks by Zapier** action
2. Choose **POST**
3. URL: `https://api.apify.com/v2/acts/YOUR_ACTOR_ID/run-sync-get-dataset-items`
4. Add your input as JSON

### Using with Python

```python
import requests

response = requests.post(
    'https://api.apify.com/v2/acts/YOUR_ACTOR_ID/run-sync-get-dataset-items',
    json={
        'operation': 'parse',
        'csvData': 'name,age\nJohn,30\nJane,25'
    },
    params={'token': 'YOUR_API_TOKEN'}
)

data = response.json()
print(data)
```

### Using with JavaScript

```javascript
const response = await fetch(
  'https://api.apify.com/v2/acts/YOUR_ACTOR_ID/run-sync-get-dataset-items?token=YOUR_TOKEN',
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      operation: 'parse',
      csvData: 'name,age\nJohn,30\nJane,25'
    })
  }
);

const data = await response.json();
console.log(data);
```

## 🐛 Error Handling

The actor provides detailed error information:

```json
{
  "success": true,
  "errors": [
    {
      "type": "Quotes",
      "code": "MissingQuotes",
      "message": "Quoted field unterminated",
      "row": 5
    }
  ]
}
```

## 📊 Performance

- Handles files up to **100MB**
- Processes ~10,000 rows/second
- Automatic chunking for large files
- Memory-efficient streaming

## 🔒 Security

- No data is stored permanently
- All processing happens in isolated containers
- Supports HTTPS-only CSV URLs
- API token authentication required

## 💡 Tips

1. **Large Files**: Use URL input instead of pasting large CSV content
2. **Custom Delimiters**: Set `delimiter: ";"` for semicolon-separated values
3. **Headers**: Set `header: false` if your CSV has no header row
4. **Type Conversion**: Disable `dynamicTyping` to keep all fields as strings
5. **Validation**: Always validate before parsing production data

## 📝 Changelog

**v1.0.0** (2024)
- Initial release
- Parse, unparse, validate operations
- URL fetching support
- Comprehensive error reporting

## 🆘 Support

- **Documentation**: [Papa Parse Docs](https://www.papaparse.com/docs)
- **Issues**: Report on GitHub
- **Questions**: support@apify.com

## 📄 License

MIT License - Use freely in commercial projects

---

**Built with ❤️ using Papa Parse and Apify**