# Supabase 메일 템플릿 (종류별 작성본)

Supabase Dashboard > Authentication > Email Templates 에서 아래 내용을 종류별로 복붙해서 사용할 수 있습니다.

## 1) Authentication emails (인증 메일)

### 1. Confirm sign up

Subject

```text
[방구석 도서관리] 회원가입 이메일 인증
```

Body (HTML)

```html
<h2>회원가입을 완료해 주세요</h2>
<p>아래 버튼을 눌러 이메일 인증을 완료하면 서비스를 이용할 수 있습니다.</p>
<p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
<p>요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.</p>
```

### 2. Invite user

Subject

```text
[방구석 도서관리] 초대 메일
```

Body (HTML)

```html
<h2>서비스 초대 안내</h2>
<p>{{ .SiteURL }} 서비스에 초대되었습니다.</p>
<p>아래 버튼을 눌러 초대를 수락하고 계정을 생성해 주세요.</p>
<p><a href="{{ .ConfirmationURL }}">초대 수락하기</a></p>
```

### 3. Magic link

Subject

```text
[방구석 도서관리] 로그인 링크
```

Body (HTML)

```html
<h2>로그인 링크 안내</h2>
<p>아래 버튼을 눌러 바로 로그인하세요.</p>
<p><a href="{{ .ConfirmationURL }}">로그인하기</a></p>
```

### 4. Change email address

Subject

```text
[방구석 도서관리] 이메일 변경 확인
```

Body (HTML)

```html
<h2>이메일 변경 확인</h2>
<p>계정 이메일을 {{ .NewEmail }}(으)로 변경하려면 아래 버튼을 눌러 주세요.</p>
<p><a href="{{ .ConfirmationURL }}">이메일 변경 확인</a></p>
<p>본인이 요청하지 않았다면 즉시 계정 보안을 확인해 주세요.</p>
```

### 5. Reset password

Subject

```text
[방구석 도서관리] 비밀번호 재설정 안내
```

Body (HTML)

```html
<h2>비밀번호 재설정</h2>
<p>아래 버튼을 눌러 새로운 비밀번호를 설정해 주세요.</p>
<p><a href="{{ .ConfirmationURL }}">비밀번호 재설정하기</a></p>
<p>요청하지 않으셨다면 이 메일을 무시하고 계정 보안을 점검해 주세요.</p>
```

### 6. Reauthentication

Subject

```text
[방구석 도서관리] 재인증 코드
```

Body (HTML)

```html
<h2>재인증 코드 안내</h2>
<p>아래 코드를 입력해 본인 인증을 완료해 주세요.</p>
<p><strong>{{ .Token }}</strong></p>
<p>요청하지 않으셨다면 이 메일을 무시하세요.</p>
```

## 2) Security notification emails (보안 알림 메일)

보안 알림은 템플릿만 작성해도 자동 발송되지 않습니다.
Dashboard에서 각 알림 항목의 `enabled` 값을 켜야 발송됩니다.

### 1. Password changed

Subject

```text
[방구석 도서관리] 비밀번호 변경 알림
```

Body (HTML)

```html
<h2>비밀번호가 변경되었습니다</h2>
<p>{{ .Email }} 계정의 비밀번호가 방금 변경되었습니다.</p>
<p>본인이 변경하지 않았다면 즉시 비밀번호를 재설정하고 고객센터에 문의해 주세요.</p>
```

### 2. Email address changed

Subject

```text
[방구석 도서관리] 이메일 변경 알림
```

Body (HTML)

```html
<h2>이메일 주소가 변경되었습니다</h2>
<p>계정 이메일이 {{ .OldEmail }}에서 {{ .Email }}(으)로 변경되었습니다.</p>
<p>본인이 요청하지 않았다면 즉시 계정 보안을 점검해 주세요.</p>
```

### 3. Phone number changed

Subject

```text
[방구석 도서관리] 전화번호 변경 알림
```

Body (HTML)

```html
<h2>전화번호가 변경되었습니다</h2>
<p>{{ .Email }} 계정의 전화번호가 {{ .OldPhone }}에서 {{ .Phone }}(으)로 변경되었습니다.</p>
<p>본인이 요청하지 않았다면 즉시 고객센터에 문의해 주세요.</p>
```

### 4. Identity linked

Subject

```text
[방구석 도서관리] 소셜 계정 연결 알림
```

Body (HTML)

```html
<h2>새 로그인 수단이 연결되었습니다</h2>
<p>{{ .Email }} 계정에 {{ .Provider }} 로그인 수단이 새로 연결되었습니다.</p>
<p>본인이 연결하지 않았다면 즉시 계정 보안을 점검해 주세요.</p>
```

### 5. Identity unlinked

Subject

```text
[방구석 도서관리] 소셜 계정 연결 해제 알림
```

Body (HTML)

```html
<h2>로그인 수단 연결이 해제되었습니다</h2>
<p>{{ .Email }} 계정에서 {{ .Provider }} 로그인 수단 연결이 해제되었습니다.</p>
<p>본인이 요청하지 않았다면 즉시 계정 보안을 점검해 주세요.</p>
```

### 6. MFA method added

Subject

```text
[방구석 도서관리] MFA 등록 알림
```

Body (HTML)

```html
<h2>MFA 인증 수단이 등록되었습니다</h2>
<p>{{ .Email }} 계정에 {{ .FactorType }} MFA 수단이 등록되었습니다.</p>
<p>본인이 등록하지 않았다면 즉시 계정 보안을 점검해 주세요.</p>
```

### 7. MFA method removed

Subject

```text
[방구석 도서관리] MFA 해제 알림
```

Body (HTML)

```html
<h2>MFA 인증 수단이 해제되었습니다</h2>
<p>{{ .Email }} 계정에서 {{ .FactorType }} MFA 수단이 해제되었습니다.</p>
<p>본인이 해제하지 않았다면 즉시 계정 보안을 점검해 주세요.</p>
```

## 3) 템플릿 변수 요약

- `{{ .ConfirmationURL }}`: 인증/재설정 링크
- `{{ .Token }}`: OTP 코드
- `{{ .TokenHash }}`: 토큰 해시
- `{{ .SiteURL }}`: 프로젝트 Site URL
- `{{ .RedirectTo }}`: API 호출 시 전달한 redirect URL
- `{{ .Email }}`: 현재 사용자 이메일
- `{{ .NewEmail }}`: 변경 대상 이메일
- `{{ .OldEmail }}`: 변경 전 이메일
- `{{ .Phone }}`: 현재 전화번호
- `{{ .OldPhone }}`: 변경 전 전화번호
- `{{ .Provider }}`: 소셜 로그인 제공자
- `{{ .FactorType }}`: MFA 수단 유형

## 4) 프로젝트 적용 메모

- 현재 코드에서 비밀번호 재설정 링크는 `src/features/auth/hooks/useForgotPassword.ts` 기준
  `{{ .RedirectTo }}`가 `/reset-password`로 들어오도록 호출합니다.
- 운영 적용 전 `Authentication > URL Configuration`에서
  Site URL/Redirect URL allow list를 먼저 맞춰야 링크가 정상 동작합니다.
