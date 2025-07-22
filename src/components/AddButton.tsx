import { Button } from './ui/Button';

interface AddButtonProps {
  onClick: () => void;
  text: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function AddButton({
  onClick,
  text,
  variant = 'ghost',
  className = '',
}: AddButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={`w-full justify-start text-left ${className}`}
    >
      <span className="mr-2">+</span>
      {text}
    </Button>
  );
}
