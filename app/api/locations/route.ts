import { NextRequest, NextResponse } from "next/server";
import locationData from "@/data/countries-states-cities.json";

type RawCountry = {
  name: string;
  emoji?: string;
  states: Record<string, string[]>;
};

type CountriesResponse = {
  type: "countries";
  countries: Array<{
    name: string;
    emoji: string | null;
    stateCount: number;
  }>;
};

type StatesResponse = {
  type: "states";
  country: {
    name: string;
    emoji: string | null;
  };
  states: Array<{
    name: string;
    cityCount: number;
  }>;
};

type CitiesResponse = {
  type: "cities";
  country: {
    name: string;
    emoji: string | null;
  };
  state: {
    name: string;
    cities: string[];
  };
};

type ErrorResponse = {
  error: string;
};

const countries = locationData as RawCountry[];

const cacheHeaders = {
  "Cache-Control": "s-maxage=86400, stale-while-revalidate=43200",
};

const normalize = (value: string | null) => value?.trim().toLowerCase() ?? "";

const notFound = (message: string) =>
  NextResponse.json({ error: message }, { status: 404, headers: cacheHeaders });

export const GET = async (
  request: NextRequest
): Promise<NextResponse<CountriesResponse | StatesResponse | CitiesResponse | ErrorResponse>> => {
  const { searchParams } = new URL(request.url);
  const countryQuery = normalize(searchParams.get("country"));
  const stateQuery = normalize(searchParams.get("state"));

  if (!countryQuery) {
    const payload: CountriesResponse = {
      type: "countries",
      countries: countries
        .map((country) => ({
          name: country.name,
          emoji: country.emoji ?? null,
          stateCount: Object.keys(country.states ?? {}).length,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: cacheHeaders,
    });
  }

  const country = countries.find(
    (item) => normalize(item.name) === countryQuery
  );

  if (!country) {
    return notFound("Country not found.");
  }

  if (!stateQuery) {
    const payload: StatesResponse = {
      type: "states",
      country: {
        name: country.name,
        emoji: country.emoji ?? null,
      },
      states: Object.entries(country.states ?? {})
        .map(([stateName, cities]) => ({
          name: stateName,
          cityCount: cities.length,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: cacheHeaders,
    });
  }

  const stateCities = Object.entries(country.states ?? {}).find(
    ([stateName]) => normalize(stateName) === stateQuery
  );

  if (!stateCities) {
    return notFound("State not found in the specified country.");
  }

  const [stateName, citiesList] = stateCities;

  const payload: CitiesResponse = {
    type: "cities",
    country: {
      name: country.name,
      emoji: country.emoji ?? null,
    },
    state: {
      name: stateName,
      cities: [...citiesList].sort((a, b) => a.localeCompare(b)),
    },
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: cacheHeaders,
  });
};
