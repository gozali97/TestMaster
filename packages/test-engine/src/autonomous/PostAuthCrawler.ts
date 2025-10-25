import { Browser } from 'playwright';
import { WebsiteCrawler } from '../discovery/WebsiteCrawler';
import { PageInfo } from './AutonomousTestingOrchestrator';
import { LoginResult } from './EnhancedLoginFlow';

/**
 * Post-Authentication Crawler
 * 
 * Re-crawls website with authentication to discover protected pages
 */
export class PostAuthCrawler {
  constructor(private browser: Browser) {}

  /**
   * Crawl website with authentication
   */
  async crawlAuthenticated(
    baseUrl: string,
    authState: LoginResult,
    depth: 'shallow' | 'deep' | 'exhaustive',
    onProgress?: (progress: any) => void
  ): Promise<AuthenticatedWebsiteMap> {
    console.log('\n🔐 Starting post-authentication crawling...');
    console.log(`   Base URL: ${baseUrl}`);
    console.log(`   Depth: ${depth}`);

    // Create new page with auth context
    const page = await this.browser.newPage();

    try {
      // Restore auth state (cookies & localStorage)
      console.log('   Restoring authentication state...');
      
      if (authState.cookies && authState.cookies.length > 0) {
        await page.context().addCookies(authState.cookies);
        console.log(`   ✅ Restored ${authState.cookies.length} cookies`);
      }

      // Navigate to base URL first to set domain for localStorage
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      if (authState.localStorage) {
        await page.evaluate((ls) => {
          try {
            const data = JSON.parse(ls);
            for (const [key, value] of Object.entries(data)) {
              window.localStorage.setItem(key, value as string);
            }
          } catch (e) {}
        }, authState.localStorage);
        console.log('   ✅ Restored localStorage');
      }

      // Reload to apply auth state
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      console.log('   ✅ Authentication state applied');

      // Start crawling (now authenticated!)
      console.log('   Starting authenticated crawl...');
      const crawler = new WebsiteCrawler(page, onProgress);
      const websiteMap = await crawler.crawl(baseUrl, depth);

      console.log(`   ✅ Crawled ${websiteMap.pages.length} authenticated pages`);

      // Analyze discovered pages
      const analysis = this.analyzeAuthenticatedPages(websiteMap.pages);

      return {
        baseUrl,
        pages: websiteMap.pages,
        userFlows: websiteMap.userFlows,
        interactions: websiteMap.interactions,
        authOnlyPages: analysis.authOnlyPages,
        crudPages: analysis.crudPages,
        dashboardPages: analysis.dashboardPages,
        settingsPages: analysis.settingsPages,
      };

    } finally {
      await page.close();
    }
  }

  /**
   * Analyze authenticated pages
   */
  private analyzeAuthenticatedPages(pages: PageInfo[]): PageAnalysis {
    console.log('\n📊 Analyzing authenticated pages...');

    // Identify auth-only pages (dashboard, profile, etc.)
    const authOnlyPages = pages.filter(p => {
      const url = p.url.toLowerCase();
      const title = p.title.toLowerCase();
      
      return url.includes('/dashboard') ||
             url.includes('/profile') ||
             url.includes('/account') ||
             url.includes('/settings') ||
             url.includes('/admin') ||
             title.includes('dashboard') ||
             title.includes('profile') ||
             title.includes('account');
    });

    console.log(`   Found ${authOnlyPages.length} auth-only pages`);

    // Identify CRUD pages
    const crudPages = this.identifyCRUDPages(pages);
    console.log(`   Found ${crudPages.createPages.length} create pages`);
    console.log(`   Found ${crudPages.editPages.length} edit pages`);
    console.log(`   Found ${crudPages.listPages.length} list pages`);

    // Identify dashboard pages
    const dashboardPages = pages.filter(p =>
      p.url.toLowerCase().includes('/dashboard') ||
      p.title.toLowerCase().includes('dashboard')
    );

    // Identify settings pages
    const settingsPages = pages.filter(p =>
      p.url.toLowerCase().includes('/settings') ||
      p.url.toLowerCase().includes('/preferences') ||
      p.title.toLowerCase().includes('settings') ||
      p.title.toLowerCase().includes('preferences')
    );

    return {
      authOnlyPages,
      crudPages,
      dashboardPages,
      settingsPages,
    };
  }

  /**
   * Identify CRUD pages (/create, /new, /edit, etc.)
   */
  private identifyCRUDPages(pages: PageInfo[]): CRUDPagesMap {
    const createPages = pages.filter(p => {
      const url = p.url.toLowerCase();
      const title = p.title.toLowerCase();
      
      return url.includes('/create') ||
             url.includes('/new') ||
             url.includes('/add') ||
             url.match(/\/(create|new|add)$/i) ||
             title.includes('create') ||
             title.includes('new') ||
             title.includes('add');
    });

    const editPages = pages.filter(p => {
      const url = p.url.toLowerCase();
      const title = p.title.toLowerCase();
      
      return url.includes('/edit') ||
             url.match(/\/edit\/\d+/i) ||
             title.includes('edit');
    });

    const listPages = pages.filter(p => {
      const url = p.url.toLowerCase();
      const title = p.title.toLowerCase();
      
      // List pages often have plural nouns
      return url.match(/\/(users|items|products|posts|articles|customers)/i) &&
             !url.includes('/create') &&
             !url.includes('/edit') &&
             !url.includes('/new');
    });

    const deletePages = pages.filter(p => {
      const url = p.url.toLowerCase();
      
      return url.includes('/delete') ||
             p.elements.some(e => 
               e.text?.toLowerCase().includes('delete') ||
               e.text?.toLowerCase().includes('remove')
             );
    });

    return {
      createPages,
      editPages,
      listPages,
      deletePages,
    };
  }
}

// Types
export interface AuthenticatedWebsiteMap {
  baseUrl: string;
  pages: PageInfo[];
  userFlows?: any[];
  interactions?: any[];
  authOnlyPages: PageInfo[];
  crudPages: CRUDPagesMap;
  dashboardPages: PageInfo[];
  settingsPages: PageInfo[];
}

export interface CRUDPagesMap {
  createPages: PageInfo[];
  editPages: PageInfo[];
  listPages: PageInfo[];
  deletePages: PageInfo[];
}

interface PageAnalysis {
  authOnlyPages: PageInfo[];
  crudPages: CRUDPagesMap;
  dashboardPages: PageInfo[];
  settingsPages: PageInfo[];
}
