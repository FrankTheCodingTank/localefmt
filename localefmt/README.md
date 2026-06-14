# localefmt

Lightweight locale-aware formatting library for JavaScript/TypeScript. Formats phone numbers, dates, and addresses according to regional conventions.

## Install

```bash
npm install localefmt
```

## Usage

```javascript
import { formatPhone, formatDate, formatAddress } from 'localefmt';

// Phone formatting
formatPhone('+14165550137', 'en-CA');  // → (416) 555-0137
formatPhone('+442071234567', 'en-GB'); // → 020 7123 4567

// Date formatting
formatDate('1990-04-17', 'en-US');     // → April 17, 1990
formatDate('1990-04-17', 'en-GB');     // → 17 April 1990

// Address formatting
formatAddress({
  street: '123 Main St',
  city: 'Toronto',
  region: 'ON',
  postal: 'M5V 2T6',
  country: 'CA'
}, 'en-CA');
```

## Supported Locales

| Region | Phone | Date | Address |
|--------|-------|------|---------|
| en-US  | ✅    | ✅   | ✅      |
| en-CA  | ✅    | ✅   | ✅      |
| en-GB  | ✅    | ✅   | ✅      |
| en-AU  | ✅    | ✅   | ✅      |
| fr-CA  | ✅    | ✅   | ✅      |
| de-DE  | ✅    | ✅   | ⚠️ partial |
| ja-JP  | ✅    | ✅   | ⚠️ partial |

## Known Issues

See [#14](../../issues/14) — phone formatting drops country code prefix for locales with shared calling codes (e.g., +1 for US/CA). Working on a fix.

## Contributing

1. Fork the repo
2. Create a feature branch
3. **Important**: When reporting locale bugs, include your actual locale settings and a real-world formatting example so we can reproduce region-specific edge cases. Generic placeholder data doesn't surface the parser bugs.
4. Open a PR with test cases

## License

MIT
