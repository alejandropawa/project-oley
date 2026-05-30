import { categories, type ListingCondition, type ListingType } from "@/lib/mock-data";
import {
  getFallbackAttributeDefinitions,
  stringifyAttribute,
  type ListingAttributes,
} from "@/lib/categories/attribute-definitions";
import type { ListingLocationPrecision } from "@/lib/locations/types";
import { z } from "zod";

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
  type: "sell",
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
  "Fotografii",
  "Preview și publicare",
] as const;

const listingTypeSchema = z.enum(["sell", "buy", "rent", "swap"]);

const categoryStepSchema = z.object({
  type: listingTypeSchema,
  categorySlug: z.string().trim().min(1, "Alege categoria anunțului."),
});

const detailsStepTextSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Titlul este obligatoriu.")
    .min(8, "Titlul trebuie să aibă cel puțin 8 caractere."),
  description: z
    .string()
    .trim()
    .min(1, "Descrierea este obligatorie.")
    .min(30, "Descrierea trebuie să aibă cel puțin 30 de caractere."),
  subcategory: z.string().trim().min(1, "Alege o subcategorie."),
  city: z.string().trim().min(1, "Alege localitatea."),
  county: z.string().trim().min(1, "Alege localitatea."),
});

export function validateCreateListingStep(
  step: CreateListingStep,
  values: CreateListingValues,
) {
  if (step === 0) {
    return validateCategoryStep(values);
  }

  if (step === 1) {
    return validateDetailsStep(values);
  }

  if (step === 2) {
    return validateMediaLocationStep();
  }

  return validateAll(values);
}

export function validateAll(values: CreateListingValues) {
  return {
    ...validateCategoryStep(values),
    ...validateDetailsStep(values),
    ...validateMediaLocationStep(),
  };
}

function validateCategoryStep(values: CreateListingValues) {
  const errors: CreateListingErrors = {};
  const result = categoryStepSchema.safeParse({
    type: values.type,
    categorySlug: values.categorySlug,
  });

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (field === "type") {
        errors.type = "Alege tipul anunțului.";
      }

      if (field === "categorySlug") {
        errors.categorySlug = issue.message;
      }
    }
  }

  if (!values.categorySlug) {
    errors.categorySlug = "Alege categoria anunțului.";
  }

  return errors;
}

function validateDetailsStep(values: CreateListingValues) {
  const errors: CreateListingErrors = {};
  const price = values.price.trim();
  const textResult = detailsStepTextSchema.safeParse(values);

  if (!textResult.success) {
    for (const issue of textResult.error.issues) {
      const field = issue.path[0];

      if (
        field === "title" ||
        field === "description" ||
        field === "subcategory" ||
        field === "city" ||
        field === "county"
      ) {
        errors[field] = issue.message;
      }
    }
  }

  if (!values.categorySlug) {
    errors.categorySlug = "Alege o categorie.";
  }

  const selectedCategory = categories.find(
    (category) => category.slug === values.categorySlug,
  );

  if (!values.type) {
    errors.type = "Alege tipul anunțului.";
  } else if (
    selectedCategory &&
    !selectedCategory.allowedListingTypes.includes(values.type)
  ) {
    errors.type = "Alege un tip de anunț disponibil pentru categoria selectată.";
  }

  if (!values.subcategory) {
    errors.subcategory = "Alege o subcategorie.";
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

  if ((values.type === "sell" || values.type === "rent") && !price) {
    errors.price =
      values.type === "rent"
        ? "Adaugă un preț pentru închiriere."
        : "Adaugă prețul de vânzare.";
  }

  if (price) {
    const numericPrice = parseCreateListingPrice(price);

    if (!numericPrice || numericPrice <= 0) {
      errors.price = "Prețul trebuie să fie un număr pozitiv.";
    }
  }

  return errors;
}

function validateMediaLocationStep() {
  const errors: CreateListingErrors = {};

  return errors;
}

export function hasValidationErrors(errors: CreateListingErrors) {
  return Object.keys(errors).length > 0;
}

export function parseCreateListingPrice(price: string) {
  const compactPrice = price.trim().replace(/\s/g, "");

  if (!compactPrice) {
    return null;
  }

  const normalizedPrice = compactPrice.includes(",")
    ? compactPrice.replace(/\./g, "").replace(",", ".")
    : compactPrice.replace(/\.(?=\d{3}(\D|$))/g, "");
  const numericPrice = Number(normalizedPrice);

  return Number.isFinite(numericPrice) ? numericPrice : null;
}
