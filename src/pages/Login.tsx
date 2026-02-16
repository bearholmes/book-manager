import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from '@/store/authAtom';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Login 컴포넌트를 렌더링합니다.
 */
export function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md space-y-8 p-8">
        <div>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Reading Desk
          </p>
          <h1 className="mt-2 text-center text-3xl font-semibold text-primary-900">
            방구석 도서관리
          </h1>
          <p className="mt-2 text-center text-sm text-primary-700">로그인하여 도서를 관리하세요</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                이메일
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="field-base"
                placeholder="이메일"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                비밀번호
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className="field-base"
                placeholder="비밀번호"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
              <div className="mt-2 text-right">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-900"
                >
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? <Spinner size="sm" /> : '로그인'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-primary-700">계정이 없으신가요?</span>{' '}
            <Link
              to={ROUTES.SIGNUP}
              className="font-semibold text-primary-800 hover:text-primary-900"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
