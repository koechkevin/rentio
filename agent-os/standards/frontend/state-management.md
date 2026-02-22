# Frontend State Management

## Auth State: Redux + localStorage

Auth state lives in both Redux (`authSlice`) and localStorage. They must stay in sync.

```typescript
// Every reducer that modifies auth state also updates localStorage
setCredentials: (state, action) => {
  state.token = action.payload.token;
  state.user = action.payload.user;
  localStorage.setItem('token', action.payload.token);
  localStorage.setItem('user', JSON.stringify(action.payload.user));
},
```

- Redux is initialized from localStorage on page load
- Do not use middleware like redux-persist — manual sync is the current pattern (TODO: migrate to redux-persist)
- Never add sensitive fields (passwords, raw verification codes) to localStorage

## Token Refresh (baseQueryWithReauth)

All RTK Query calls go through `baseQueryWithReauth`. On 401:
1. Attempts token refresh via `POST /auth/refresh`
2. Updates Redux store + localStorage with new token
3. Retries the original request
4. If refresh fails: clears localStorage and redirects to `/auth/login`

Do not manually handle 401s in components — the base query handles it globally.

## Property Context

The currently selected property is stored in localStorage as `currentPropertyId` and automatically injected as `X-Property-Id` on every API call via `prepareHeaders` in the base query.

```typescript
// Reading current property in components
const { currentPropertyId, currentProperty } = useCurrentProperty();
```

- Always use the `useCurrentProperty()` hook, not direct localStorage access
- Property selection persists across page reloads
