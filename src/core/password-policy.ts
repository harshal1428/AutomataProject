export type PasswordPolicyResult = {
  ok: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  minLength: boolean;
};

export function checkStrongPassword(input: string): PasswordPolicyResult {
  const hasLower = /[a-z]/.test(input);
  const hasUpper = /[A-Z]/.test(input);
  const hasDigit = /\d/.test(input);
  const hasSpecial = /[$@#]/.test(input);  // Only accept $, @, # as special characters
  const minLength = input.length >= 8;

  return {
    ok: hasLower && hasUpper && hasDigit && hasSpecial && minLength,
    hasLower,
    hasUpper,
    hasDigit,
    hasSpecial,
    minLength,
  };
}
