import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { verifyTotp } from '../../api/auth';
import { ApiError } from '../../api/client';

const DIGITS = 6;

interface TotpFormProps {
  preAuthToken: string;
  onSuccess: (token: string) => void;
  onBack: (error?: string) => void;
}

export function TotpForm({ preAuthToken, onSuccess, onBack }: TotpFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(''));
  const [digitKeys, setDigitKeys] = useState<number[]>(Array(DIGITS).fill(0));
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>(Array(DIGITS).fill(null));

  const code = digits.join('');

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function updateDigit(idx: number, val: string) {
    setDigits(prev => { const d = [...prev]; d[idx] = val; return d; });
    setDigitKeys(prev => { const k = [...prev]; k[idx] = k[idx] + 1; return k; });
  }

  function handleChange(idx: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    updateDigit(idx, digit);
    if (digit && idx < DIGITS - 1) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[idx]) {
        updateDigit(idx, '');
      } else if (idx > 0) {
        updateDigit(idx - 1, '');
        inputs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < DIGITS - 1) {
      inputs.current[idx + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGITS);
    if (!pasted) return;
    const newDigits = [...digits];
    const newKeys = [...digitKeys];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
      newKeys[i] = newKeys[i] + 1;
    }
    setDigits(newDigits);
    setDigitKeys(newKeys);
    const next = pasted.length < DIGITS ? pasted.length : DIGITS - 1;
    inputs.current[next]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || loading) return;
    setLoading(true);
    try {
      const res = await verifyTotp(preAuthToken, code);
      if (res.sessionToken) onSuccess(res.sessionToken);
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 401
        ? 'Invalid 2FA code — please try again'
        : 'Something went wrong';
      setShake(true);
      setTimeout(() => {
        setShake(false);
        onBack(msg);
      }, 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app.
      </p>

      <div className={`flex justify-center gap-2 ${shake ? 'animate-otp-shake' : ''}`}>
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className={[
              'relative h-14 w-11 overflow-hidden rounded-lg border-2 transition-colors duration-150',
              focused === idx
                ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]'
                : digit
                  ? 'border-muted-foreground/40'
                  : 'border-border',
            ].join(' ')}
          >
            {/* Odometer digit display */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
              {digit ? (
                <span
                  key={digitKeys[idx]}
                  className="animate-digit-in font-mono text-2xl font-bold text-foreground"
                >
                  {digit}
                </span>
              ) : focused === idx ? (
                <span className="h-5 w-0.5 animate-pulse rounded-full bg-primary" />
              ) : null}
            </div>

            {/* Transparent input on top */}
            <input
              ref={el => { inputs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              maxLength={2}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={() => setFocused(idx)}
              onBlur={() => setFocused(null)}
              className="absolute inset-0 h-full w-full cursor-default select-none bg-transparent text-transparent caret-transparent outline-none"
            />
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
        {loading ? 'Verifying…' : 'Verify'}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back
      </Button>
    </form>
  );
}
