import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import logo from '../assets/ashid_soft_logo.png';

export default function RegisterPage() {
  const navigate = useNavigate();

  // 6 Form Fields
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericVal = value.replace(/\D/g, '').slice(0, 8);
      setFormData((prev) => ({ ...prev, [name]: numericVal }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.lastName.trim()) {
      setError('Овог нэрээ оруулна уу.');
      return;
    }
    if (!formData.firstName.trim()) {
      setError('Нэрээ оруулна уу.');
      return;
    }
    if (!/^[0-9]{8}$/.test(formData.phone)) {
      setError('Утасны дугаар 8 оронтой тоо байх ёстой.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Зөв имэйл хаяг оруулна уу.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Баталгаажуулах нууц үг зөрүүтэй байна.');
      return;
    }

    setIsLoading(false);
    setError('Бүртгэлийн backend үйлчилгээ одоогоор холбогдоогүй байна. Та Guest хэлбэрээр цаг захиалж болно.');
  };

  return (
    <main className="min-h-screen bg-surface py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Top Brand & Back Button */}
          <div className="flex items-center justify-between border-b border-line-soft pb-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              <ArrowLeft size={17} />
              Буцах
            </button>

          </div>

          {/* Form Header (Clean Image 2 Style) */}
          <div>
            <h1 className="text-2xl font-bold text-heading">Хэрэглэгчийн бүртгэл</h1>

          </div>

          {/* Clean Inputs Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Овог */}
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Овог <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Овог"
                className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            {/* Нэр */}
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Нэр <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Нэр"
                className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            {/* Утасны дугаар */}
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Утасны дугаар <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="8 оронтой дугаар"
                className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            {/* Имэйл */}
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Имэйл / Gmail <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            {/* Нууц үг */}
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Нууц үг <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Хамгийн багадаа 6 тэмдэгт"
                  className="w-full pl-4 pr-11 py-3 border border-line rounded-control focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors p-1"
                  aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Нууц үг баталгаажуулах */}
            <div>
              <label className="block text-sm font-medium text-heading mb-1.5">
                Нууц үг баталгаажуулах <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Нууц үгээ дахин оруулна уу"
                  className="w-full pl-4 pr-11 py-3 border border-line rounded-control focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <Motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-control bg-danger-surface border border-red-200 text-danger-text text-sm font-medium"
                role="alert"
              >
                {error}
              </Motion.div>
            )}

            {/* Success Banner */}
            {success && (
              <Motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-control bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                <span>{success}</span>
              </Motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-control font-semibold shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Бүртгүүлэх'
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="pt-2 text-center text-sm text-muted">
            Аль хэдийн бүртгэлтэй юу?{' '}
            <Link to="/login" className="font-semibold text-orange-600 hover:underline">
              Нэвтрэх
            </Link>
          </div>
        </Motion.div>
      </div>
    </main>
  );
}
