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
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            방구석 도서관리 📚
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            로그인하여 도서를 관리하세요
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="relative block w-full rounded-t-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="이메일"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className="relative block w-full rounded-b-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="비밀번호"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {isPending ? <Spinner size="sm" /> : '로그인'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">계정이 없으신가요?</span>{' '}
            <Link to={ROUTES.SIGNUP} className="font-medium text-primary-600 hover:text-primary-700">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
