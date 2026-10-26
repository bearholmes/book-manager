import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
export function PasswordField({
  id,
  label,
  value,
  onChange,
}: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field htmlFor={id} label={label}>
      <Input
        id={id}
        type="password"
        minLength={12}
        maxLength={256}
        required
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
