import { join } from 'node:path';
import { BrowserView, BrowserWindow, Utils } from 'electrobun/main';
import type { DesktopRPC } from '../contracts/desktop';
import { DesktopService } from './application/command-service';
import { openLibrary } from './application/open-library';
import type { LibraryDatabase } from './library/repository';
import { installApplicationMenu } from './platform/application-menu';
import { writeNativeExport } from './platform/export-writer';

const dataDirectory = process.env.BOOK_MANAGER_DATA_DIR ?? join(Utils.paths.appData, 'ReadingDesk');
let library: LibraryDatabase | undefined;
async function initializeService() {
  library = await openLibrary(dataDirectory);
  return new DesktopService(library, writeNativeExport);
}
let serviceReady: Promise<DesktopService> | undefined;
function getService() {
  serviceReady ??= initializeService().catch((error) => {
    serviceReady = undefined;
    throw error;
  });
  return serviceReady;
}

installApplicationMenu();

const rpc = BrowserView.defineRPC<DesktopRPC>({
  maxRequestTime: 120000,
  handlers: {
    requests: {
      execute: async (request) => {
        try {
          return await (await getService()).execute(request);
        } catch (error) {
          return {
            ok: false as const,
            error:
              error instanceof Error && /[가-힣]/.test(error.message)
                ? error.message
                : '저장소를 열지 못했습니다. 앱이 이미 실행 중인지 확인하고 다시 실행해주세요.',
          };
        }
      },
    },
    messages: {},
  },
});

const mainWindow = new BrowserWindow({
  title: '방구석 도서관리',
  url: 'views://main/index.html',
  frame: { width: 1360, height: 900 },
  renderer: 'native',
  navigationRules: JSON.stringify(['views://main/*']),
  rpc,
});
mainWindow.setTitle('');

process.on('exit', () => library?.close());
