import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue } from 'jotai';
import { authLoadingAtom, userAtom } from '@/store/authAtom';
import { useUpdatePassword } from '@/features/auth/hooks/useUpdatePassword';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';

export function ResetPassword() {
  const navigate = useNavigate();
  const authLoading = useAtomValue(authLoadingAtom);
  const user = useAtomValue(userAtom);
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = ({ password }: ResetPasswordFormData) => {
    updatePassword(
      { password },
      {
        onSuccess: () => {
          navigate(ROUTES.HOME);
        },
      },
    );
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12 sm:px-6 lg:px-8">
        <div className="surface-card w-full max-w-md space-y-6 p-8 text-center">
          <h1 className="text-2xl font-semibold text-primary-900">재설정 링크를 확인해주세요</h1>
          <p className="text-sm text-primary-700">
            링크가 만료되었거나 올바르지 않습니다. 비밀번호 찾기를 다시 진행해주세요.
          </p>
          <div className="flex flex-col gap-2">
            <Link to={ROUTES.FORGOT_PASSWORD} className="btn-primary justify-center">
              비밀번호 찾기
            </Link>
            <Link to={ROUTES.LOGIN} className="btn-secondary justify-center">
              로그인으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md space-y-8 p-8">
        <div>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Reading Desk
          </p>
          <h1 className="mt-2 text-center text-3xl font-semibold text-primary-900">
            새 비밀번호 설정
          </h1>
          <p className="mt-2 text-center text-sm text-primary-700">
            보안을 위해 새 비밀번호를 입력해주세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-primary-700"
              >
                새 비밀번호
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
                새 비밀번호 확인
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

          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? <Spinner size="sm" /> : '비밀번호 변경'}
          </button>

          <p className="text-center text-xs text-primary-500">변경 즉시 현재 세션에 반영됩니다.</p>
        </form>
      </div>
    </div>
  );
}
