/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './lib/context';
import { Layout } from './Layout';

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

