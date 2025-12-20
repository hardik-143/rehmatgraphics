'use client';

import { useRef, useState, useCallback } from 'react';
import {
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
} from 'lucide-react';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { getCitiesForState, STATE_NAMES } from '@/app/utils/stateCityMap';
import FormInput from '@/components/ui/form/FormInput';
import FormSelect, {
  type FormSelectOption,
} from '@/components/ui/form/FormSelect';

type StatusState = {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string | null;
};

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  firmName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
}

const initialValues: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNumber: '',
  firmName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters')
    .required('Password is required'),
  phoneNumber: Yup.string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(20, 'Phone number must be at most 20 characters')
    .matches(/^[0-9+\-()\s]*$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  firmName: Yup.string()
    .trim()
    .min(2, 'Firm name must be at least 2 characters')
    .required('Firm name is required'),
  addressLine1: Yup.string()
    .trim()
    .min(3, 'Address must be at least 3 characters')
    .required('Address is required'),
  addressLine2: Yup.string().trim().max(120, 'Address line 2 is too long'),
  state: Yup.string().required('State is required'),
  city: Yup.string().required('City is required'),
});

const stateOptions: FormSelectOption[] = STATE_NAMES.map((state) => ({
  value: state,
  label: state,
}));

interface StateCitySelectsProps {
  cityOptions: FormSelectOption[];
  onStateChange: (state: string) => void;
}

const StateCitySelects = ({
  cityOptions,
  onStateChange,
}: StateCitySelectsProps) => {
  const { values, setFieldValue } = useFormikContext<RegisterFormValues>();

  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newState = e.target.value;
      void setFieldValue('state', newState);
      void setFieldValue('city', '');
      onStateChange(newState);
    },
    [setFieldValue, onStateChange]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="group relative flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          State
        </span>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
          <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
          <select
            name="state"
            value={values.state}
            onChange={handleStateChange}
            required
            disabled={stateOptions.length === 0}
            className="w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none disabled:text-slate-400"
          >
            <option value="">
              {stateOptions.length === 0
                ? 'States unavailable'
                : 'Select state'}
            </option>
            {stateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </label>
      <FormSelect
        name="city"
        label="City"
        icon={MapPin}
        options={cityOptions}
        placeholder={
          !values.state
            ? 'Select state first'
            : cityOptions.length === 0
              ? 'Cities unavailable'
              : 'Select city'
        }
        disabled={!values.state || cityOptions.length === 0}
        required
      />
    </div>
  );
};

interface VisitingCardUploadProps {
  visitingCardFile: File | null;
  onFileChange: (file: File | null) => void;
}

const VisitingCardUpload = ({
  visitingCardFile,
  onFileChange,
}: VisitingCardUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Space') {
      event.preventDefault();
      triggerFileDialog();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileChange(file ?? null);
  };

  return (
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
  );
};

const RegisterForm = () => {
  const [visitingCardFile, setVisitingCardFile] = useState<File | null>(null);
  const [cityOptions, setCityOptions] = useState<FormSelectOption[]>([]);
  const [status, setStatus] = useState<StatusState>({
    type: 'idle',
    message: null,
  });

  const handleStateChange = useCallback((state: string) => {
    const cities = state ? getCitiesForState(state) : [];
    setCityOptions(cities.map((city) => ({ value: city, label: city })));
  }, []);

  const handleSubmit = async (
    values: RegisterFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    if (!visitingCardFile) {
      setStatus({
        type: 'error',
        message: 'Please upload your visiting card image before submitting.',
      });
      return;
    }

    setStatus({ type: 'loading', message: 'Creating your account…' });

    try {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append('visitingCard', visitingCardFile);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === 'string' ? data.error : 'Registration failed.';
        setStatus({ type: 'error', message });
        return;
      }

      setStatus({
        type: 'success',
        message:
          typeof data?.message === 'string'
            ? data.message
            : "Registration received. We'll email you once an administrator approves your account.",
      });
      resetForm();
      setCityOptions([]);
      setVisitingCardFile(null);
    } catch (error) {
      console.error('Registration error:', error);
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  const isLoading = status.type === 'loading';

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-sm">
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

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="relative space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="firstName"
              label="First Name"
              icon={User}
              placeholder="Rehmat"
              required
            />
            <FormInput
              name="lastName"
              label="Last Name"
              icon={User}
              placeholder="Graphics"
              required
            />
          </div>

          <FormInput
            name="phoneNumber"
            label="Phone Number"
            icon={Phone}
            type="tel"
            placeholder="+91 98765 43210"
            required
          />

          <FormInput
            name="email"
            label="Work Email"
            icon={Mail}
            type="email"
            placeholder="hello@rehmatgraphics.com"
            required
          />

          <FormInput
            name="firmName"
            label="Firm Name"
            icon={Building2}
            placeholder="Rehmat Graphics"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              name="addressLine1"
              label="Address Line 1"
              icon={MapPin}
              placeholder="123 Print Street"
              required
            />
            <FormInput
              name="addressLine2"
              label="Address Line 2"
              icon={MapPin}
              placeholder="Suite 4B"
            />
          </div>

          <StateCitySelects
            cityOptions={cityOptions}
            onStateChange={handleStateChange}
          />

          <FormInput
            name="password"
            label="Password"
            icon={Lock}
            type="password"
            placeholder="Minimum 8 characters"
            required
          />

          <VisitingCardUpload
            visitingCardFile={visitingCardFile}
            onFileChange={setVisitingCardFile}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-slate-950 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
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
        </Form>
      </Formik>

      {status.type !== 'idle' && status.message ? (
        <div
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            status.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4" aria-hidden />
          ) : null}
          <span>{status.message}</span>
        </div>
      ) : null}
    </div>
  );
};

export default RegisterForm;
