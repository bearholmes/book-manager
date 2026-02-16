import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { passwordResetRequestSchema, type PasswordResetRequestFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Spinner';

/**
 * ForgotPassword 컴포넌트를 렌더링합니다.
 */
export function ForgotPassword() {
  const { mutate: sendResetEmail, isPending } = useForgotPassword();
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = (data: PasswordResetRequestFormData) => {
    sendResetEmail(data, {
      onSuccess: () => {
        setRequestedEmail(data.email);
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface-card w-full max-w-md space-y-8 p-8">
        <div>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Reading Desk
          </p>
          <h1 className="mt-2 text-center text-3xl font-semibold text-primary-900">
            비밀번호 찾기
          </h1>
          <p className="mt-2 text-center text-sm text-primary-700">
            가입한 이메일로 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-primary-700">
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

          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? <Spinner size="sm" /> : '재설정 메일 보내기'}
          </button>

          {requestedEmail && (
            <div className="surface-muted rounded-xl p-3 text-sm text-primary-700">
              <p className="font-semibold text-primary-800">메일 발송 완료</p>
              <p className="mt-1">
                <span className="font-medium">{requestedEmail}</span> 주소로 재설정 링크를
                보냈습니다.
              </p>
            </div>
          )}

          <div className="text-center text-sm">
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-primary-800 hover:text-primary-900"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
