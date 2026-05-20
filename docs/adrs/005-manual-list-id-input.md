# ADR 005: Manual Trello List ID Input (MVP)

**Status:** Accepted  
**Date:** 2026-05-20  
**Deciders:** Project team (MVP)

---

## Context

Trello cards must be created in a specific list (`idList`). OAuth and full board navigation are out of MVP scope. Optional "Fetch Boards" may be added if time permits, but a reliable MVP path is required without OAuth.

---

## Decision

**Require manual List ID input** on the Trello sync screen for MVP:

- Text field for List ID (required before sync)
- User obtains List ID from Trello UI or documentation
- Sync payload includes `listId` with credentials and `taskIds`
- Backend sets Trello card `idList` from provided `listId`
- Validate List ID format before API call where practical; surface `Invalid List ID` on Trello errors

**Optional (not blocking MVP):** `POST /api/trello/boards` to help user pick a list—still no credential persistence.

---

## Consequences

**Positive:**

- Works without Trello OAuth implementation
- Clear, testable sync contract

**Negative:**

- Higher user friction; demo requires user to paste List ID
- Invalid List ID is a common error state (must be handled in UI)

---

## Compliance Rules for Agents

- Do not make List ID optional in MVP sync flow.
- Do not implement Trello OAuth without scope change and new ADR.
- Card creation must use user-supplied `listId`, not a hardcoded default.
- UI copy must explain List ID is required and credentials are not saved.

---

## References

- PRD Section 3 (MVP Trello), 7.6, 15.5 (Trello Sync Page)
- ADR 004 (no credential persistence)
