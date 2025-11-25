const path = require('path');
const fs = require('fs-extra');
const RefactorCommand = require('../../../lib/refactoring/cli/RefactorCommand');
const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');

describe('End-to-End React-to-Flutter Conversion', () => {
  jest.setTimeout(60000);
  let tempDir;
  let reactSource;
  let flutterTarget;

  beforeEach(async () => {
    // Create temp directories
    tempDir = path.join(__dirname, '..', 'temp', `test-${Date.now()}`);
    reactSource = path.join(tempDir, 'react-app');
    flutterTarget = path.join(tempDir, 'flutter-app');

    await fs.ensureDir(reactSource);
    await fs.ensureDir(flutterTarget);
  });

  afterEach(async () => {
    // Cleanup
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Complete Login App Conversion', () => {
    beforeEach(async () => {
      // Create sample React Login app
      await createSampleReactApp(reactSource);
    });

    test('should convert React Login app to Flutter with Clean Architecture', async () => {
      const command = new RefactorCommand({
        reactSource,
        flutterTarget,
        ai: 'mock',
        validate: true,
        stateManagement: 'bloc',
        interactive: false
      });

      // Execute conversion
      const result = await command.execute();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify Clean Architecture structure
      await verifyCleanArchitecture(flutterTarget);
    });

    test('should create all required feature directories', async () => {
      const command = new RefactorCommand();
      await command.execute(reactSource, flutterTarget, {
        ai: 'mock',
        stateManagement: 'bloc',
        interactive: false
      });

      // Check domain layer
      const domainPath = path.join(flutterTarget, 'lib', 'features', 'auth', 'domain');
      expect(await fs.pathExists(domainPath)).toBe(true);
      expect(await fs.pathExists(path.join(domainPath, 'entities'))).toBe(true);
      expect(await fs.pathExists(path.join(domainPath, 'repositories'))).toBe(true);
      expect(await fs.pathExists(path.join(domainPath, 'usecases'))).toBe(true);

      // Check data layer
      const dataPath = path.join(flutterTarget, 'lib', 'features', 'auth', 'data');
      expect(await fs.pathExists(dataPath)).toBe(true);
      expect(await fs.pathExists(path.join(dataPath, 'models'))).toBe(true);
      expect(await fs.pathExists(path.join(dataPath, 'datasources'))).toBe(true);
      expect(await fs.pathExists(path.join(dataPath, 'repositories'))).toBe(true);

      // Check presentation layer
      const presentationPath = path.join(flutterTarget, 'lib', 'features', 'auth', 'presentation');
      expect(await fs.pathExists(presentationPath)).toBe(true);
      expect(await fs.pathExists(path.join(presentationPath, 'bloc'))).toBe(true);
      expect(await fs.pathExists(path.join(presentationPath, 'pages'))).toBe(true);
      expect(await fs.pathExists(path.join(presentationPath, 'widgets'))).toBe(true);
    });

    test('should generate BLoC state management files', async () => {
      const command = new RefactorCommand();
      await command.execute(reactSource, flutterTarget, {
        ai: 'mock',
        stateManagement: 'bloc',
        interactive: false
      });

      const blocPath = path.join(flutterTarget, 'lib', 'features', 'auth', 'presentation', 'bloc');

      // Check BLoC files exist
      const blocFile = path.join(blocPath, 'auth_bloc.dart');
      const eventFile = path.join(blocPath, 'auth_event.dart');
      const stateFile = path.join(blocPath, 'auth_state.dart');

      expect(await fs.pathExists(blocFile)).toBe(true);
      expect(await fs.pathExists(eventFile)).toBe(true);
      expect(await fs.pathExists(stateFile)).toBe(true);

      // Verify content
      const blocContent = await fs.readFile(blocFile, 'utf8');
      expect(blocContent).toContain('class AuthBloc');
      expect(blocContent).toContain('extends Bloc<AuthEvent, AuthState>');
    });

    test('should generate repository pattern correctly', async () => {
      const command = new RefactorCommand();
      await command.execute(reactSource, flutterTarget, {
        ai: 'mock',
        stateManagement: 'bloc',
        interactive: false
      });

      // Check repository interface (domain)
      const repoInterface = path.join(
        flutterTarget, 'lib', 'features', 'auth', 'domain', 'repositories', 'auth_repository.dart'
      );
      expect(await fs.pathExists(repoInterface)).toBe(true);

      const interfaceContent = await fs.readFile(repoInterface, 'utf8');
      expect(interfaceContent).toContain('abstract class AuthRepository');

      // Check repository implementation (data)
      const repoImpl = path.join(
        flutterTarget, 'lib', 'features', 'auth', 'data', 'repositories', 'auth_repository_impl.dart'
      );
      expect(await fs.pathExists(repoImpl)).toBe(true);

      const implContent = await fs.readFile(repoImpl, 'utf8');
      expect(implContent).toContain('class AuthRepositoryImpl implements AuthRepository');
    });

    test('should generate use cases for business logic', async () => {
      const command = new RefactorCommand();
      await command.execute(reactSource, flutterTarget, {
        ai: 'mock',
        stateManagement: 'bloc',
        interactive: false
      });

      const usecasesPath = path.join(flutterTarget, 'lib', 'features', 'auth', 'domain', 'usecases');

      // Check for login use case
      const loginUseCase = path.join(usecasesPath, 'login_usecase.dart');
      expect(await fs.pathExists(loginUseCase)).toBe(true);

      const content = await fs.readFile(loginUseCase, 'utf8');
      expect(content).toContain('class LoginUseCase');
      expect(content).toContain('Future<Either<Failure, User>> call');
    });

    test('should generate UI page with proper structure', async () => {
      const command = new RefactorCommand();
      await command.execute(reactSource, flutterTarget, {
        ai: 'mock',
        stateManagement: 'bloc',
        interactive: false
      });

      const loginPage = path.join(
        flutterTarget, 'lib', 'features', 'auth', 'presentation', 'pages', 'login_page.dart'
      );
      expect(await fs.pathExists(loginPage)).toBe(true);

      const content = await fs.readFile(loginPage, 'utf8');
      expect(content).toContain('class LoginPage');
      expect(content).toContain('StatefulWidget');
      expect(content).toContain('BlocProvider');
      expect(content).toContain('BlocBuilder');
    });

    test('should pass validation checks', async () => {
      const command = new RefactorCommand({
        reactSource,
        flutterTarget,
        validate: true,
        stateManagement: 'bloc',
        interactive: false
      });
      const result = await command.execute();

      expect(result.validation).toBeDefined();
      expect(result.validation.passed).toBe(true);
      expect(result.validation.score).toBeGreaterThan(80);
    });
  });

  describe('Multiple Features Conversion', () => {
    beforeEach(async () => {
      // Create React app with multiple features
      await createMultiFeatureReactApp(reactSource);
    });

    test('should convert multiple features independently', async () => {
      const command = new RefactorCommand();
      await command.execute(reactSource, flutterTarget, {
        ai: 'mock',
        stateManagement: 'bloc',
        interactive: false
      });

      // Verify all features exist
      const featuresPath = path.join(flutterTarget, 'lib', 'features');
      const features = await fs.readdir(featuresPath);

      expect(features).toContain('auth');
      expect(features).toContain('dashboard');
      expect(features).toContain('profile');

      // Each feature should have complete structure
      for (const feature of ['auth', 'dashboard', 'profile']) {
        const featurePath = path.join(featuresPath, feature);
        expect(await fs.pathExists(path.join(featurePath, 'domain'))).toBe(true);
        expect(await fs.pathExists(path.join(featurePath, 'data'))).toBe(true);
        expect(await fs.pathExists(path.join(featurePath, 'presentation'))).toBe(true);
      }
    });
  });
});

