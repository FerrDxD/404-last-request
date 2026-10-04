# Contributing to 404: LAST REQUEST

<div align="center">

```
╔══════════════════════════════════════════════════╗
║  🛠️  CONTRIBUTING GUIDE · 404: LAST REQUEST      ║
╚══════════════════════════════════════════════════╝
```

*Every great debugger started by reading the docs.*

</div>

First off — **thank you** for considering a contribution to **404: LAST REQUEST**. Whether you're fixing a typo, reporting a bug, designing a new case, or improving the architecture, your effort is genuinely appreciated.

Please take a few minutes to read this guide. It will make the process smoother for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#-reporting-bugs)
  - [Suggesting Features](#-suggesting-features)
  - [Contributing Code](#-contributing-code)
  - [Contributing a New Case](#-contributing-a-new-case)
  - [Improving Documentation](#-improving-documentation)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Coding Standards](#-coding-standards)
- [Git Workflow](#-git-workflow)
- [Pull Request Process](#-pull-request-process)
- [Testing](#-testing)
- [Design Principles](#-design-principles)
- [Getting Help](#-getting-help)

---

## Code of Conduct

By contributing, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before participating.

---

## How to Contribute

### 🐛 Reporting Bugs

Found a bug? We want to know.

**Before submitting:**
1. Check the [existing issues](https://github.com/FerrDxD/last-request/issues) to avoid duplicates
2. If you find a related closed issue, open a new one and reference the old one

**When submitting, include:**
- A **clear, descriptive title**
- **Steps to reproduce** the bug (be specific)
- **Expected behavior** vs **actual behavior**
- **Screenshots or error messages** (if applicable)
- Your **environment**: OS, Node.js version, browser, and version of the app

> **Security vulnerabilities** should not be reported via GitHub Issues — see [SECURITY.md](./SECURITY.md) instead.

---

### 💡 Suggesting Features

Have an idea? Great.

**Before submitting:**
1. Check [open issues](https://github.com/FerrDxD/last-request/issues) and [discussions](https://github.com/FerrDxD/last-request/discussions) for similar ideas
2. Make sure it aligns with the project's core goal: *a narrative debugging puzzle game*

**When submitting a feature request, include:**
- **What problem does it solve?** — not just what you want, but why
- **How would it work?** — a rough idea of the implementation
- **Who benefits?** — player experience, developer experience, or both
- **Is it in scope?** — does it serve the gameplay-first philosophy?

> We value simplicity. If a feature adds significant complexity without significant gameplay value, it's unlikely to be accepted.

---

### 💻 Contributing Code

Ready to write some code? Here's the path:

1. **Open an issue first** (for anything non-trivial) — discuss the approach before investing time
2. **Fork the repository** and create your branch from `main`
3. **Write your code** following the coding standards below
4. **Write or update tests** — especially for case logic changes
5. **Run the full test suite** and make sure it passes
6. **Open a Pull Request** with a clear description

---

### 🧩 Contributing a New Case

Cases are the heart of this game. Adding a new case is one of the highest-impact contributions you can make.

**What makes a good case:**
- A **realistic bug** that a real developer might encounter
- A **clear, deterministic solution** — only one right answer
- **Progressively revealing evidence** — console logs, network responses, or file contents
- A **narrative hook** — the bug should tell a small story
- **3-level hints** — from vague to specific, with score penalties

**Case data structure:**
- Cases are defined in the server's Prisma seed file
- Follow the existing schema exactly — all fields are required
- Test your case by adding it to the test suite and verifying it passes

**Before submitting a new case:**
- Make sure the solution is verifiable via the existing evaluator
- All six original cases must still pass
- The new case must have a unique, sequential ID

---

### 📝 Improving Documentation

Documentation contributions are always welcome, including:

- Fixing typos or grammar in any `.md` file
- Clarifying confusing setup instructions
- Adding JSDoc comments to functions
- Improving inline code comments
- Adding missing docstrings

No issue is required for small documentation fixes — just open a PR.

---

## 🛠️ Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | `>= 18.0.0` |
| npm | `>= 9.0.0` |
| MongoDB | Atlas or local |

### Full Setup

```bash
# 1. Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/last-request.git
cd last-request

# 2. Install all dependencies
npm install
npm run install:all

# 3. Set up environment variables
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your MongoDB credentials

# 4. Set up the database
cd apps/server
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
cd ../..

# 5. Start development
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:3000

---

## 📁 Project Structure

```
last-request/
├── apps/
│   ├── web/                    # Vue 3 frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable Vue components
│   │   │   ├── views/          # Page-level views
│   │   │   ├── stores/         # Pinia state stores
│   │   │   └── router/         # Vue Router config
│   │   └── package.json
│   └── server/                 # Express backend
│       ├── src/
│       │   ├── controllers/    # Route controllers
│       │   ├── services/       # Business logic
│       │   ├── repositories/   # Database layer
│       │   └── routes/         # Express route definitions
│       ├── prisma/
│       │   ├── schema.prisma   # Database schema
│       │   ├── seed.ts         # Case definitions
│       │   ├── evaluator.ts    # Case evaluation logic
│       │   ├── scoring.ts      # Score calculation
│       │   └── *.test.ts       # Test files
│       └── package.json
├── packages/
│   └── shared/                 # Shared TypeScript types
│       └── src/
│           └── index.ts
├── docs/                       # Product & architecture docs
├── design_reference/           # UI mockups
└── package.json                # Monorepo root
```

---

## 📐 Coding Standards

### General Rules

- **TypeScript everywhere** — no `any` types unless absolutely necessary and documented
- **No premature abstraction** — solve the problem at hand, not imaginary future problems
- **Readable over clever** — if you need to explain what a line does, simplify it
- **Keep functions small** — one responsibility per function

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Variables & functions | `camelCase` | `evaluateCase`, `playerScore` |
| Types & interfaces | `PascalCase` | `CaseDefinition`, `PlayerProgress` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_HINT_PENALTY` |
| Vue components | `PascalCase` | `CaseCard.vue`, `DevToolsPanel.vue` |
| Files (general) | `kebab-case` | `case-evaluator.ts` |

### TypeScript

```typescript
// ✅ Good — explicit types, clear intent
function evaluateCase(caseId: string, patch: PatchDefinition): EvaluationResult {
  // ...
}

// ❌ Bad — implicit any, unclear return
function eval(id, patch) {
  // ...
}
```

### Vue Components

```vue
<!-- ✅ Good — Composition API with <script setup> -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const score = ref(0)
const formattedScore = computed(() => `${score.value} pts`)
</script>

<!-- ❌ Bad — Options API, no types -->
<script>
export default {
  data() {
    return { score: 0 }
  }
}
</script>
```

### Express API

```typescript
// ✅ Good — typed request/response, error handling
router.get('/cases/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const caseData = await caseRepository.findById(req.params.id)
    res.json(caseData)
  } catch (error) {
    res.status(404).json({ error: 'Case not found' })
  }
})
```

### Comments

- Write comments for **why**, not **what** — code should explain itself
- Use JSDoc for all exported functions and types
- Do not leave commented-out code in PRs

---

## 🌿 Git Workflow

### Branch Naming

```
feat/brief-description       # New features
fix/brief-description        # Bug fixes
docs/brief-description       # Documentation
test/brief-description       # Tests only
chore/brief-description      # Maintenance, config changes
case/case-name               # New game cases
```

**Examples:**
```
feat/hint-system-ui
fix/score-calculation-overflow
docs/update-setup-guide
case/the-missing-migration
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|------|------------|
| `feat` | New feature or gameplay addition |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `test` | Adding or modifying tests |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `chore` | Config changes, dependency updates, CI |
| `case` | New case definition |

**Examples:**
```bash
feat(scoring): add time bonus for fast case completion
fix(evaluator): handle multi-patch evaluation edge case
docs(readme): update MongoDB Atlas setup instructions
case(case-07): add broken migration case
test(evaluator): add coverage for hint penalty calculation
```

---

## 🔁 Pull Request Process

### Before Opening a PR

- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] No unintended changes to case definitions or seed data
- [ ] New features have corresponding tests where applicable
- [ ] Documentation is updated if the behavior changed

### PR Description Template

When you open a PR, please fill out the template:

```markdown
## Summary
<!-- What does this PR do? -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] New case
- [ ] Documentation
- [ ] Refactor
- [ ] Other: ___

## Testing
<!-- How did you test this? -->

## Screenshots (if applicable)
<!-- For UI changes -->

## Checklist
- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] Documentation updated (if needed)
- [ ] I have read the CONTRIBUTING guide
```

### Review Process

- All PRs require **at least one review** from a maintainer
- Small PRs (< 100 lines of code change) are reviewed faster
- Large PRs may be asked to be broken into smaller pieces
- Maintainers will respond within **5 business days**

### After Merging

- Your name will appear in the commit history
- Significant contributions will be acknowledged in release notes

---

## 🧪 Testing

### Running Tests

```bash
npm run test
```

Tests run without a database connection — all case logic is evaluated in-memory.

### Test Coverage

The test suite covers:
- All 6 case definitions (`cases.test.ts`)
- Case evaluation logic (`evaluator.test.ts`)
- Scoring and hint penalties (`scoring.test.ts`)

### Writing Tests

If you add case logic, evaluation changes, or scoring modifications — **add tests**.

```typescript
// Example test structure
test('case 01 evaluates correctly with correct patch', async (t) => {
  const result = evaluateCase('case-01', correctPatch)
  assert.strictEqual(result.passed, true)
  assert.ok(result.score > 0)
})
```

---

## 🎯 Design Principles

These principles guide every decision in this codebase. Please read them before contributing:

### 1. Gameplay First
Every feature, every refactor, every architectural decision should serve the **player experience**. If it doesn't make the game better, question whether it's necessary.

### 2. Keep It Simple
Resist the urge to add abstraction layers, design patterns, or frameworks unless they solve a real, present problem. We'd rather have a flat, readable file than a complex, "scalable" one.

### 3. Data-Driven Cases
Cases are **data**, not code. New debugging scenarios go in the case definitions — not hardcoded in the evaluation logic. The evaluator should remain case-agnostic.

### 4. Deterministic Solutions
Every case must have exactly one correct answer, verifiable by the test suite. If a solution is ambiguous, the case definition needs revision.

### 5. No Premature Optimization
Write correct code first. Optimize if and only if there is a measured performance problem.

---

## 🆘 Getting Help

Stuck on something? Here's how to get help:

| Channel | Use for |
|---------|---------|
| [GitHub Issues](https://github.com/FerrDxD/last-request/issues) | Bug reports, feature requests |
| [GitHub Discussions](https://github.com/FerrDxD/last-request/discussions) | General questions, ideas, feedback |
| [Email](mailto:maulanaferdi0678@gmail.com) | Private questions, security concerns |

**When asking for help:**
- Share the exact error message or unexpected behavior
- Include the steps you've already tried
- Include relevant code snippets or screenshots

---

<div align="center">

*Good contributions, like good bugs, leave a paper trail.*

Thank you for helping make **404: LAST REQUEST** better.

**[FerrDxD](https://github.com/FerrDxD)** · [maulanaferdi0678@gmail.com](mailto:maulanaferdi0678@gmail.com)

</div>
