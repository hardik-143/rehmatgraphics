import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, type Persistor } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { authReducer } from "./authSlice";

const createNoopStorage = () => {
  return {
    getItem: async () => null,
    setItem: async (_key: string, value: string) => value,
    removeItem: async () => undefined,
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("session");

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/FLUSH",
            "persist/PAUSE",
            "persist/PURGE",
            "persist/REGISTER",
          ],
        },
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const makePersistor = (store: AppStore): Persistor =>
  persistStore(store);
