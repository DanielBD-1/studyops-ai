import { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import GlobalFlashcardsSection from '../../src/components/flashcards/GlobalFlashcardsSection.jsx';
import { DashboardProvider } from '../../src/context/DashboardContext.jsx';
import { changeSelectValue, flushUpdates, installMinimalBrowser } from './minimal-browser.js';

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
export async function renderGlobalFlashcardsSection(options = {}) {
  const {
    initialEntry = '/flashcards',
    courses = [],
    handleAuthError = async () => false,
  } = options;

  const browser = installMinimalBrowser();
  const root = createRoot(browser.container);

  function Harness() {
    return (
      <DashboardProvider>
        <SearchProbe>
          <GlobalFlashcardsSection courses={courses} handleAuthError={handleAuthError} />
        </SearchProbe>
      </DashboardProvider>
    );
  }

  const router = createMemoryRouter(
    [{ path: '/flashcards', element: <Harness /> }],
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
    async update() {
      await act(async () => {});
      await flushUpdates();
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
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      await flushUpdates();
      browser.cleanup();
    },
  };
}
