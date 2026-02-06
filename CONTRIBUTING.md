# Contributing to PrivateAlpha

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Report unacceptable behavior

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/privatealpha.git
   cd privatealpha
   ```
3. **Set up development environment**
   ```bash
   npm install
   npm run build
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

Follow our coding standards:
- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **Rust**: Use `cargo fmt` and `cargo clippy`
- **JavaScript**: Use Prettier and ESLint
- **React**: Follow [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)

### 3. Test Your Changes

```bash
# Test contracts
cd packages/contracts && npm test

# Test TEE worker
cd packages/tee-worker && cargo test

# Test backend
cd packages/backend && npm test

# Test mobile
cd packages/mobile && npm test
```

### 4. Commit Changes

Use conventional commits:
```bash
git commit -m "feat: add new trading strategy"
git commit -m "fix: resolve credit score calculation bug"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for StrategyExecutor"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Areas for Contribution

### Smart Contracts

- Additional trading strategies
- Gas optimizations
- Security improvements
- Test coverage

**Files:**
- `packages/contracts/contracts/`
- `packages/contracts/test/`

### TEE Workers

- New credit scoring factors
- More trading strategies
- Performance optimizations
- Algorithm improvements

**Files:**
- `packages/tee-worker/src/`

### Backend API

- New endpoints
- Performance improvements
- Error handling
- Documentation

**Files:**
- `packages/backend/src/`

### Mobile App

- UI/UX improvements
- New features
- Bug fixes
- Accessibility

**Files:**
- `packages/mobile/src/`

### Documentation

- Tutorials
- API docs
- Architecture diagrams
- Examples

**Files:**
- `docs/`
- Package READMEs

## Pull Request Guidelines

### Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] Code is formatted (`npm run format`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated
- [ ] Commit messages follow convention

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code follows style guidelines
```

## Review Process

1. **Automated Checks**: CI runs tests
2. **Code Review**: Maintainers review code
3. **Changes Requested**: Address feedback
4. **Approval**: PR approved
5. **Merge**: Changes merged to main

## Reporting Bugs

### Before Reporting

- Check existing issues
- Try latest version
- Verify it's reproducible

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 11]
- Node version: [e.g. 18.0.0]
- Package version: [e.g. 1.0.0]
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions

**Additional context**
Any other context
```

## Development Setup

### Prerequisites

- Node.js 18+
- Rust 1.75+
- Docker Desktop
- Git

### Local Development

```bash
# Install dependencies
npm install

# Start local blockchain
cd packages/contracts && npm run node

# Start backend
cd packages/backend && npm run dev

# Start mobile app
cd packages/mobile && npm run web
```

## Coding Standards

### Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContractName
 * @notice What it does
 * @dev Implementation details
 */
contract ContractName {
    // State variables
    // Events
    // Modifiers
    // Constructor
    // External functions
    // Public functions
    // Internal functions
    // Private functions
}
```

### Rust

```rust
/// Function description
///
/// # Arguments
/// * `param1` - Description
///
/// # Returns
/// * Description of return value
pub fn function_name(param1: Type) -> Result<ReturnType, String> {
    // Implementation
}
```

### JavaScript

```javascript
/**
 * Function description
 * @param {string} param1 - Description
 * @returns {Promise<Object>} Description
 */
async function functionName(param1) {
  // Implementation
}
```

## Testing Guidelines

- Write tests for new features
- Maintain >80% coverage
- Test edge cases
- Use descriptive test names

Example:
```javascript
describe("CreditScoreRegistry", () => {
  it("should update credit score with valid attestation", async () => {
    // Test implementation
  });
  
  it("should revert with invalid attestation", async () => {
    // Test implementation
  });
});
```

## Documentation Standards

- Update README for new features
- Add JSDoc/Rustdoc comments
- Include examples
- Keep docs in sync with code

## Community

- **GitHub Discussions**: Ask questions
- **GitHub Issues**: Report bugs
- **Pull Requests**: Contribute code

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to PrivateAlpha! 🙏**
