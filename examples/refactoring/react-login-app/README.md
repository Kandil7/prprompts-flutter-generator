# React Login App - Refactoring Example

This is a sample React application demonstrating authentication with Redux Toolkit. It serves as an example for the PRPROMPTS React-to-Flutter refactoring system.

## Features

- Email/password login form
- Form validation
- Redux Toolkit for state management
- Mock API integration
- Loading states
- Error handling
- Responsive design

## Test Credentials

- **Email:** test@example.com
- **Password:** password123

## Project Structure

```
react-login-app/
├── src/
│   └── features/
│       └── auth/
│           ├── LoginPage.jsx        # Main login component
│           ├── authSlice.js         # Redux slice
│           └── LoginPage.css        # Styles
└── package.json
```

## Refactoring to Flutter

To convert this React app to Flutter:

```bash
# Using prprompts CLI
cd examples/refactoring
prprompts refactor \
  --source ./react-login-app \
  --target ./flutter-login-app \
  --ai claude \
  --enhance \
  --generate-tests \
  --validate
```

## What Gets Converted

| React | Flutter |
|-------|---------|
| `LoginPage` component | `LoginPage` StatefulWidget |
| Redux `authSlice` | Auth BLoC with events/states |
| `useState` hooks | StatefulWidget state |
| Form validation | Flutter Form with validators |
| API mock | Repository + RemoteDataSource |
| CSS styles | Flutter theme + styling |

## Expected Flutter Output

```
flutter-login-app/
├── lib/
│   ├── core/
│   │   ├── di/
│   │   ├── errors/
│   │   └── network/
│   └── features/
│       └── auth/
│           ├── domain/
│           │   ├── entities/
│           │   ├── repositories/
│           │   └── usecases/
│           ├── data/
│           │   ├── models/
│           │   ├── datasources/
│           │   └── repositories/
│           └── presentation/
│               ├── bloc/
│               ├── pages/
│               └── widgets/
└── test/
```

## Learning Points

This example demonstrates:

1. **State Management Conversion:** Redux → BLoC
2. **Form Validation:** React validation → Flutter Form validators
3. **Async Operations:** Redux thunks → BLoC events with repositories
4. **Error Handling:** Redux error states → BLoC failure states
5. **UI Components:** JSX → Flutter widgets
6. **Styling:** CSS → Flutter theming

## Related Documentation

- [REFACTORING_GUIDE.md](../../docs/refactoring/REFACTORING_GUIDE.md) - Complete refactoring guide
- [EXAMPLES.md](../../docs/refactoring/EXAMPLES.md) - More conversion examples
- [API_REFERENCE.md](../../docs/refactoring/API_REFERENCE.md) - Developer API reference
