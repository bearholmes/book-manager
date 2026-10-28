import { BookOpen, ChartNoAxesCombined, LockKeyhole, Settings2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLock } from '@/features/lock';
import libraryLogo from '@/shared/assets/branding/library-logo-32.png';
import libraryLogoRetina from '@/shared/assets/branding/library-logo-64.png';
import { ROUTES } from '@/shared/config/routes';
import { useToast } from '@/shared/notifications/hooks/useToast';
import { Button } from '@/shared/ui/Button';
import { AppRoutes } from '../routes';
import styles from './DesktopLayout.module.css';

export function DesktopLayout() {
  const { state, lock } = useLock();
  const toast = useToast();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src={libraryLogo} srcSet={`${libraryLogoRetina} 2x`} width={28} height={28} alt="" />
          <strong>방구석 도서관리</strong>
        </div>
        <nav aria-label="주 메뉴">
          <NavLink to={ROUTES.HOME} end>
            <BookOpen size={18} />
            나의 서재
          </NavLink>
          <NavLink to={ROUTES.STATS}>
            <ChartNoAxesCombined size={18} />
            통계
          </NavLink>
          <NavLink to={ROUTES.SETTINGS}>
            <Settings2 size={18} />
            설정
          </NavLink>
        </nav>
        {state.enabled && (
          <div className={styles.bottom}>
            <Button
              variant="secondary"
              type="button"
              className="w-full"
              onClick={() =>
                void lock().catch(() => toast.error('서재를 잠그지 못했습니다. 다시 시도해주세요.'))
              }
            >
              <LockKeyhole size={16} />
              서재 잠금
            </Button>
          </div>
        )}
      </aside>
      <main className={styles.main}>
        <AppRoutes />
      </main>
    </div>
  );
}
