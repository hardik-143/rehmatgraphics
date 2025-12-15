"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import type { PropsWithChildren } from "react";
import { makePersistor, makeStore, type AppStore } from "./index";

const StoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<ReturnType<typeof makePersistor> | null>(null);

  if (!storeRef.current) {
    const store = makeStore();
    storeRef.current = store;
    persistorRef.current = makePersistor(store);
  }

  return (
    <Provider store={storeRef.current!}>
      <PersistGate persistor={persistorRef.current!} loading={null}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default StoreProvider;
