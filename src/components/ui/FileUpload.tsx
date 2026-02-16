import { useRef } from 'react';
import { Upload } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 파일 업로드 컴포넌트
 */
export function FileUpload({
  accept = '.json',
  onFileSelect,
  disabled = false,
  className,
  children,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={clsx('btn-secondary', className)}
      >
        {children || (
          <>
            <Upload className="mr-2 h-4 w-4" />
            파일 선택
          </>
        )}
      </button>
    </>
  );
}
