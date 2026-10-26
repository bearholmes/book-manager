import { ApplicationMenu } from 'electrobun/main';

export function installApplicationMenu() {
  ApplicationMenu.setApplicationMenu([
    { label: '방구석 도서관리', submenu: [{ label: '종료', role: 'quit', accelerator: 'q' }] },
    {
      label: '편집',
      submenu: [
        { label: '실행 취소', role: 'undo', accelerator: 'z' },
        { label: '다시 실행', role: 'redo' },
        { type: 'separator' },
        { label: '잘라내기', role: 'cut', accelerator: 'x' },
        { label: '복사', role: 'copy', accelerator: 'c' },
        { label: '붙여넣기', role: 'paste', accelerator: 'v' },
        { label: '전체 선택', role: 'selectAll', accelerator: 'a' },
      ],
    },
    {
      label: '윈도우',
      submenu: [
        { label: '최소화', role: 'minimize' },
        { label: '창 닫기', role: 'close', accelerator: 'w' },
      ],
    },
  ]);
}
