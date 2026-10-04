# Security Policy

<div align="center">

```
╔═══════════════════════════════════════════╗
║   🛡️  SECURITY POLICY · 404: LAST REQUEST ║
╚═══════════════════════════════════════════╝
```

*We take security seriously — even in a game about broken code.*

</div>

---

## Supported Versions

The following versions currently receive security updates:

| Version | Supported |
|---------|-----------|
| `1.x` (latest) | ✅ Yes |
| `< 1.0` | ❌ No |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability within **404: LAST REQUEST**, please report it privately to maintain responsible disclosure.

### 📬 Contact

| Method | Details |
|--------|---------|
| **Primary Email** | [maulanaferdi0678@gmail.com](mailto:maulanaferdi0678@gmail.com) |
| **Alternate Email** | [ferdi@nawasena.site](mailto:ferdi@nawasena.site) |
| **GitHub** | [@FerrDxD](https://github.com/FerrDxD) — use *private message* |

### 📋 What to Include in Your Report

To help us understand and address the vulnerability quickly, please include:

- **Description** — A clear explanation of the vulnerability
- **Impact** — What could an attacker do with this?
- **Steps to Reproduce** — Specific, reproducible steps
- **Affected Component** — Frontend, backend, database, or shared package
- **Environment** — OS, Node.js version, browser (if applicable)
- **Proof of Concept** — Code, screenshots, or logs (if available)
- **Suggested Fix** — (Optional) Your thoughts on how to fix it

---

## Response Timeline

We are committed to responding promptly:

| Stage | Timeline |
|-------|----------|
| **Initial acknowledgement** | Within **48 hours** |
| **Confirmation & triage** | Within **5 business days** |
| **Fix or mitigation** | Within **30 days** (depending on severity) |
| **Public disclosure** | After fix is deployed and coordinated with reporter |

We will keep you informed throughout the process.

---

## Severity Classification

We use the following classification to prioritize vulnerabilities:

| Severity | Examples |
|----------|---------|
| 🔴 **Critical** | Remote code execution, authentication bypass, full database exposure |
| 🟠 **High** | Privilege escalation, significant data leakage, broken access control |
| 🟡 **Medium** | CSRF, partial data exposure, configuration weaknesses |
| 🟢 **Low** | Information disclosure with minimal impact, minor misconfigurations |

---

## Scope

### In Scope

The following are within scope for security reports:

- `apps/server` — Express.js backend API
- `apps/web` — Vue.js frontend
- `packages/shared` — Shared TypeScript types
- Authentication flows and session handling
- Database queries and ORM interactions (Prisma + MongoDB)
- Environment variable handling and secrets management
- CORS configuration and HTTP security headers
- Input validation and sanitization

### Out of Scope

The following are **not** in scope:

- Vulnerabilities in **third-party dependencies** (please report directly to the dependency maintainer via their own disclosure process)
- Issues that require **physical access** to a user's device
- Social engineering attacks against maintainers
- Issues in **development-only** environments that don't affect production
- **Denial of Service** (DoS) via intentional resource exhaustion (unless critical)
- Bugs that are already known / publicly reported

---

## Safe Harbor

We consider security research conducted in good faith to be authorized and will not pursue legal action against researchers who:

- Make a good-faith effort to **avoid privacy violations** and disruptions to others
- **Report findings promptly** and give us reasonable time to respond
- **Do not exploit** the vulnerability beyond what is necessary to demonstrate it
- **Do not access** user data beyond what is needed to demonstrate the issue

We will not file legal action for accidental, good-faith violations of this policy. We want security researchers to feel safe reporting issues.

---

## Security Best Practices for Contributors

If you are contributing to this project, please follow these practices:

### Environment & Secrets

- **Never commit `.env` files** — they are in `.gitignore` for a reason
- Use `.env.example` as the template; fill in values locally only
- Rotate any credentials you accidentally expose immediately

### Dependencies

- Keep dependencies up to date — run `npm audit` regularly
- Review `npm audit` output before submitting pull requests
- Do not add dependencies with known critical vulnerabilities

### MongoDB / Database

- Use the **principle of least privilege** for database users
- Restrict IP access in MongoDB Atlas — avoid `0.0.0.0/0` in production
- Never log or expose raw connection strings

### API & Backend

- Validate all user inputs on the server side
- Set appropriate CORS origins — do not use `*` in production
- Use parameterized queries (Prisma handles this by default)

---

## Acknowledgements

We sincerely thank all security researchers who help keep this project safe. Responsible disclosures will be acknowledged in our release notes (with your permission).

---

<div align="center">

*Thank you for helping make 404: LAST REQUEST a safer experience.*

**[FerrDxD](https://github.com/FerrDxD)** · [maulanaferdi0678@gmail.com](mailto:maulanaferdi0678@gmail.com)

</div>
