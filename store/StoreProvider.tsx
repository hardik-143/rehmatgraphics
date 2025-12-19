"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import type { PropsWithChildren } from "react";
import { makePersistor, makeStore } from "./index";

export default function StoreProvider({ children }: PropsWithChildren) {
  const [[store, persistor]] = useState(() => {
    const store = makeStore();
    const persistor = makePersistor(store);
    return [store, persistor] as const;
  });

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        {children}
      </PersistGate>
    </Provider>
  );
}
