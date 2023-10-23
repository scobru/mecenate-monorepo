import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuthenticate from "../hooks/lit/useAuthenticate";
import useSession from "../hooks/lit/useSession";
import useAccounts from "../hooks/lit/useAccounts";
import { ORIGIN, DOMAIN, signInWithDiscord, signInWithGoogle } from "../utils/lit/lit";
import Dashboard from "../components/lit/Dashboard";
import Loading from "../components/lit/Loading";
import LoginMethods from "../components/lit/LoginMethods";
import AccountSelection from "../components/lit/AccountSelection";
import CreateAccount from "../components/lit/CreateAccount";

export default function LoginView() {
  const redirectUri = `http://${DOMAIN}:3000` + "/login";

  const {
    authMethod,
    authWithEthWallet,
    authWithOTP,
    authWithWebAuthn,
    authWithStytch,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri);
  const {
    fetchAccounts,
    setCurrentAccount,
    currentAccount,
    accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const { initSession, sessionSigs, loading: sessionLoading, error: sessionError } = useSession();
  const router = useRouter();

  const error = authError || accountsError || sessionError;

  if (currentAccount) {
    console.log(currentAccount);
  }

  async function handleGoogleLogin() {
    await signInWithGoogle(redirectUri);
  }

  async function handleDiscordLogin() {
    await signInWithDiscord(redirectUri);
  }

  function goToSignUp() {
    router.push("/wallet");
  }

  useEffect(() => {
    // If user is authenticated, fetch accounts
    if (authMethod) {
      router.replace(window.location.pathname, undefined, { shallow: true });
      fetchAccounts(authMethod);
    }
  }, [authMethod, fetchAccounts]);

  useEffect(() => {
    // If user is authenticated and has selected an account, initialize session
    if (authMethod && currentAccount) {
      initSession(authMethod, currentAccount);
    }
  }, [authMethod, currentAccount, initSession]);

  if (authLoading) {
    return <Loading copy={"Authenticating your credentials..."} error={error} />;
  }

  if (accountsLoading) {
    return <Loading copy={"Looking up your accounts..."} error={error} />;
  }

  if (sessionLoading) {
    return <Loading copy={"Securing your session..."} error={error} />;
  }

  // If user is authenticated and has selected an account, initialize session
  if (currentAccount && sessionSigs) {
    return <Dashboard currentAccount={currentAccount} sessionSigs={sessionSigs} />;
  }

  // If user is authenticated and has more than 1 account, show account selection
  if (authMethod && accounts.length > 0) {
    return <AccountSelection accounts={accounts} setCurrentAccount={setCurrentAccount} error={error} />;
  }

  // If user is authenticated but has no accounts, prompt to create an account
  if (authMethod && accounts.length === 0) {
    return <CreateAccount signUp={goToSignUp} error={error} />;
  }

  // If user is not authenticated, show login methods
  return (
    <LoginMethods
      handleGoogleLogin={handleGoogleLogin}
      handleDiscordLogin={handleDiscordLogin}
      authWithEthWallet={authWithEthWallet}
      authWithOTP={authWithOTP}
      authWithWebAuthn={authWithWebAuthn}
      authWithStytch={authWithStytch}
      signUp={goToSignUp}
      error={error}
    />
  );
}
