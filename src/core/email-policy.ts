export type EmailPolicyResult = {
  ok: boolean;
  hasLocalPart: boolean;
  hasSingleAt: boolean;
  hasDomainPart: boolean;
  hasDot: boolean;
  extLenValid: boolean;
};

// Matches the C-style rule: local@[a-z]+.[a-z]{2,3}
export function checkEmailPolicy(input: string): EmailPolicyResult {
  const atMatches = input.match(/@/g) ?? [];
  const hasSingleAt = atMatches.length === 1;

  const atIndex = input.indexOf('@');
  const local = atIndex >= 0 ? input.slice(0, atIndex) : input;
  const afterAt = atIndex >= 0 ? input.slice(atIndex + 1) : '';

  const dotIndex = afterAt.indexOf('.');
  const domain = dotIndex >= 0 ? afterAt.slice(0, dotIndex) : afterAt;
  const ext = dotIndex >= 0 ? afterAt.slice(dotIndex + 1) : '';

  const hasLocalPart = /^[A-Za-z0-9._]+$/.test(local) && local.length > 0;
  const hasDomainPart = /^[a-z]+$/.test(domain) && domain.length > 0;
  const hasDot = dotIndex >= 0;
  const extLenValid = /^[a-z]{2,3}$/.test(ext);

  return {
    ok: hasSingleAt && hasLocalPart && hasDomainPart && hasDot && extLenValid,
    hasLocalPart,
    hasSingleAt,
    hasDomainPart,
    hasDot,
    extLenValid,
  };
}
