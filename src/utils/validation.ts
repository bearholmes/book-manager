import { z } from 'zod';

/**
 * 도서 등록/수정 폼 스키마
 */
export const bookSchema = z.object({
  book_name: z.string().min(1, '도서명을 입력해주세요').max(500, '도서명은 500자 이내로 입력해주세요'),
  isbn13: z.string().optional().or(z.literal('')),
  author: z.string().optional().or(z.literal('')),
  publisher: z.string().optional().or(z.literal('')),
  publication_date: z.string().optional().or(z.literal('')),
  condition: z.enum(['신품', '중고']).optional().or(z.literal('')),
  purchase_price: z
    .number()
    .min(0, '가격은 0 이상이어야 합니다')
    .optional()
    .or(z.nan())
    .transform((val) => (Number.isNaN(val) ? null : val)),
  currency: z.string().default('KRW'),
  purchase_price_sec: z
    .number()
    .min(0, '가격은 0 이상이어야 합니다')
    .optional()
    .or(z.nan())
    .transform((val) => (Number.isNaN(val) ? null : val)),
  currency_sec: z.string().optional().or(z.literal('')),
  purchase_date: z.string().optional().or(z.literal('')),
  purchase_place: z.string().optional().or(z.literal('')),
  topic: z.string().optional().or(z.literal('')),
  image_url: z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  duplicated: z.boolean().default(false),
  comment: z.string().optional().or(z.literal('')),
});

export type BookFormData = z.infer<typeof bookSchema>;

/**
 * 로그인 폼 스키마
 */
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 회원가입 폼 스키마
 */
export const signupSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
      .max(100, '비밀번호는 100자 이내로 입력해주세요'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
