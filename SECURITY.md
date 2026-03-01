# Security

## Audit Summary (Pre-Push)

This repository has been audited for sensitive data. Findings:

### ✅ Clean
- No API keys (GitHub, Meta, Google, etc.)
- No database connection strings
- No `.env` files (excluded via `.gitignore`)
- No passwords, tokens, or private keys
- No local file paths exposing system information
- No test credentials

### ⚠️ Web3Forms Contact Form
The contact form uses a **Web3Forms access key** (`access_key`) in the HTML. Per Web3Forms documentation, this is a form submission identifier designed to be public. It enables form submissions to reach your configured email.

- **If concerned about abuse:** Rotate the key at [web3forms.com](https://web3forms.com) after going live
- **For stricter security:** Consider server-side form handling that forwards to Web3Forms with the key in environment variables

### Contact Email
`vocapath@partnership.org.ly` appears as the public contact email—intentional and not a secret.
