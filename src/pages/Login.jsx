import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { isAdminRole, useAuthStore } from '../store/AuthStore';
import logo from '../assets/ashid_soft_logo.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username.trim(), password);
    if (result.success) {
      const requestedPath = location.state?.from?.pathname;
      const isAdmin = isAdminRole(result.role);
      const destination = isAdmin ? '/' : requestedPath || '/booking';

      navigate(destination, { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-form-side">
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
            className="login-form-wrap"
          >
            <button type="button" onClick={() => navigate('/')} className="login-back login-back--mobile">
              <ArrowLeft size={17} aria-hidden="true" />
              Нүүр рүү буцах
            </button>

            <div className="login-brand login-brand--mobile">
              <img src={logo} alt="Ashid Med" className="login-brand__logo" />
              <div>
                <p className="login-brand__name">Ashid Med</p>
                <p className="login-brand__meta">Appointment system</p>
              </div>
            </div>

            <div className="login-panel">
              <div className="login-panel__header">
                <div className="login-panel__icon">
                  <ShieldCheck size={25} aria-hidden="true" />
                </div>
                <h2>Нэвтрэх</h2>
                <p>Цаг захиалгын самбар руу нэвтрэх</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="username">Нэвтрэх нэр</label>
                  <div className="login-input-shell">
                    <UserRound size={20} className="login-input-icon" aria-hidden="true" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Нэвтрэх нэрээ оруулна уу"
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="password">Нууц үг</label>
                  <div className="login-input-shell">
                    <Lock size={20} className="login-input-icon" aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Нууц үгээ оруулна уу"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="login-password-toggle"
                      aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-form__options">
                  <label className="login-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <span>Намайг санах</span>
                  </label>
                  <button type="button" className="login-link-button">
                    Нууц үгээ мартсан?
                  </button>
                </div>

                {error && (
                  <Motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-error"
                    role="alert"
                  >
                    {error}
                  </Motion.div>
                )}

                <button type="submit" disabled={isLoading} className="login-submit">
                  {isLoading ? (
                    <span className="login-spinner" aria-label="Уншиж байна" />
                  ) : (
                    <>
                      <LogIn size={20} aria-hidden="true" />
                      Нэвтрэх
                    </>
                  )}
                </button>
              </form>
            </div>
          </Motion.div>
        </section>
      </div>
    </main>
  );
}
