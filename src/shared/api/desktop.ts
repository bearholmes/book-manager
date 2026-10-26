import type { CommandName, CommandResult, Commands, DesktopRPC } from '@contracts/desktop';

let transport:
  | Promise<(request: { command: CommandName; payload: unknown }) => Promise<CommandResult>>
  | undefined;

async function getTransport() {
  const token = import.meta.env.VITE_LOCAL_API_TOKEN;
  if (import.meta.env.DEV && token) {
    return async (request: { command: CommandName; payload: unknown }): Promise<CommandResult> => {
      const response = await fetch(import.meta.env.VITE_LOCAL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Local-Token': token },
        body: JSON.stringify(request),
      });
      if (!response.ok)
        throw new Error('로컬 저장소에 연결하지 못했습니다. 앱을 다시 실행해주세요.');
      return response.json();
    };
  }
  if (!window.__electrobun)
    throw new Error('데스크탑 앱에서 실행해주세요. 개발 시에는 pnpm dev를 사용하세요.');
  const { Electroview } = await import('electrobun/view');
  const rpc = Electroview.defineRPC<DesktopRPC>({
    maxRequestTime: 120000,
    handlers: { requests: {}, messages: {} },
  });
  new Electroview({ rpc });
  return (request: { command: CommandName; payload: unknown }) => rpc.request.execute(request);
}

export async function desktop<K extends CommandName>(
  command: K,
  payload: Commands[K]['params'],
): Promise<Commands[K]['result']> {
  transport ??= getTransport().catch((error) => {
    transport = undefined;
    throw error;
  });
  const result = await (await transport)({ command, payload });
  if (!result.ok) throw new Error(result.error);
  return result.data as Commands[K]['result'];
}
