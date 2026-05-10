import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ACCOUNTS: "@memento/accounts",
  SESSION: "@memento/session",
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export interface Account {
  email: string;
  passwordHash: string;
}

export interface Session {
  email: string;
  loggedInAt: string;
}

async function getAccounts(): Promise<Account[]> {
  const raw = await AsyncStorage.getItem(KEYS.ACCOUNTS);
  return raw ? (JSON.parse(raw) as Account[]) : [];
}

async function saveAccounts(accounts: Account[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export async function getCurrentSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(KEYS.SESSION);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export async function authSignUp(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  const accounts = await getAccounts();
  const existing = accounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }
  accounts.push({
    email: email.toLowerCase().trim(),
    passwordHash: simpleHash(email.toLowerCase().trim() + password),
  });
  await saveAccounts(accounts);
  await AsyncStorage.setItem(
    KEYS.SESSION,
    JSON.stringify({
      email: email.toLowerCase().trim(),
      loggedInAt: new Date().toISOString(),
    })
  );
  return { success: true };
}

export async function authSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const accounts = await getAccounts();
  const account = accounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (!account) {
    return { success: false, error: "No account found with this email." };
  }
  const hash = simpleHash(email.toLowerCase().trim() + password);
  if (account.passwordHash !== hash) {
    return { success: false, error: "Incorrect password." };
  }
  await AsyncStorage.setItem(
    KEYS.SESSION,
    JSON.stringify({
      email: email.toLowerCase().trim(),
      loggedInAt: new Date().toISOString(),
    })
  );
  return { success: true };
}

export async function authSignOut(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SESSION);
}