// Helper functions
async function createSampleReactApp(reactPath) {
  // Create package.json
  await fs.writeJson(path.join(reactPath, 'package.json'), {
    name: 'react-test-app',
    version: '1.0.0',
    dependencies: {
      'react': '^18.0.0',
      'react-redux': '^8.0.0'
    }
  });

  // Create LoginPage component
  const loginPagePath = path.join(reactPath, 'src', 'features', 'auth');
  await fs.ensureDir(loginPagePath);

  await fs.writeFile(path.join(loginPagePath, 'LoginPage.jsx'), `
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login({ email, password }));
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
`);

  // Create Redux slice
  await fs.writeFile(path.join(loginPagePath, 'authSlice.js'), `
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
`);
}

async function createMultiFeatureReactApp(reactPath) {
  await createSampleReactApp(reactPath);

  // Add Dashboard feature
  const dashboardPath = path.join(reactPath, 'src', 'features', 'dashboard');
  await fs.ensureDir(dashboardPath);
  await fs.writeFile(path.join(dashboardPath, 'Dashboard.jsx'), `
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from './dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        {/* Stats display */}
      </div>
    </div>
  );
};

export default Dashboard;
`);

  // Add Profile feature
  const profilePath = path.join(reactPath, 'src', 'features', 'profile');
  await fs.ensureDir(profilePath);
  await fs.writeFile(path.join(profilePath, 'Profile.jsx'), `
import React from 'react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const user = useSelector(state => state.auth.user);

  return (
    <div className="profile">
      <h1>User Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
};

export default Profile;
`);
}

async function verifyCleanArchitecture(flutterPath) {
  const requiredStructure = [
    'lib/core',
    'lib/features',
    'lib/config',
    'test/features'
  ];

  for (const dir of requiredStructure) {
    const fullPath = path.join(flutterPath, dir);
    expect(await fs.pathExists(fullPath)).toBe(true);
  }
}
