# Constraints

---

## Priority Order (STRICT)

When rules conflict, follow this order:

1. Correctness (functional + KPI compliance)
2. Architecture adherence
3. Completeness
4. Efficiency (token optimization)

Efficiency must NEVER override correctness.

---

## General

- Do not assume requirements
- If context is missing or ambiguous → stop and ask
- Do not proceed with incomplete information
- Follow provided documents strictly (scope, architecture, data model)

---

## Architecture

- Follow Controllers → Services → Repositories strictly
- Do not mix business logic across layers
- Controllers handle request/response only
- Services contain business logic
- Repositories handle data access only
- Do not deviate from defined architecture

---

## Scope Control

- Implement only features defined in project_scope.md
- Every feature must map to KPI(s)
- Do not add extra endpoints, fields, or flows
- Do not introduce features not explicitly required
- Avoid scope creep at all costs

---

## Data & API Integrity

- Do not invent entities, fields, or APIs
- Follow defined data model strictly
- Follow API contracts defined in architecture
- Backend is the single source of truth
- Frontend must reflect backend data exactly

---

## Code Quality

- Prefer simplest working solution
- Avoid duplication across layers
- Do not introduce unnecessary abstractions
- Keep methods/components small and single-purpose
- Avoid premature optimization

---

## Performance

- Optimize database queries (no N+1)
- Select only required fields
- Avoid unnecessary re-renders (frontend)
- Avoid unnecessary async usage
- Do not introduce performance optimizations unless needed

---

## Security

- Enforce authentication and authorization rules
- Protect private data strictly
- Do not expose sensitive information
- Follow defined auth model (JWT, ownership checks)

---

## KPI Enforcement

- Every implementation must satisfy at least one KPI
- Missing KPI mapping = invalid implementation
- Incorrect KPI behavior = invalid implementation
- Feature is incomplete until KPI is satisfied

---

## Testing Enforcement

- No feature is complete without tests
- Tests must validate behavior, not implementation
- Failing test = feature incomplete
- Missing test = feature incomplete

---

## Efficiency (Token Optimization)

- Return only required output
- Do not regenerate unchanged code
- Keep responses concise but complete
- Avoid redundant or repeated output
- Do not include explanations unless explicitly requested

---

## AI Behavior

- Do not override persona rules
- Do not override architecture decisions
- Do not introduce assumptions
- If unsure → stop and ask for clarification

---

## Do Not

- Do not over-engineer
- Do not introduce unnecessary layers or abstractions
- Do not duplicate logic across layers
- Do not invent requirements
- Do not ignore KPI requirements
- Do not prioritize brevity over correctness