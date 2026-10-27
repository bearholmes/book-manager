import type { LicenseGroup } from '../model/types';
import styles from './LicenseNotices.module.css';

export default function LicenseNotices({ groups }: { groups: LicenseGroup[] }) {
  return (
    <div className={styles.content}>
      <p className={styles.introduction}>
        이 앱에서 사용하는 글꼴과 오픈소스의 저작권 및 라이선스 안내입니다. 항목을 펼치면 원문을
        읽을 수 있습니다.
      </p>
      {groups.map((group) => (
        <section key={group.title} className={styles.group} aria-label={group.title}>
          <h3>{group.title}</h3>
          {group.items.map((item) => (
            <details key={`${item.name}-${item.version}`} className={styles.notice}>
              <summary>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.meta}>
                  {item.version} · {item.license}
                </span>
              </summary>
              {item.notices.map((notice) => (
                <div key={notice.title}>
                  {item.notices.length > 1 && <h4>{notice.title}</h4>}
                  <pre>{notice.text}</pre>
                </div>
              ))}
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}
