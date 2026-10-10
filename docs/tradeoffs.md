# Trade-offs and decisions

1. **Rails API + PostgreSQL:** Rails is productive for CRUD and domain validations; PostgreSQL offers reliable constraints, decimal types, indexing, and transactional updates.
2. **Salary history instead of overwrite:** Historical compensation is auditable and can answer “what changed and when?”
3. **Currency-grouped reporting:** Adding INR, USD, EUR, etc. into one average is misleading. FX conversion is out of scope until the source and conversion date are defined.
4. **Server-side pagination:** Avoids transferring and rendering all 10,000 employees in one request.
5. **Synthetic seed data:** Deterministic, reproducible, and safe for screenshots/video.
6. **Simple initial authorization gate:** The optional token is useful for private staging but is not a replacement for user identity, roles, audit trails, or enterprise SSO.
7. **No microservices:** A modular Rails monolith is sufficient for 10,000 employee records; operational complexity would not add value to this assessment.
