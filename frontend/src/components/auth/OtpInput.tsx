import { useRef, type ChangeEvent, type KeyboardEvent, type SyntheticEvent } from "react";
import { EMAIL_OTP_LENGTH, replaceOtpDigit, sanitizeOtp } from "../../utils/otp";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = sanitizeOtp(value).split("");

  const focusAt = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(index, EMAIL_OTP_LENGTH - 1))]?.focus();
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const input = sanitizeOtp(event.target.value);

    if (input.length > 1) {
      onChange(input);
      focusAt(Math.min(input.length, EMAIL_OTP_LENGTH) - 1);
      return;
    }

    onChange(replaceOtpDigit(value, index, input));
    if (input) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      onChange(replaceOtpDigit(value, index - 1, ""));
      focusAt(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: SyntheticEvent<HTMLInputElement, globalThis.ClipboardEvent>) => {
    const clipboardData = event.nativeEvent.clipboardData;
    if (!clipboardData) return;
    const pasted = sanitizeOtp(clipboardData.getData("text"));
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focusAt(Math.min(pasted.length, EMAIL_OTP_LENGTH) - 1);
  };

  return (
    <div className="otp-input" role="group" aria-label="Mã xác thực gồm 6 chữ số">
      {Array.from({ length: EMAIL_OTP_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          aria-label={`Chữ số ${index + 1}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={index === 0}
          disabled={disabled}
          inputMode="numeric"
          maxLength={index === 0 ? EMAIL_OTP_LENGTH : 1}
          pattern="[0-9]*"
          type="text"
          value={digits[index] ?? ""}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
