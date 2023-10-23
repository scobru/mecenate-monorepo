import { useState } from 'react';

import AuthMethods from './AuthMethods';
import EmailSMSAuth from './EmailSMSAuth';
import WalletMethods from './WalletMethods';
import WebAuthn from './WebAuthn';
import StytchOTP from './StytchOTP';

interface SignUpProps {
  handleGoogleLogin: () => Promise<void>;
  handleDiscordLogin: () => Promise<void>;
  authWithEthWallet: any;
  authWithOTP: any;
  registerWithWebAuthn: any;
  authWithWebAuthn: any;
  authWithStytch: any;
  goToLogin: any;
  error?: Error;
}

type AuthView = 'default' | 'email' | 'phone' | 'wallet' | 'webauthn';

export default function SignUpMethods({
  handleGoogleLogin,
  handleDiscordLogin,
  authWithEthWallet,
  authWithOTP,
  registerWithWebAuthn,
  authWithWebAuthn,
  authWithStytch,
  goToLogin,
  error,
}: SignUpProps) {
  const [view, setView] = useState<AuthView>('default');

  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        {view === 'default' && (
          <>
            <h1>Get started</h1>
            <p>
              Create a wallet that is secured by accounts you already have. With
              Lit-powered programmable MPC wallets, you won&apos;t have to worry
              about seed phrases.
            </p>
            <AuthMethods
              handleGoogleLogin={handleGoogleLogin}
              handleDiscordLogin={handleDiscordLogin}
              setView={setView}
            />
            <div className="buttons-container">
              <button
                type="button"
                className="btn btn--link"
                onClick={goToLogin}
              >
                Have an account? Log in
              </button>
            </div>
          </>
        )}
        {view === 'email' && (
          <EmailSMSAuth
            method={'email'}
            setView={setView}
            authWithOTP={authWithOTP}
          />
        )}
        {/* {view === 'phone' && (
          <EmailSMSAuth
            method={'phone'}
            setView={setView}
            authWithOTP={authWithOTP}
          />
        )} */}
        {view === 'phone' && (
          <StytchOTP authWithStytch={authWithStytch} setView={setView} />
        )}
        {view === 'wallet' && (
          <WalletMethods
            authWithEthWallet={authWithEthWallet}
            setView={setView}
          />
        )}
        {view === 'webauthn' && (
          <WebAuthn
            start={'register'}
            authWithWebAuthn={authWithWebAuthn}
            setView={setView}
            registerWithWebAuthn={registerWithWebAuthn}
          />
        )}
      </div>
    </div>
  );
}
