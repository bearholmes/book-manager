import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup } from '@/features/auth/hooks/useSignup';
import { signupSchema, type SignupFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';

export function Signup() {
  const navigate = useNavigate();
  const { mutate: signup, isPending } = useSignup();
  const redirectTimerRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    signup(data, {
      onSuccess: () => {
        redirectTimerRef.current = window.setTimeout(() => navigate(ROUTES.LOGIN), 2000);
      },
    });
  };

  useEffect(
    () => () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md space-y-8 p-8">
        <div>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Reading Desk
          </p>
          <h1 className="mt-2 text-center text-3xl font-semibold text-primary-900">회원가입</h1>
          <p className="mt-2 text-center text-sm text-primary-700">
            새로운 계정을 만들어 시작하세요
          </p>
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
                placeholder="email@example.com"
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
                autoComplete="new-password"
                className="field-base"
                placeholder="6자 이상"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                비밀번호 확인
              </label>
              <input
                {...register('passwordConfirm')}
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                className="field-base"
                placeholder="비밀번호 재입력"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? <Spinner size="sm" /> : '회원가입'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-primary-700">이미 계정이 있으신가요?</span>{' '}
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-primary-800 hover:text-primary-900"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
