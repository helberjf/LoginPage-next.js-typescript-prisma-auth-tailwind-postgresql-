export function validateCpf(cpf: string): boolean {
  if (!cpf) return false;

  // Remove tudo que não for número
  const cleanCpf = cpf.replace(/\D/g, '');

  // Deve ter 11 dígitos
  if (cleanCpf.length !== 11) return false;

  // Bloqueia CPFs inválidos conhecidos (todos iguais)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  const digits = cleanCpf.split('').map(Number);

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }

  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10) firstCheck = 0;
  if (firstCheck !== digits[9]) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }

  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10) secondCheck = 0;
  if (secondCheck !== digits[10]) return false;

  return true;
}
