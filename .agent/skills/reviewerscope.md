---
roles: reviewer
---
# Skill: reviewerScope

## When to use
When conducting code reviews and you need to focus only on JavaScript files, ignoring other file types in the codebase.

## How to apply
1. Filter your review scope to only include files with `.js` extension
2. Skip over files with other extensions (.py, .java, .cpp, .html, .css, .md, etc.)
3. Focus your attention on JavaScript-specific concerns:
   - Syntax and style consistency
   - JavaScript best practices
   - ES6+ feature usage
   - Error handling patterns
   - Performance considerations for JS code
4. Explicitly state in your review that you're only examining JavaScript files

## Example
When reviewing a pull request with multiple file types:

```
Files in this PR:
- src/app.js ✓ REVIEWED
- src/utils.js ✓ REVIEWED  
- styles/main.css ✗ SKIPPED (not JS)
- README.md ✗ SKIPPED (not JS)
- config.py ✗ SKIPPED (not JS)
- tests/app.test.js ✓ REVIEWED

Review Summary: Focused review on 3 JavaScript files only.
```

## Pitfalls
- Don't accidentally review configuration files that might affect JS behavior (package.json, webpack.config.js) unless they have .js extension
- Avoid getting distracted by non-JS files even if they contain JavaScript-like syntax
- Remember that .mjs and .ts files are different extensions and should be skipped unless explicitly included in scope