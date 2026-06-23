import { act, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import CourseTasksSection from '../../src/components/tasks/CourseTasksSection.jsx';
import { DashboardProvider } from '../../src/context/DashboardContext.jsx';
import {
  changeSelectValue,
  findButtonByText,
  flushUpdates,
  installMinimalBrowser,
} from './minimal-browser.js';

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

/** @type {{ current: ((value: import('../../src/services/study-materials.service.js').MaterialSummary[]) => void) | null }} */
const setMaterialsRef = { current: null };

/** @type {{ current: ((value: string) => void) | null }} */
const setCourseIdRef = { current: null };

/**
 * @param {{
 *   initialEntry?: string,
 *   courseId?: string,
 *   materials?: import('../../src/services/study-materials.service.js').MaterialSummary[],
 *   handleAuthError?: (err: unknown) => Promise<boolean>,
 * }} [options]
 */
export async function renderCourseTasksSection(options = {}) {
  const {
    initialEntry = '/courses/11111111-1111-4111-8111-111111111111',
    courseId = '11111111-1111-4111-8111-111111111111',
    materials = [],
    handleAuthError = async () => false,
  } = options;

  setMaterialsRef.current = null;

  const browser = installMinimalBrowser();
  const root = createRoot(browser.container);

  function Harness() {
    const [materialsState, setMaterials] = useState(materials);
    const [activeCourseId, setActiveCourseId] = useState(courseId);

    useEffect(() => {
      setMaterialsRef.current = setMaterials;
      setCourseIdRef.current = setActiveCourseId;
      return () => {
        setMaterialsRef.current = null;
        setCourseIdRef.current = null;
      };
    }, []);

    return (
      <DashboardProvider>
        <SearchProbe>
          <CourseTasksSection
            courseId={activeCourseId}
            materials={materialsState}
            handleAuthError={handleAuthError}
          />
        </SearchProbe>
      </DashboardProvider>
    );
  }

  const router = createMemoryRouter(
    [
      { path: '/courses/:courseId', element: <Harness /> },
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
    getMaterialFilterValue() {
      const select = browser.container.querySelector('#course-tasks-material-filter');
      return select?.value ?? 'all';
    },
    /**
     * @param {string} label
     */
    getStatusButton(label) {
      return findButtonByText(browser.container, label);
    },
    /**
     * @param {string} label
     */
    getDeadlineButton(label) {
      return findButtonByText(browser.container, label);
    },
    /**
     * @param {import('../../src/services/study-materials.service.js').MaterialSummary[]} nextMaterials
     */
    async setMaterials(nextMaterials) {
      if (!setMaterialsRef.current) {
        throw new Error('setMaterials called before harness mounted');
      }
      await act(async () => {
        setMaterialsRef.current(nextMaterials);
      });
      await flushUpdates();
      await flushUpdates();
    },
    /**
     * @param {string} nextCourseId
     */
    async setCourseId(nextCourseId) {
      if (!setCourseIdRef.current) {
        throw new Error('setCourseId called before harness mounted');
      }
      await act(async () => {
        setCourseIdRef.current(nextCourseId);
      });
      await flushUpdates();
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
    /**
     * @param {string} linkText
     */
    async clickLink(linkText) {
      await act(async () => {
        const links = browser.container.querySelectorAll('a');
        const link = Array.from(links).find((node) => node.textContent === linkText);
        if (!link) {
          throw new Error(`clickLink: missing ${linkText}`);
        }
        link.click();
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
