import { LockProvider } from '@/features/lock';
import { ToastContainer } from '@/shared/notifications/components/ToastContainer';
import { DesktopLayout } from './layout/DesktopLayout';

export default function App() {
  return (
    <>
      <LockProvider>
        <DesktopLayout />
      </LockProvider>
      <ToastContainer />
    </>
  );
}
