# AI-assisted development log

This file is a template to keep the assessment honest. Replace the example prompts with the actual prompts and tools used during your work.

## Intended workflow
1. Ask AI to review requirements and identify ambiguous business rules.
2. Generate one migration/model/service at a time.
3. Ask for tests alongside each business rule.
4. Review generated code manually, run tests, and fix failures before committing.
5. Use AI for code review, edge-case generation, and documentation; do not accept unverified claims that tests pass.

## Example prompt
“Act as a senior Rails engineer. Review this salary-history change service for transaction safety, date boundary cases, currency validation, authorization, and deterministic tests. Suggest the smallest maintainable correction. Do not claim tests pass unless they have been run.”

## Review checklist
- [ ] Verify all AI-generated code and dependencies.
- [ ] Run backend and frontend tests.
- [ ] Record actual tool names and meaningful prompts used.
- [ ] Note any AI suggestions rejected and why.
