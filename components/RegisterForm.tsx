"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
} from "lucide-react";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  firmName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
};

type RegisterFormState = typeof initialState;

type StatusState = {
  type: "idle" | "loading" | "success" | "error";
  message: string | null;
};

type CountryOption = {
  name: string;
  emoji: string | null;
};

type StateOption = {
  name: string;
  cityCount: number;
};

const RegisterForm = () => {
  const [formValues, setFormValues] = useState<RegisterFormState>(initialState);
  const [visitingCardFile, setVisitingCardFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: null,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [isCountriesLoading, setIsCountriesLoading] = useState(true);
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Space") {
      event.preventDefault();
      triggerFileDialog();
    }
  };

  const handleChange =
    (field: keyof RegisterFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setVisitingCardFile(file ?? null);
  };

  const fetchCountries = async () => {
    setIsCountriesLoading(true);
    setLocationError(null);

    try {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }

      const data = (await response.json()) as {
        type: string;
        countries?: CountryOption[];
      };

      if (data.type !== "countries" || !data.countries) {
        throw new Error("Unexpected response shape");
      }

      setCountryOptions(data.countries);
    } catch (error) {
      console.error("fetchCountries error:", error);
      setLocationError(
        "We couldn't load countries. Please try again shortly."
      );
    } finally {
      setIsCountriesLoading(false);
    }
  };

  useEffect(() => {
    void fetchCountries();
  }, []);

  const fetchStates = async (countryName: string) => {
    if (!countryName) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }

    setIsStatesLoading(true);
    setLocationError(null);

    try {
      const response = await fetch(
        `/api/locations?country=${encodeURIComponent(countryName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }

      const data = (await response.json()) as {
        type: string;
        states?: StateOption[];
      };

      if (data.type !== "states" || !data.states) {
        throw new Error("Unexpected state response");
      }

      setStateOptions(data.states);
    } catch (error) {
      console.error("fetchStates error:", error);
      setLocationError(
        "We couldn't load states for the selected country."
      );
      setStateOptions([]);
    } finally {
      setIsStatesLoading(false);
    }
  };

  const fetchCities = async (countryName: string, stateName: string) => {
    if (!countryName || !stateName) {
      setCityOptions([]);
      return;
    }

    setIsCitiesLoading(true);
    setLocationError(null);

    try {
      const response = await fetch(
        `/api/locations?country=${encodeURIComponent(
          countryName
        )}&state=${encodeURIComponent(stateName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }

      const data = (await response.json()) as {
        type: string;
        state?: { cities: string[] };
      };

      if (data.type !== "cities" || !data.state?.cities) {
        throw new Error("Unexpected city response");
      }

      setCityOptions(data.state.cities);
    } catch (error) {
      console.error("fetchCities error:", error);
      setLocationError("We couldn't load cities for the selected state.");
      setCityOptions([]);
    } finally {
      setIsCitiesLoading(false);
    }
  };

  const handleCountrySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    setFormValues((prev) => ({
      ...prev,
      country: value,
      state: "",
      city: "",
    }));
    setStateOptions([]);
    setCityOptions([]);
    if (value) {
      void fetchStates(value);
    }
  };

  const handleStateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    setFormValues((prev) => ({
      ...prev,
      state: value,
      city: "",
    }));
    setCityOptions([]);
    if (value) {
      void fetchCities(formValues.country, value);
    }
  };

  const handleCitySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      city: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!visitingCardFile) {
      setStatus({
        type: "error",
        message: "Please upload your visiting card image before submitting.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Creating your account…" });

    try {
      const formData = new FormData();

      (Object.entries(formValues) as [keyof RegisterFormState, string][]).forEach(
        ([key, value]) => {
          formData.append(key, value);
        }
      );

      formData.append("visitingCard", visitingCardFile);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === "string" ? data.error : "Registration failed.";
        setStatus({ type: "error", message });
        return;
      }

      setStatus({
        type: "success",
        message:
          typeof data?.message === "string"
            ? data.message
            : "Registration received. We'll email you once an administrator approves your account.",
      });
      setFormValues(initialState);
      setVisitingCardFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Registration error:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const isLoading = status.type === "loading";

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          New Agents
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">
          Create your trade account
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Complete the form to access live pricing, file uploads, and nationwide
          delivery support.
        </p>
      </div>

      <form className="relative space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              First Name
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <User className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange("firstName")}
                placeholder="Rehmat"
                required
                minLength={2}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Last Name
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <User className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange("lastName")}
                placeholder="Graphics"
                required
                minLength={2}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>
        </div>

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Phone Number
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
            <Phone className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="tel"
              name="phoneNumber"
              value={formValues.phoneNumber}
              onChange={handleChange("phoneNumber")}
              placeholder="+91 98765 43210"
              required
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Work Email
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange("email")}
                placeholder="hello@rehmatgraphics.com"
              required
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Firm Name
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
            <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="text"
              name="firmName"
              value={formValues.firmName}
              onChange={handleChange("firmName")}
                placeholder="Rehmat Graphics"
              required
              minLength={2}
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Address Line 1
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="addressLine1"
                value={formValues.addressLine1}
                onChange={handleChange("addressLine1")}
                placeholder="123 Print Street"
                required
                minLength={3}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Address Line 2
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="addressLine2"
                value={formValues.addressLine2}
                onChange={handleChange("addressLine2")}
                placeholder="Suite 4B"
                minLength={0}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Country
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <Globe className="h-4 w-4 text-slate-400" aria-hidden />
              <select
                name="country"
                value={formValues.country}
                onChange={handleCountrySelect}
                required
                disabled={isCountriesLoading || countryOptions.length === 0}
                className="w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none disabled:text-slate-400"
              >
                <option value="">
                  {isCountriesLoading
                    ? "Loading countries..."
                    : "Select country"}
                </option>
                {countryOptions.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.emoji ? `${country.emoji} ` : ""}
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              State
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              <select
                name="state"
                value={formValues.state}
                onChange={handleStateSelect}
                required
                disabled={!formValues.country || isStatesLoading}
                className="w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none disabled:text-slate-400"
              >
                <option value="">
                  {!formValues.country
                    ? "Select country first"
                    : isStatesLoading
                    ? "Loading states..."
                    : "Select state"}
                </option>
                {stateOptions.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              City
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              <select
                name="city"
                value={formValues.city}
                onChange={handleCitySelect}
                required
                disabled={!formValues.state || isCitiesLoading}
                className="w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none disabled:text-slate-400"
              >
                <option value="">
                  {!formValues.state
                    ? "Select state first"
                    : isCitiesLoading
                    ? "Loading cities..."
                    : "Select city"}
                </option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        {locationError ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
            {locationError}
          </p>
        ) : null}

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Password
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
            <Lock className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange("password")}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Visiting Card
          </span>
          <input
            ref={fileInputRef}
            id="visitingCard"
            type="file"
            name="visitingCard"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="sr-only"
          />
          <div
            role="button"
            tabIndex={0}
            onClick={triggerFileDialog}
            onKeyDown={handleFileKeyPress}
            className="mt-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center transition duration-200 hover:border-brand-primary hover:shadow-sm focus:outline-none focus-visible:border-brand-primary focus-visible:shadow-sm"
          >
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-sm text-slate-600">
              <Upload className="h-6 w-6 text-brand-primary" aria-hidden />
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Upload Image (max 5MB)
              </p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  triggerFileDialog();
                }}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-slate-950"
              >
                Choose File
              </button>
              {visitingCardFile ? (
                <p className="text-xs text-slate-500">
                  Selected: {visitingCardFile.name}
                </p>
              ) : (
                <p className="text-xs text-slate-400">PNG, JPG or WebP</p>
              )}
            </div>
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Processing
            </>
          ) : (
            <>Create Account</>
          )}
        </button>
      </form>

      {status.type !== "idle" && status.message ? (
        <div
          role={status.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4" aria-hidden />
          ) : null}
          <span>{status.message}</span>
        </div>
      ) : null}
    </div>
  );
};

export default RegisterForm;
