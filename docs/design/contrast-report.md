# 제안 색상 대비 검사

생성: `node docs/design/verify-design.mjs`. DESIGN.md 원본과 DTCG HEX 값의 일치 및 양 모드 역할 일치를 검사한다.
색상 키 집합은 양방향으로 비교한다. 비색상 전체 동기화 검사는 아니며 서체·간격·모션은 수동 리뷰가 필요하다.
WCAG sRGB 상대 휘도 공식, 불투명 단색 쌍만 검사. 전체 제품 접근성·색각·인접 차트 판별 검증이 아니다.

- 모드별 의미색: 55개 (스키마 primary 별칭 제외)
- 검사한 쌍: 138개
- 통과: 138개 / 실패: 0개
- 구분선 rule은 장식용이므로 3:1 검사 대상이 아님. 기능적 경계는 control로 별도 검사.
- disabled는 WCAG 예외이지만 여기서는 자발적으로 4.5:1 이상을 검사.

| 모드 | 전경 / 배경 | 목적 | 대비 | 기준 | 결과 |
| --- | --- | --- | --- | --- | --- |
| light | ink / canvas | text | 12.77:1 | 4.5:1 | PASS |
| light | ink / chrome | text | 11.56:1 | 4.5:1 | PASS |
| light | ink / surface | text | 13.45:1 | 4.5:1 | PASS |
| light | ink / raised | text | 14.01:1 | 4.5:1 | PASS |
| light | ink / hover | text | 11.78:1 | 4.5:1 | PASS |
| light | ink / selected | text | 11.62:1 | 4.5:1 | PASS |
| light | secondary / canvas | text | 6.28:1 | 4.5:1 | PASS |
| light | secondary / chrome | text | 5.69:1 | 4.5:1 | PASS |
| light | secondary / surface | text | 6.62:1 | 4.5:1 | PASS |
| light | secondary / raised | text | 6.90:1 | 4.5:1 | PASS |
| light | secondary / hover | text | 5.80:1 | 4.5:1 | PASS |
| light | secondary / selected | text | 5.72:1 | 4.5:1 | PASS |
| light | muted / canvas | text | 5.09:1 | 4.5:1 | PASS |
| light | muted / chrome | text | 4.61:1 | 4.5:1 | PASS |
| light | muted / surface | text | 5.36:1 | 4.5:1 | PASS |
| light | muted / raised | text | 5.58:1 | 4.5:1 | PASS |
| light | muted / hover | text | 4.70:1 | 4.5:1 | PASS |
| light | muted / selected | text | 4.63:1 | 4.5:1 | PASS |
| light | on-action / action | button | 7.55:1 | 4.5:1 | PASS |
| light | on-action / action-hover | button | 9.72:1 | 4.5:1 | PASS |
| light | on-action / action-pressed | button | 11.88:1 | 4.5:1 | PASS |
| light | action / surface | link | 7.18:1 | 4.5:1 | PASS |
| light | action / raised | link | 7.48:1 | 4.5:1 | PASS |
| light | action / canvas | link | 6.82:1 | 4.5:1 | PASS |
| light | on-disabled / disabled | disabled (voluntary) | 4.87:1 | 4.5:1 | PASS |
| light | on-danger / danger-solid | danger button | 6.28:1 | 4.5:1 | PASS |
| light | success / success-subtle | status | 5.99:1 | 4.5:1 | PASS |
| light | success / raised | status text | 7.05:1 | 4.5:1 | PASS |
| light | danger / danger-subtle | status | 5.27:1 | 4.5:1 | PASS |
| light | danger / raised | status text | 6.23:1 | 4.5:1 | PASS |
| light | warning / warning-subtle | status | 5.71:1 | 4.5:1 | PASS |
| light | warning / raised | status text | 6.65:1 | 4.5:1 | PASS |
| light | info / info-subtle | status | 5.81:1 | 4.5:1 | PASS |
| light | info / raised | status text | 6.81:1 | 4.5:1 | PASS |
| light | danger-hover / raised | danger hover | 8.09:1 | 4.5:1 | PASS |
| light | focus / chrome | focus | 6.18:1 | 3:1 | PASS |
| light | focus / canvas | focus | 6.82:1 | 3:1 | PASS |
| light | focus / surface | focus | 7.18:1 | 3:1 | PASS |
| light | focus / raised | focus | 7.48:1 | 3:1 | PASS |
| light | focus / hover | focus | 6.29:1 | 3:1 | PASS |
| light | focus / selected | focus | 6.21:1 | 3:1 | PASS |
| light | control / surface | control boundary | 3.54:1 | 3:1 | PASS |
| light | control / raised | control boundary | 3.69:1 | 3:1 | PASS |
| light | control / canvas | control boundary | 3.36:1 | 3:1 | PASS |
| light | chart-1 / surface | chart vs plot only | 7.18:1 | 3:1 | PASS |
| light | chart-2 / surface | chart vs plot only | 5.62:1 | 3:1 | PASS |
| light | chart-3 / surface | chart vs plot only | 5.46:1 | 3:1 | PASS |
| light | chart-4 / surface | chart vs plot only | 5.63:1 | 3:1 | PASS |
| light | chart-5 / surface | chart vs plot only | 5.96:1 | 3:1 | PASS |
| light | chart-6 / surface | chart vs plot only | 5.18:1 | 3:1 | PASS |
| light | nav-on-selected / nav-selected | navigation text/icon | 5.44:1 | 4.5:1 | PASS |
| light | nav-selected / chrome | light navigation current-page fill | 4.68:1 | 3:1 | PASS |
| light | nav-on-selected / nav-selected-hover | navigation text/icon | 6.23:1 | 4.5:1 | PASS |
| light | nav-selected-hover / chrome | light navigation current-page fill | 5.36:1 | 3:1 | PASS |
| light | secondary / nav-hover | navigation hover text | 5.23:1 | 4.5:1 | PASS |
| light | focus / nav-hover | navigation focus outside 2px gap | 5.67:1 | 3:1 | PASS |
| light | category-ink / category-1 | topic chip | 11.97:1 | 4.5:1 | PASS |
| light | category-ink / category-2 | topic chip | 11.16:1 | 4.5:1 | PASS |
| light | category-ink / category-3 | topic chip | 12.04:1 | 4.5:1 | PASS |
| light | category-ink / category-4 | topic chip | 11.53:1 | 4.5:1 | PASS |
| light | category-ink / category-5 | topic chip | 11.15:1 | 4.5:1 | PASS |
| light | category-ink / category-6 | topic chip | 12.26:1 | 4.5:1 | PASS |
| light | category-ink / category-7 | topic chip | 11.68:1 | 4.5:1 | PASS |
| light | category-ink / category-8 | topic chip | 11.76:1 | 4.5:1 | PASS |
| light | category-ink / category-9 | topic chip | 11.29:1 | 4.5:1 | PASS |
| light | category-ink / category-10 | topic chip | 10.82:1 | 4.5:1 | PASS |
| light | category-ink / category-11 | topic chip | 11.92:1 | 4.5:1 | PASS |
| light | category-ink / category-12 | topic chip | 11.14:1 | 4.5:1 | PASS |
| light | category-ink / category-13 | topic chip | 11.36:1 | 4.5:1 | PASS |
| light | category-ink / category-14 | topic chip | 11.43:1 | 4.5:1 | PASS |
| dark | ink / canvas | text | 13.53:1 | 4.5:1 | PASS |
| dark | ink / chrome | text | 14.33:1 | 4.5:1 | PASS |
| dark | ink / surface | text | 12.25:1 | 4.5:1 | PASS |
| dark | ink / raised | text | 10.55:1 | 4.5:1 | PASS |
| dark | ink / hover | text | 9.84:1 | 4.5:1 | PASS |
| dark | ink / selected | text | 7.91:1 | 4.5:1 | PASS |
| dark | secondary / canvas | text | 9.44:1 | 4.5:1 | PASS |
| dark | secondary / chrome | text | 9.99:1 | 4.5:1 | PASS |
| dark | secondary / surface | text | 8.54:1 | 4.5:1 | PASS |
| dark | secondary / raised | text | 7.36:1 | 4.5:1 | PASS |
| dark | secondary / hover | text | 6.86:1 | 4.5:1 | PASS |
| dark | secondary / selected | text | 5.52:1 | 4.5:1 | PASS |
| dark | muted / canvas | text | 7.92:1 | 4.5:1 | PASS |
| dark | muted / chrome | text | 8.39:1 | 4.5:1 | PASS |
| dark | muted / surface | text | 7.17:1 | 4.5:1 | PASS |
| dark | muted / raised | text | 6.18:1 | 4.5:1 | PASS |
| dark | muted / hover | text | 5.76:1 | 4.5:1 | PASS |
| dark | muted / selected | text | 4.63:1 | 4.5:1 | PASS |
| dark | on-action / action | button | 8.07:1 | 4.5:1 | PASS |
| dark | on-action / action-hover | button | 9.48:1 | 4.5:1 | PASS |
| dark | on-action / action-pressed | button | 6.88:1 | 4.5:1 | PASS |
| dark | action / surface | link | 8.27:1 | 4.5:1 | PASS |
| dark | action / raised | link | 7.12:1 | 4.5:1 | PASS |
| dark | action / canvas | link | 9.13:1 | 4.5:1 | PASS |
| dark | on-disabled / disabled | disabled (voluntary) | 5.17:1 | 4.5:1 | PASS |
| dark | on-danger / danger-solid | danger button | 6.86:1 | 4.5:1 | PASS |
| dark | success / success-subtle | status | 6.44:1 | 4.5:1 | PASS |
| dark | success / raised | status text | 7.16:1 | 4.5:1 | PASS |
| dark | danger / danger-subtle | status | 6.36:1 | 4.5:1 | PASS |
| dark | danger / raised | status text | 6.48:1 | 4.5:1 | PASS |
| dark | warning / warning-subtle | status | 6.67:1 | 4.5:1 | PASS |
| dark | warning / raised | status text | 7.46:1 | 4.5:1 | PASS |
| dark | info / info-subtle | status | 6.53:1 | 4.5:1 | PASS |
| dark | info / raised | status text | 7.21:1 | 4.5:1 | PASS |
| dark | danger-hover / raised | danger hover | 7.81:1 | 4.5:1 | PASS |
| dark | focus / chrome | focus | 11.11:1 | 3:1 | PASS |
| dark | focus / canvas | focus | 10.49:1 | 3:1 | PASS |
| dark | focus / surface | focus | 9.50:1 | 3:1 | PASS |
| dark | focus / raised | focus | 8.18:1 | 3:1 | PASS |
| dark | focus / hover | focus | 7.63:1 | 3:1 | PASS |
| dark | focus / selected | focus | 6.14:1 | 3:1 | PASS |
| dark | control / surface | control boundary | 3.90:1 | 3:1 | PASS |
| dark | control / raised | control boundary | 3.36:1 | 3:1 | PASS |
| dark | control / canvas | control boundary | 4.30:1 | 3:1 | PASS |
| dark | chart-1 / surface | chart vs plot only | 8.27:1 | 3:1 | PASS |
| dark | chart-2 / surface | chart vs plot only | 7.44:1 | 3:1 | PASS |
| dark | chart-3 / surface | chart vs plot only | 6.81:1 | 3:1 | PASS |
| dark | chart-4 / surface | chart vs plot only | 7.41:1 | 3:1 | PASS |
| dark | chart-5 / surface | chart vs plot only | 6.70:1 | 3:1 | PASS |
| dark | chart-6 / surface | chart vs plot only | 7.53:1 | 3:1 | PASS |
| dark | nav-on-selected / nav-selected | navigation text/icon | 7.91:1 | 4.5:1 | PASS |
| dark | nav-on-selected / nav-selected-hover | navigation text/icon | 7.91:1 | 4.5:1 | PASS |
| dark | secondary / nav-hover | navigation hover text | 6.86:1 | 4.5:1 | PASS |
| dark | focus / nav-hover | navigation focus outside 2px gap | 7.63:1 | 3:1 | PASS |
| dark | category-ink / category-1 | topic chip | 9.97:1 | 4.5:1 | PASS |
| dark | category-ink / category-2 | topic chip | 9.89:1 | 4.5:1 | PASS |
| dark | category-ink / category-3 | topic chip | 9.90:1 | 4.5:1 | PASS |
| dark | category-ink / category-4 | topic chip | 9.61:1 | 4.5:1 | PASS |
| dark | category-ink / category-5 | topic chip | 10.03:1 | 4.5:1 | PASS |
| dark | category-ink / category-6 | topic chip | 10.08:1 | 4.5:1 | PASS |
| dark | category-ink / category-7 | topic chip | 10.30:1 | 4.5:1 | PASS |
| dark | category-ink / category-8 | topic chip | 10.11:1 | 4.5:1 | PASS |
| dark | category-ink / category-9 | topic chip | 10.08:1 | 4.5:1 | PASS |
| dark | category-ink / category-10 | topic chip | 10.77:1 | 4.5:1 | PASS |
| dark | category-ink / category-11 | topic chip | 9.48:1 | 4.5:1 | PASS |
| dark | category-ink / category-12 | topic chip | 10.22:1 | 4.5:1 | PASS |
| dark | category-ink / category-13 | topic chip | 10.18:1 | 4.5:1 | PASS |
| dark | category-ink / category-14 | topic chip | 10.27:1 | 4.5:1 | PASS |
