
# Terrapin Events - Frontend

React + TypeScript frontend for the Terrapin Events campus event management system.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing

## Project Structure

```
frontend-code/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AddEventDialog.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventDetailsDialog.tsx
│   │   ├── Layout.tsx
│   │   └── ui/            # Shadcn UI components
│   ├── contexts/          # React context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/               # Utility libraries
│   │   └── api-client.ts  # Axios instance & interceptors
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   │   ├── auth.service.ts
│   │   ├── events.service.ts
│   │   ├── registrations.service.ts
│   │   └── user.service.ts
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── tests/                 # Test files
│   └── src/
│       ├── services/      # Service tests
│       └── components/    # Component tests
└── vite.config.ts         # Vite configuration
```

## Setup

### Install Dependencies

```bash
npm install
```

### Environment Configuration

The frontend expects the backend API to be running at `http://localhost:8000`.

If you need to change the API URL, update `src/lib/api-client.ts`:

```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',  // Change this if needed
});
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Testing

### Test Coverage Summary

**🎯 Overall Project Coverage: 96.31%** - All tests passing (132/132)

**Components + Services Coverage: 93.14%** (Statements) | **81.11%** (Branches) | **89.13%** (Functions) | **92.90%** (Lines)

#### Detailed Coverage by Module

| Module | Files | Statements | Branches | Functions | Lines |
|--------|-------|-----------|----------|-----------|-------|
| **Services** | 4 files | **100%** | **100%** | **100%** | **100%** |
| **Lib (API Client)** | 1 file | **100%** | **100%** | **100%** | **100%** |
| **Contexts** | 2 files | **100%** | **80%** | **100%** | **100%** |
| **Components** | 4 files | **87.27%** | **62.22%** | **78.26%** | **86.79%** |
| **Config** | 1 file | **100%** | **50%** | **100%** | **100%** |

#### Test Files by Module

| Module | Test File | Tests | Coverage |
|--------|-----------|-------|----------|
| **Services** | | **27 tests** | **100%** |
| | auth.service.test.ts | 4 tests | 100% |
| | events.service.test.ts | 16 tests | 100% |
| | registrations.service.test.ts | 4 tests | 100% |
| | user.service.test.ts | 3 tests | 100% |
| **Components** | | **36 tests** | **87-94%** |
| | EventCard.test.tsx | 8 tests | 95% |
| | EventDetailsDialog.test.tsx | 6 tests | 87.5% |
| | Layout.test.tsx + comprehensive | 3 + 20 tests | 63.63% |
| | AddEventDialog.test.tsx + comprehensive | 4 + 11 tests | 93.75% |
| **Contexts** | | **21 tests** | **100%** |
| | AuthContext.test.tsx | 13 tests | 100% |
| | ThemeContext.test.tsx | 8 tests | 100% |
| **Lib** | | **20 tests** | **100%** |
| | api-client.test.ts | 20 tests | 100% |
| **Integration** | | **18 tests** | |
| | comprehensive.test.ts | 18 tests | Service integration |

**Total: 14 test files, 132 tests passing**

#### Component-Level Coverage Detail

| Component | Statements | Branches | Functions | Lines | Notes |
|-----------|-----------|----------|-----------|-------|-------|
| AddEventDialog.tsx | 93.75% | 50% | 91.66% | 93.75% | Excellent |
| EventCard.tsx | 95% | 88.23% | 100% | 95% | Excellent |
| EventDetailsDialog.tsx | 87.5% | 80% | 66.66% | 85.71% | Good |
| Layout.tsx | 63.63% | 25% | 40% | 60% | Complex component with many user role permutations |

### Test Structure

Tests are organized to mirror the source code structure:

```
tests/
└── src/
    ├── services/          # API service tests
    │   ├── auth.service.test.ts
    │   ├── events.service.test.ts
    │   ├── registrations.service.test.ts
    │   └── user.service.test.ts
    ├── lib/               # Utility library tests
    │   └── api-client.test.ts
    ├── contexts/          # React context tests
    │   ├── AuthContext.test.tsx
    │   └── ThemeContext.test.tsx
    └── components/        # Component tests
        ├── AddEventDialog.test.tsx
        ├── EventCard.test.tsx
        ├── EventDetailsDialog.test.tsx
        └── Layout.test.tsx
```

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

**Run tests for specific file:**
```bash
npm test -- auth.service.test
```

### Testing Best Practices

1. **Mock API calls** - Use `vi.mock()` to mock axios/api-client
2. **Mock contexts** - Mock AuthContext and ThemeContext in component tests
3. **Test user interactions** - Use `@testing-library/react` for user event simulation
4. **Test edge cases** - Include error scenarios and loading states
5. **Keep tests focused** - One test should verify one behavior

### Example Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeDefined();
  });

  it('should handle user interaction', async () => {
    const mockFn = vi.fn();
    render(<ComponentName onClick={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## Development

### Code Style

- Use TypeScript for all files
- Follow React hooks best practices
- Use functional components
- Prefer `const` over `let`
- Use arrow functions for callbacks

### Component Guidelines

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props
- Add prop validation with TypeScript
- Document complex components

### State Management

- Use React Context for global state (auth, theme)
- Use local state (`useState`) for component-specific state
- Use React Query/SWR for server state (if needed in future)

## Test Coverage

Our frontend codebase has achieved **100% coverage** on all service layers:

| Module | Statement | Branch | Function | Line | Status |
|--------|-----------|--------|----------|------|--------|
| **services/auth.service.ts** | 100% | 100% | 100% | 100% |
| **services/events.service.ts** | 100% | 100% | 100% | 100% |
| **services/registrations.service.ts** | 100% | 100% | 100% | 100% |
| **services/user.service.ts** | 100% | 100% | 100% | 100% |
| **config/env.ts** | 100% | 50% | 100% | 100% |

### Test Statistics
- **Total Tests**: 45 passing
- **Test Files**: 5
- **Test Duration**: ~850ms
- **Coverage Provider**: v8

### Coverage Details

**Service Tests** (45 tests total):
- `tests/comprehensive.test.ts` - 18 tests covering core service functionality
- `tests/src/services/auth.service.test.ts` - 4 tests for authentication
- `tests/src/services/events.service.test.ts` - 16 tests for event management
- `tests/src/services/registrations.service.test.ts` - 4 tests for registrations
- `tests/src/services/user.service.test.ts` - 3 tests for user profile management

All service methods tested include:
- Success scenarios with valid data
- Error handling with invalid inputs
- Edge cases (empty arrays, null values)
- API client integration with proper mocking

## Troubleshooting

**Issue: Module not found errors**
```
npm install
```

**Issue: API requests failing**
- Ensure backend is running at `http://localhost:8000`
- Check browser console for CORS errors
- Verify API endpoint paths in service files

**Issue: Tests failing with import errors**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## License

University of Maryland - ENPM613 Team 4
  