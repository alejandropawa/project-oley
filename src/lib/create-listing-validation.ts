import type { ListingCondition, ListingType } from "@/lib/mock-data";
import {
  getFallbackAttributeDefinitions,
  stringifyAttribute,
  type ListingAttributes,
} from "@/lib/categories/attribute-definitions";
import type { ListingLocationPrecision } from "@/lib/locations/types";

export type CreateListingStep = 0 | 1 | 2 | 3;

export type CreateListingCurrency = "RON" | "EUR";

export type ContactPreference = "chat" | "phone" | "chat-phone";

export type PhotoPreview = {
  id: string;
  name: string;
  url: string;
  file: File;
  size: number;
  type: string;
};

export type CreateListingValues = {
  type: ListingType | "";
  title: string;
  categorySlug: string;
  subcategory: string;
  description: string;
  price: string;
  currency: CreateListingCurrency;
  negotiable: boolean;
  condition: ListingCondition;
  photos: PhotoPreview[];
  city: string;
  county: string;
  latitude: number | null;
  longitude: number | null;
  locationPrecision: ListingLocationPrecision;
  locationLabel: string;
  contactPreference: ContactPreference;
  attributes: ListingAttributes;
};

export type CreateListingErrors = Partial<Record<keyof CreateListingValues, string>>;

export const initialCreateListingValues: CreateListingValues = {
  type: "",
  title: "",
  categorySlug: "",
  subcategory: "",
  description: "",
  price: "",
  currency: "RON",
  negotiable: false,
  condition: "Foarte bun",
  photos: [],
  city: "",
  county: "",
  latitude: null,
  longitude: null,
  locationPrecision: "city",
  locationLabel: "",
  contactPreference: "chat",
  attributes: {},
};

export const createListingSteps = [
  "Tip anunț",
  "Detalii",
  "Fotografii & locație",
  "Preview",
] as const;

export function validateCreateListingStep(
  step: CreateListingStep,
  values: CreateListingValues,
) {
  if (step === 0) {
    return validateTypeStep(values);
  }

  if (step === 1) {
    return validateDetailsStep(values);
  }

  if (step === 2) {
    return validateMediaLocationStep(values);
  }

  return validateAll(values);
}

export function validateAll(values: CreateListingValues) {
  return {
    ...validateTypeStep(values),
    ...validateDetailsStep(values),
    ...validateMediaLocationStep(values),
  };
}

function validateTypeStep(values: CreateListingValues) {
  const errors: CreateListingErrors = {};

  if (!values.type) {
    errors.type = "Alege tipul anunțului.";
  }

  return errors;
}

function validateDetailsStep(values: CreateListingValues) {
  const errors: CreateListingErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  const price = values.price.trim();

  if (!title) {
    errors.title = "Titlul este obligatoriu.";
  } else if (title.length < 8) {
    errors.title = "Titlul trebuie să aibă cel puțin 8 caractere.";
  }

  if (!values.categorySlug) {
    errors.categorySlug = "Alege o categorie.";
  }

  const missingRequiredAttributes = getFallbackAttributeDefinitions(
    values.categorySlug,
  ).some(
    (definition) =>
      definition.isRequired &&
      !stringifyAttribute(values.attributes[definition.key]),
  );

  if (missingRequiredAttributes) {
    errors.attributes = "Completează detaliile obligatorii ale categoriei.";
  }

  if (!description) {
    errors.description = "Descrierea este obligatorie.";
  } else if (description.length < 30) {
    errors.description = "Descrierea trebuie să aibă cel puțin 30 de caractere.";
  }

  if ((values.type === "sell" || values.type === "rent") && !price) {
    errors.price =
      values.type === "rent"
        ? "Adaugă un preț pentru închiriere."
        : "Adaugă prețul de vânzare.";
  }

  if (price) {
    const numericPrice = Number(price.replace(",", "."));

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      errors.price = "Prețul trebuie să fie un număr pozitiv.";
    }
  }

  return errors;
}

function validateMediaLocationStep(values: CreateListingValues) {
  const errors: CreateListingErrors = {};

  if (!values.city) {
    errors.city = "Alege orașul.";
  }

  if (!values.county) {
    errors.county = "Alege județul.";
  }

  return errors;
}

export function hasValidationErrors(errors: CreateListingErrors) {
  return Object.keys(errors).length > 0;
}
