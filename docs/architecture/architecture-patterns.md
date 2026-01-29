# Architecture Patterns & Best Practices

## 1. Reducing Latency via API Gateways and BFFs

In a distributed system, a single UI screen often requires data from multiple microservices. If the client application makes direct calls to each service, the resulting "chattiness" increases latency and complexity, especially over mobile networks.

**Solution: API Gateway / Backend for Frontend (BFF) Pattern**

This layer acts as a reverse proxy that:
- Dispatches requests to internal services
- Aggregates the results
- Returns a single, optimized response to the client

**Benefits:**
- Reduces round trips
- Allows UI to render data more efficiently
- Significantly improves UX

---

## 2. Guarding UX with Resilience Patterns

Nothing ruins customer experience faster than a global outage caused by a single failing service. In large systems, partial failures can be amplified if threads are blocked waiting for unresponsive dependencies.

### Circuit Breakers

Prevent the system from repeatedly trying to call a failing service. Instead of hanging indefinitely:
- The system "trips" the circuit
- Returns a friendly, cached, or default message
- Example: *"Service inoperative, please try again later"*

### Retries with Jitter

- Use retries with **exponential backoff** to handle transient network hiccups
- Add a **jitter strategy** to spread out retry intervals
- Prevents "Race Conditions" and overwhelming a recovering service

---

## 3. Domain-Driven Design (DDD) and Ubiquitous Language

A common source of "Bad Code" and poor UX is a disconnect between business intent and software execution.

**DDD Solution:**
- Establish a **Ubiquitous Language** shared between developers and domain experts
- When the software model accurately represents business rules, the resulting UI is more intuitive and predictable

---

## 4. Managing Consistency and Data Integrity

In microservices, we often trade **transactional consistency** for **eventual consistency** to improve availability.

### Key Considerations

- Make eventual consistency explicit to the user
- Users should not expect immediate results where they are not possible

### Architect's Warning: Data Inconsistency Risk

When multiple users interact with the same data across services, you risk data inconsistency.

**Solution: Optimistic Locking**
- Implement within your Aggregates
- Prevents concurrent updates from corrupting domain state

---

## 5. Implementation in Idiomatic Go

Following **Clean Architecture**, separate concerns into:

| Layer | Responsibility |
|-------|----------------|
| **Handlers** | Presentation |
| **Services** | Business Logic |
| **Repositories** | Data Access |

**Benefits:**
- Testable system
- Easy to maintain

---

## 6. Authentication and Security

### OpenID Connect (OIDC)

Improves user experience by:
- Simplifying sign-up and registration processes
- Reducing website abandonment
- Delegating identity verification to expert providers
- Ensuring a secure and streamlined flow for end users

---

## Summary

| Pattern | Purpose |
|---------|---------|
| API Gateway/BFF | Reduce latency, aggregate responses |
| Circuit Breakers | Graceful failure handling |
| Retries with Jitter | Handle transient failures safely |
| DDD & Ubiquitous Language | Align code with business intent |
| Optimistic Locking | Prevent data corruption |
| Clean Architecture | Maintainable, testable code |
| OIDC | Secure, streamlined authentication |
