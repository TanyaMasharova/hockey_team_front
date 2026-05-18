import type { AppProps } from 'next/app';
import { ErrorProvider } from '@/shared/context/ErrorContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorProvider>
      <Component {...pageProps} />
    </ErrorProvider>
  );
}
