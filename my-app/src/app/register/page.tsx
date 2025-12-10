'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (): boolean => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!form.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!form.password) {
      toast.error('Password is required');
      return false;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to details page with user ID
      router.push(`/register/${data.userId}/details`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E7893] via-[#1a9bb8] to-[#E67919] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
              <p className="text-gray-600 mt-2">Sign up to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      Continue <FaArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) {
      setLoading(false);
      setError(v);
      return;
    }
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNo: `+${form.phoneNo.replace(/\D/g, "")}`,
        password: form.password,
        adress: form.adress.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip_code: form.zip_code.trim(),
        country: form.country.trim(),
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || data?.message || "Registration failed");
      setSuccess("Registration successful. You can now login.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E7893] via-[#1a9bb8] to-[#E67919] flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed left-1/2 top-6 z-[80] -translate-x-1/2 animate-slideDown">
          <div className={`rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-2xl flex items-center gap-2 border ${
            showToast.type === "error"
              ? "bg-red-500 border-red-400"
              : "bg-green-500 border-green-400"
          }`}>
            {showToast.type === "error" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <FaCheckCircle className="w-5 h-5" />
            )}
            {showToast.msg}
          </div>
        </div>
      )}

      <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 py-8 w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-0 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 backdrop-blur-sm md:grid-cols-7 transform hover:shadow-3xl transition-shadow duration-300">
          
          {/* Left: illustrative section with logo */}
          <div className="hidden md:flex relative bg-gradient-to-br from-[#1a9bb8] to-[#0E7893] h-full flex-col justify-between p-10 md:col-span-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <FaPlane className="text-[#E67919] text-2xl" />
              </div>
              <div>
                <h2 className="text-white font-bold text-2xl">Clean J Shipping</h2>
                <p className="text-cyan-100 text-xs">Logistics & Delivery</p>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative h-64 my-8">
              <Image 
                src="/images/Logo.png" 
                alt="Authentication" 
                fill 
                priority 
                className="object-contain drop-shadow-2xl"
              />
            </div>

            {/* Bottom text */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-xl">Join our platform today</h3>
              <p className="text-cyan-100 text-sm leading-relaxed">
                Create your account to access powerful logistics tools, track shipments in real-time, and manage all your deliveries efficiently.
              </p>
            
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white px-8 py-8 md:px-10 md:py-10 md:col-span-4">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-3 justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0E7893] to-[#1a9bb8] rounded-xl flex items-center justify-center shadow-lg">
                <FaPlane className="text-white text-xl" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#E67919]">Clean J Shipping</h2>
              </div>
            </div>

            <div className="mx-auto w-full">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0E7893] bg-gradient-to-r from-[#0E7893] to-[#1a9bb8] bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-gray-600">Fill in your details to get started with us.</p>
              
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="Enter full name"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        type="email"
                        placeholder="Enter email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number (International) */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <PhoneInput
                        country={phoneMeta.countryCode}
                        value={form.phoneNo}
                        onChange={(value: string, data: { dialCode?: string; countryCode?: string }) => {
                          const digits = (value || "").replace(/\D/g, "");
                          setForm({ ...form, phoneNo: digits });
                          if (data?.dialCode || data?.countryCode) {
                            setPhoneMeta({ dialCode: data.dialCode || phoneMeta.dialCode, countryCode: (data.countryCode || phoneMeta.countryCode).toLowerCase() });
                          }
                        }}
                        enableSearch
                        countryCodeEditable={false}
                        inputProps={{ name: "phone", required: true }}
                        containerClass="w-full"
                        buttonClass="!border-2 !border-gray-200 !bg-gray-50 !rounded-l-lg"
                        inputClass="!w-full !h-[42px] !rounded-r-lg !border-2 !border-gray-200 !bg-gray-50 !text-sm !pr-3 focus:!ring-2 focus:!ring-[#E67919] focus:!border-transparent"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="Street address"
                        value={form.adress}
                        onChange={(e) => setForm({ ...form, adress: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCity className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="Enter city"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">State / Province</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFlag className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="Enter state"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Zip Code */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Zip / Postal Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMailBulk className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="Postal code"
                        value={form.zip_code}
                        onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                    <div className="relative">
                      <ReactSelect
                        classNamePrefix="country"
                        options={countryOptions}
                        placeholder="Select country..."
                        isSearchable
                        value={countryOptions.find((o) => o.value === form.country) || null}
                        onChange={(opt) => setForm({ ...form, country: (opt?.value) || "" })}
                        components={{
                          Control: (props: ControlProps<{ value: string; label: string }>) => (
                            <components.Control {...props}>
                              {props.children}
                            </components.Control>
                          ),
                          Option: (props: OptionProps<{ value: string; label: string }>) => (
                            <components.Option {...props}>
                              <div className="flex items-center gap-2">
                                <CountryFlag svg countryCode={props.data.value} style={{ width: 18, height: 12 }} />
                                <span>{props.data.label}</span>
                              </div>
                            </components.Option>
                          ),
                          SingleValue: (props: SingleValueProps<{ value: string; label: string }>) => (
                            <components.SingleValue {...props}>
                              <div className="flex items-center gap-2">
                                <CountryFlag svg countryCode={props.data.value} style={{ width: 18, height: 12 }} />
                                <span>{props.data.label}</span>
                              </div>
                            </components.SingleValue>
                          ),
                        }}
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                        menuPosition="fixed"
                        maxMenuHeight={220}
                        styles={{
                          control: (base: any, state: any) => ({
                            ...base,
                            borderWidth: 2,
                            borderColor: state.isFocused ? "#f58a2e" : "#e5e7eb",
                            boxShadow: state.isFocused ? "0 0 0 2px rgba(230,121,25,0.35)" : "none",
                            backgroundColor: "#F9FAFB",
                            minHeight: 42,
                          }),
                          valueContainer: (base: any) => ({ ...base, paddingLeft: 2 }),
                          menu: (base: any) => ({ ...base, zIndex: 50 }),
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#E67919] transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400 text-sm group-focus-within:text-[#E67919] transition-colors" />
                      </div>
                      <input
                        className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 pl-9 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67919] focus:border-transparent focus:bg-white transition-all duration-200"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#E67919] transition-colors"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="mt-4">
                  <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#E67919] focus:ring-[#E67919] cursor-pointer"
                    />
                    <span className="group-hover:text-[#0E7893] transition-colors">
                      I agree to the <a href="#" className="text-[#0E7893] font-semibold hover:underline">Terms & Conditions</a> and <a href="#" className="text-[#0E7893] font-semibold hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {/* Error/Success messages */}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
                    <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#E67919] to-[#f58a2e] py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      CREATE ACCOUNT
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Login link */}
              <div className="mt-5 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    href="/login" 
                    className="text-[#0E7893] hover:text-[#E67919] font-semibold transition-colors hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>

              {/* Divider */}
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-500">Secure Registration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}