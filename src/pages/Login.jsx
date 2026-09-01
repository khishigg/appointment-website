import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck2,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuthStore } from '../store/AuthStore';
import logo from '../assets/ashid_soft_logo.png';
import loginIllustration from '../assets/login-appointment-illustration.webp';

const loginBenefits = [
  {
    icon: <MapPin size={19} />,
    title: 'Эмнэлгээ хялбар олох',
    description: 'Танд тохирох эмнэлэг, үйлчилгээний мэдээллийг нэг дороос харна.',
  },
  {
    icon: <CalendarCheck2 size={19} />,
    title: 'Боломжтой цагаас сонгох',
    description: 'Эмчийн сул цагийг шалгаж, өөрт тохирох цагаа захиална.',
  },
  {
    icon: <ShieldCheck size={19} />,
    title: 'Захиалгаа найдвартай удирдах',
    description: 'Нэвтэрсний дараа өөрийн захиалгын мэдээлэлд аюулгүй хандана.',
  },
];

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

    const result = await login(username.trim(), password, rememberMe);
    if (result.success) {
      const requestedLocation = location.state?.from;
      const destination = requestedLocation?.pathname
        ? `${requestedLocation.pathname}${requestedLocation.search || ''}${requestedLocation.hash || ''}`
        : '/';

      navigate(destination, { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <aside className="login-context" aria-label="Ashid Med цаг захиалгын систем">
          <button type="button" onClick={() => navigate('/')} className="login-back">
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Нүүр хуудас</span>
          </button>

          <div className="login-context__content">
            <img src={logo} alt="Ashid Med" className="login-context__logo" />
            <p className="login-context__eyebrow">Онлайн цаг захиалга</p>
            <p className="login-context__title">Эрүүл мэндийн үйлчилгээг илүү ойр, илүү энгийн.</p>
            <p className="login-context__copy">
              Эмнэлэг, эмч, боломжтой цагаа нэг дороос сонгож захиалгаа удирдана.
            </p>

            <div className="login-benefits">
              {loginBenefits.map(({ icon, title, description }) => (
                <div key={title} className="login-benefit">
                  <span className="login-benefit__icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="login-benefit__copy">
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="login-context__footer">Таны цаг. Таны сонголт.</p>
        </aside>

        <section className="login-form-side" aria-labelledby="login-title">
          <header className="login-mobile-header">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="login-mobile-back"
              aria-label="Нүүр хуудас руу буцах"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <img src={logo} alt="Ashid Med" className="login-mobile-logo" />
            <span className="login-mobile-header__spacer" aria-hidden="true" />
          </header>

          <div className="login-form-wrap">
            <div className="login-panel">
              <div className="login-mobile-illustration" aria-hidden="true">
                <img src={loginIllustration} alt="" />
              </div>

              <div className="login-panel__badge">
                <ShieldCheck size={16} aria-hidden="true" />
                Хамгаалагдсан нэвтрэлт
              </div>

              <div className="login-panel__header">
                <h1 id="login-title">Тавтай морил</h1>
                <p>Өөрийн бүртгэлээр нэвтэрч захиалгаа үргэлжлүүлнэ үү.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="username">Нэвтрэх нэр</label>
                  <div className="login-input-shell">
                    <UserRound size={19} className="login-input-icon" aria-hidden="true" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Нэвтрэх нэрээ оруулна уу"
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="password">Нууц үг</label>
                  <div className="login-input-shell">
                    <LockKeyhole size={19} className="login-input-icon" aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Нууц үгээ оруулна уу"
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="login-password-toggle"
                      aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Энэ төхөөрөмж дээр сануулах</span>
                </label>

                <div className="login-feedback" aria-live="polite">
                  {error && (
                    <div id="login-error" className="login-error" role="alert">
                      {error}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="login-submit">
                  {isLoading ? (
                    <>
                      <span className="login-spinner" aria-hidden="true" />
                      <span>Нэвтэрч байна...</span>
                    </>
                  ) : (
                    <span>Нэвтрэх</span>
                  )}
                </button>

                <Link to="/" className="login-guest-link">
                  Зочин хэрэглэгчээр нэвтрэх
                </Link>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
