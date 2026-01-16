# DocuFresh

[![npm version](https://img.shields.io/npm/v/docufresh.svg)](https://www.npmjs.com/package/docufresh)
[![license](https://img.shields.io/npm/l/docufresh.svg)](https://github.com/manthenavamsi/docufresh/blob/main/LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/docufresh.svg)](https://www.npmjs.com/package/docufresh)

Keep your documents fresh, automatically. DocuFresh is a zero-dependency library that replaces markers in your text with dynamic, always up-to-date values.

## Why DocuFresh?

Static content gets stale. Copyright years become outdated. "Founded 5 years ago" becomes wrong. DocuFresh solves this by replacing `{{markers}}` in your text with dynamic values that are always current.

**Before DocuFresh:**
```
Copyright 2024 - needs manual update every year
Founded 5 years ago - needs manual update
```

**With DocuFresh:**
```
Copyright {{current_year}} - always current
Founded {{years_since:2020}} years ago - always accurate
```

## Installation

```bash
npm install docufresh
```

```bash
yarn add docufresh
```

```bash
pnpm add docufresh
```

## Quick Start

```javascript
const docufresh = require('docufresh');

// Simple marker replacement
const text = 'Copyright {{current_year}} Acme Inc.';
console.log(docufresh.process(text));
// Output: "Copyright 2026 Acme Inc."

// With custom data
const template = 'Hello {{name}}, welcome to {{current_month}} {{current_year}}!';
console.log(docufresh.process(template, { name: 'Alice' }));
// Output: "Hello Alice, welcome to January 2026!"
```

## API Reference

### `process(text, customData?)`

Processes text and replaces all `{{markers}}` with their values.

```javascript
docufresh.process(text: string, customData?: object): string
```

**Parameters:**
- `text` - String containing `{{markers}}` to replace
- `customData` - Optional object with custom key-value pairs

**Returns:** Processed string with markers replaced

```javascript
// Built-in markers
docufresh.process('Year: {{current_year}}');
// "Year: 2026"

// Custom data
docufresh.process('Hi {{name}}!', { name: 'Bob' });
// "Hi Bob!"

// Mixed
docufresh.process('{{name}} joined in {{current_year}}', { name: 'Alice' });
// "Alice joined in 2026"
```

### `registerMarker(name, fn)`

Register a custom marker function.

```javascript
docufresh.registerMarker(name: string, fn: (...args) => string): void
```

**Parameters:**
- `name` - Marker name (used as `{{name}}` or `{{name:param}}`)
- `fn` - Function that returns a string, receives parameters after `:`

```javascript
// Simple marker
docufresh.registerMarker('greeting', () => 'Hello!');
docufresh.process('{{greeting}}'); // "Hello!"

// Marker with parameter
docufresh.registerMarker('double', (num) => (parseInt(num) * 2).toString());
docufresh.process('{{double:5}}'); // "10"
```

### `autoUpdate(selector?, customData?)` (Browser Only)

Automatically finds and replaces all markers in the DOM.

```javascript
docufresh.autoUpdate(selector?: string, customData?: object): void
```

**Parameters:**
- `selector` - CSS selector (default: `'body'`)
- `customData` - Optional custom data object

```html
<div id="footer">Copyright {{current_year}}</div>
<script>
  DocuFresh.autoUpdate('#footer');
  // DOM now shows: "Copyright 2026"
</script>
```

## Built-in Markers

### Date & Time

| Marker | Description | Example Output |
|--------|-------------|----------------|
| `{{current_year}}` | Current year (4 digits) | `2026` |
| `{{current_month}}` | Current month name | `January` |
| `{{current_date}}` | Localized date | `1/15/2026` |
| `{{current_time}}` | Localized time | `2:30:45 PM` |
| `{{timestamp}}` | Unix timestamp (ms) | `1736956245123` |
| `{{days_since:DATE}}` | Days since a date | `{{days_since:2024-01-01}}` -> `745` |
| `{{days_until:DATE}}` | Days until a date | `{{days_until:2026-12-31}}` -> `350` |
| `{{years_since:DATE}}` | Years since a date | `{{years_since:2020}}` -> `6` |
| `{{age:BIRTHDATE}}` | Calculate age | `{{age:1990-06-15}}` -> `35` |
| `{{relative_time:DATE}}` | Human-friendly relative time | `{{relative_time:2025-12-01}}` -> `6 weeks ago` |

### Math Operations

| Marker | Description | Example |
|--------|-------------|---------|
| `{{add:N1,N2,...}}` | Add numbers | `{{add:5,3,2}}` -> `10` |
| `{{subtract:N1,N2,...}}` | Subtract (first - rest) | `{{subtract:10,3}}` -> `7` |
| `{{multiply:N1,N2,...}}` | Multiply numbers | `{{multiply:5,3}}` -> `15` |
| `{{divide:N1,N2,...}}` | Divide (first / rest) | `{{divide:10,2}}` -> `5` |
| `{{random:MIN,MAX}}` | Random number (inclusive) | `{{random:1,100}}` -> `42` |

### Text & Formatting

| Marker | Description | Example |
|--------|-------------|---------|
| `{{capitalize:TEXT}}` | Capitalize first letter | `{{capitalize:hello world}}` -> `Hello world` |
| `{{upper:TEXT}}` | Convert to uppercase | `{{upper:hello}}` -> `HELLO` |
| `{{lower:TEXT}}` | Convert to lowercase | `{{lower:HELLO}}` -> `hello` |
| `{{format_number:NUM}}` | Format with commas | `{{format_number:1000000}}` -> `1,000,000` |

## Custom Markers

Extend DocuFresh with your own markers:

```javascript
const docufresh = require('docufresh');

// Simple marker (no parameters)
docufresh.registerMarker('company', () => 'Acme Corp');

// Marker with one parameter
docufresh.registerMarker('greet', (name) => `Hello, ${name}!`);

// Marker with multiple parameters
docufresh.registerMarker('repeat', (text, times) => text.repeat(parseInt(times)));

// Use them
docufresh.process('Welcome to {{company}}!');
// "Welcome to Acme Corp!"

docufresh.process('{{greet:Alice}}');
// "Hello, Alice!"

docufresh.process('{{repeat:ha,3}}');
// "hahaha"
```

## Browser Usage

### Via Script Tag

```html
<script src="https://unpkg.com/docufresh/src/index.js"></script>
<script>
  // DocuFresh is available as window.DocuFresh
  document.addEventListener('DOMContentLoaded', function() {
    DocuFresh.autoUpdate('body', { company: 'My Company' });
  });
</script>
```

### In HTML

```html
<footer>
  <p>Copyright {{current_year}} {{company}}</p>
  <p>Serving customers for {{years_since:2015}} years</p>
</footer>

<script src="https://unpkg.com/docufresh/src/index.js"></script>
<script>
  DocuFresh.autoUpdate('footer', { company: 'Acme Inc' });
</script>
```

## Real-World Use Cases

### Copyright Footer
```javascript
// Never update copyright year manually again
docufresh.process('Copyright {{current_year}} {{company}}', {
  company: 'Your Company'
});
// "Copyright 2026 Your Company"
```

### About Page
```javascript
docufresh.process(`
  Founded in 2015, we have been serving customers for {{years_since:2015}} years.
  Our team has grown to {{team_size}} members.
`, { team_size: 50 });
// "Founded in 2015, we have been serving customers for 11 years.
//  Our team has grown to 50 members."
```

### Documentation
```javascript
docufresh.process(`
  Last updated: {{current_month}} {{current_year}}
  Version: {{version}}
`, { version: '2.0.0' });
// "Last updated: January 2026
//  Version: 2.0.0"
```

### Event Countdown
```javascript
docufresh.process('{{days_until:2026-12-25}} days until Christmas!');
// "344 days until Christmas!"
```

### User Profiles
```javascript
docufresh.process('{{name}} ({{age:1990-03-15}} years old)', {
  name: 'John Doe'
});
// "John Doe (35 years old)"
```

## ES Modules

```javascript
import docufresh from 'docufresh';

const result = docufresh.process('{{current_year}}');
```

## TypeScript

DocuFresh includes TypeScript declarations:

```typescript
import docufresh, { DocuFresh } from 'docufresh';

const result: string = docufresh.process('{{current_year}}');

// Create new instance
const df = new DocuFresh();
df.registerMarker('custom', () => 'value');
```

## Error Handling

- Unknown markers are left unchanged: `{{unknown}}` stays as `{{unknown}}`
- Marker errors are logged to console but don't throw
- Invalid parameters in markers are handled gracefully

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
