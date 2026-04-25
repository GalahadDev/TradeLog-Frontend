import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AccountListItem } from '@/types';
import { accountService } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

interface AccountContextValue {
  accounts: AccountListItem[];
  selectedAccount: AccountListItem | null;
  setSelectedAccount: (account: AccountListItem | null) => void;
  isLoading: boolean;
  refetchAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

const STORAGE_KEY = 'tradelog_selected_account_id';

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [selectedAccount, setSelectedAccountState] = useState<AccountListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await accountService.getAll();
      const list = response.data.accounts ?? [];
      setAccounts(list);

      const storedId = localStorage.getItem(STORAGE_KEY);
      const stored = list.find(a => a.id === storedId);
      if (stored) {
        setSelectedAccountState(stored);
      } else if (list.length > 0) {
        setSelectedAccountState(list[0]);
        localStorage.setItem(STORAGE_KEY, list[0].id);
      } else {
        setSelectedAccountState(null);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session) fetchAccounts();
      }
      if (event === 'SIGNED_OUT') {
        setAccounts([]);
        setSelectedAccountState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAccounts]);

  const setSelectedAccount = useCallback((account: AccountListItem | null) => {
    setSelectedAccountState(account);
    if (account) {
      localStorage.setItem(STORAGE_KEY, account.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AccountContext.Provider value={{
      accounts,
      selectedAccount,
      setSelectedAccount,
      isLoading,
      refetchAccounts: fetchAccounts,
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount debe usarse dentro de AccountProvider');
  return ctx;
}
