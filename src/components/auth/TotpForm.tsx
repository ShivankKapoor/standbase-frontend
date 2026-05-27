import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { verifyTotp } from '../../api/auth';
import { ApiError } from '../../api/client';

interface TotpFormProps {
  preAuthToken: string;
  onSuccess: (token: string) => void;
  onBack: () => void;
}

export function TotpForm({ preAuthToken, onSuccess, onBack }: TotpFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyTotp(preAuthToken, code);
      if (res.sessionToken) onSuccess(res.sessionToken);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Invalid code' : 'Something went wrong');
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      <div className="space-y-1.5">
        <Label htmlFor="totp">Authenticator code</Label>
        <Input
          id="totp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
        {loading ? 'Verifying…' : 'Verify'}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back
      </Button>
    </form>
  );
}
