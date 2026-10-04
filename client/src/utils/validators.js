// Same rules as the server (server/src/validators/auth.js), so users get instant feedback.
// The server still re-checks everything.
const EMAIL = /^\S+@\S+\.\S+$/;

function checkEmail(email) {
  const value = email.trim();
  if (!value) return 'Email is required';
  if (!EMAIL.test(value)) return 'Enter a valid email address';
  return '';
}

export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validateRegister({ name, email, password }) {
  const errors = {};

  const cleanName = name.trim();
  if (!cleanName) errors.name = 'Name is required';
  else if (cleanName.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (cleanName.length > 100) errors.name = 'Name must be at most 100 characters';

  const emailError = checkEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (password.length > 72) errors.password = 'Password must be at most 72 characters';
  else if (!/[A-Za-z]/.test(password)) errors.password = 'Password must contain a letter (A-Z)';
  else if (!/\d/.test(password)) errors.password = 'Password must contain a number';

  return errors;
}
