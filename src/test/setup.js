import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only self-registers cleanup when vitest globals are enabled. This
// project imports its test helpers explicitly, so the hook is registered here instead;
// without it, rendered trees accumulate across tests and queries match stale nodes.
afterEach(cleanup);
