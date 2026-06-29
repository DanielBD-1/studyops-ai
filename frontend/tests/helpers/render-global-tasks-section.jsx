import { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import GlobalTasksSection from '../../src/components/tasks/GlobalTasksSection.jsx';
import { DashboardProvider } from '../../src/context/DashboardContext.jsx';
import {
  changeSelectValue,
  findButtonByText,
  flushUpdates,
  installMinimalBrowser,
} from './minimal-browser.js';

/**
 * @param {HTMLElement | null | undefined} element
 * @returns {string | null}
 */
function getReactControlledSelectValue(element) {
  if (!element || typeof element !== 'object') {
    return null;
  }

  const fiberKey = Object.keys(element).find(
    (key) => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
  );
  if (!fiberKey) {
    return null;
  }

  /** @type {{ memoizedProps?: { value?: string }, return?: unknown } | undefined} */
  let fiber = element[fiberKey];
  while (fiber) {
    const value = fiber.memoizedProps?.value;
    if (typeof value === 'string') {
      return value;
    }
    fiber = fiber.return;
  }

  return null;
}

/**
 * @param {import('react').ReactNode} children
 */
function SearchProbe({ children }) {
  const location = useLocation();

  return (
    <>
      <div data-test-search={location.search} aria-hidden="true" />
      {children}
    </>
  );
}

/**
 * @param {{
 *   initialEntry?: string,
 *   courses?: import('../../src/services/courses.service.js').Course[],
 *   handleAuthError?: (err: unknown) => Promise<boolean>,
 * }} [options]
 */
export async function renderGlobalTasksSection(options = {}) {
  const {
    initialEntry = '/tasks',
    courses = [],
    handleAuthError = async () => false,
  } = options;

  const browser = installMinimalBrowser();
  const root = createRoot(browser.container);

  function Harness() {
    return (
      <DashboardProvider>
        <SearchProbe>
          <GlobalTasksSection courses={courses} handleAuthError={handleAuthError} />
        </SearchProbe>
      </DashboardProvider>
    );
  }

  const router = createMemoryRouter(
    [
      { path: '/tasks', element: <Harness /> },
      { path: '/focus/:taskId', element: <SearchProbe>{null}</SearchProbe> },
    ],
    { initialEntries: [initialEntry] }
  );

  await act(async () => {
    root.render(<RouterProvider router={router} />);
  });

  await flushUpdates();
  await flushUpdates();

  return {
    container: browser.container,
    router,
    /**
     * @param {string} selector
     */
    query(selector) {
      return browser.container.querySelector(selector);
    },
    getSearchString() {
      return router.state.location.search;
    },
    getCourseFilterValue() {
      const select = browser.container.querySelector('#global-tasks-course-filter');
      if (!select) {
        return 'all';
      }
      return getReactControlledSelectValue(select) ?? select.value ?? 'all';
    },
    getMaterialFilterValue() {
      const select = browser.container.querySelector('#global-tasks-material-filter');
      if (!select) {
        return 'all';
      }
      return getReactControlledSelectValue(select) ?? select.value ?? 'all';
    },
    /**
     * @param {string} selector
     * @param {string} value
     */
    async changeSelect(selector, value) {
      await act(async () => {
        const select = browser.container.querySelector(selector);
        if (!select) {
          throw new Error(`changeSelect: missing ${selector}`);
        }
        changeSelectValue(select, value);
      });
      await flushUpdates();
      await flushUpdates();
    },
    /**
     * @param {string} label
     */
    async clickButton(label) {
      await act(async () => {
        const button = findButtonByText(browser.container, label);
        if (!button) {
          throw new Error(`clickButton: missing ${label}`);
        }
        button.click();
      });
      await flushUpdates();
      await flushUpdates();
    },
    async goBack() {
      await act(async () => {
        router.navigate(-1);
      });
      await flushUpdates();
      await flushUpdates();
    },
    async goForward() {
      await act(async () => {
        router.navigate(1);
      });
      await flushUpdates();
      await flushUpdates();
    },
    /**
     * @param {string} path
     */
    async navigateTo(path) {
      await act(async () => {
        router.navigate(path);
      });
      await flushUpdates();
      await flushUpdates();
    },
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      await flushUpdates();
      browser.cleanup();
    },
  };
}
