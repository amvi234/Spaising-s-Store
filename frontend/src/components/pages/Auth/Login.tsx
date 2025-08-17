
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useLoginRequest, useVerifyOtpRequest } from '../../../shared/api/auth/auth-api';

const Login = () => {
  // States.
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpRequired, setOtpRequired] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  // Router.
  const navigate = useNavigate();

  // Hooks.
  const {
    mutate: sendLoginRequest,
    isPending: isLoadingLoginRequest,
    data: loginRequestResponse,
    isSuccess: isSuccessLoginRequest,
    isError: isErrorLoginRequest,
    error: loginErrorResponse,
  } = useLoginRequest();

  const {
    mutate: verifyLoginOtpRequest,
    isSuccess: isSuccessVerifyOtpRequest,
    isPending: isLoadingVerifyRequest,
    isError: isErrorVerifyOtp,
    error: errorVerifyOtp,
  } = useVerifyOtpRequest();

  // useEffects.
  useEffect(() => {
    if (isSuccessLoginRequest && loginRequestResponse) {
      setOtpRequired(true);
    }
    if (isErrorLoginRequest && loginErrorResponse) {
      toast.error(loginErrorResponse.meta?.message);
    }
  }, [isSuccessLoginRequest, isErrorLoginRequest])

  useEffect(() => {
    if (isSuccessVerifyOtpRequest) {
      navigate('/product');
      toast.success('Login Successful')
    }
    if (isErrorVerifyOtp && errorVerifyOtp) {
      toast.error(errorVerifyOtp.meta.message);
    }
  }, [isSuccessVerifyOtpRequest, isErrorVerifyOtp])

  //Handlers.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpRequired) {
      verifyLoginOtpRequest({
        username,
        otp
      });
    } else {
      sendLoginRequest({
        username,
        password
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Spaising's Store</h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={otpRequired}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={otpRequired}
                required
              />
            </div>

            {otpRequired && (  
                  <div>
                    <label className="block text-gray-700">OTP Code</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter the code from your app"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
            )}
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700 transition disabled:bg-blue-400 disabled:opacity-75 disabled:cursor-not-allowed"
              disabled={isLoadingLoginRequest || isLoadingVerifyRequest || (otpRequired && !otp.trim())}>
              {isLoadingVerifyRequest
                ? 'Processing...'
                : otpRequired
                  ? 'Verify OTP'
                  : 'Log In'}
            </button>
            <div className="text-center mt-4">
              <p className="text-gray-600">
                New User? Create an account{' '}
                <a href="/register" className="text-blue-600 hover:underline">
                  Register
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;