[![Netlify Status](https://api.netlify.com/api/v1/badges/8b487474-1c9f-4335-a977-3fde0cbe4d85/deploy-status)](https://app.netlify.com/sites/book-management-demo/deploys)
# 방구석 도서관리 📚

- 집에 굴러다니는 책을 관리하기 위해 시작.
- 한 달에 1-2권을 구매하는 데, DB까지 필요할까. JSON 파일으로 관리해보자.

## DEMO
- User : https://book-management-demo.netlify.app/
- Admin : https://book-management-demo.netlify.app/admin

## 히스토리
- nuxt.js 3.0 RC 출시에 따라 알아볼 겸, 프레임워크로 선택
  - [nuxt 3 documentation](https://v3.nuxtjs.org) 
- 퇴근 후, 주말 등 틈틈이 시간내서 작업 

## 설정

Make sure to install the dependencies:

```bash
# npm
npm install
```

### Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment) for more information.

## TODO
- 추가시 유효성/필수표시, 표지이미지 에러처리
- 정렬시 해당 값 목록에 표시

### next.
- 도서정보자동입력(daum  api)
- 복사기능(중복구매)
- 라우터가드
