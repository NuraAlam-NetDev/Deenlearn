// Same rules as the server (server/src/validators/auth.js), so users get instant feedback.
// The server still re-checks everything.
const EMAIL = /^\S+@\S+\.\S+$/;

function checkEmail(email) {
  const value = email.trim();
  if (!value) return 'Email is required';
  if (!EMAIL.test(value)) return 'Enter a valid email address';
  return '';
}

// Shared by register and change-password. Returns '' when the password is fine.
function checkPassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain a letter (A-Z)';
  if (!/\d/.test(password)) return 'Password must contain a number';
  return '';
}

export function validateProfile({ name }) {
  const errors = {};
  const cleanName = name.trim();
  if (!cleanName) errors.name = 'Name is required';
  else if (cleanName.length < 2) errors.name = 'Name must be at least 2 characters';
  else if (cleanName.length > 100) errors.name = 'Name must be at most 100 characters';
  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Enter your current password';

  const newError = checkPassword(newPassword);
  if (newError) errors.newPassword = newError.replace('Password', 'New password');
  else if (newPassword === currentPassword) {
    errors.newPassword = 'New password must be different from the current one';
  }

  if (!confirmPassword) errors.confirmPassword = 'Repeat the new password';
  else if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
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

  const passwordError = checkPassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}
