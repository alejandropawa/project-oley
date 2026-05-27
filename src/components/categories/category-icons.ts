import {
  Baby,
  Bike,
  Boxes,
  Car,
  Handshake,
  Home,
  Laptop,
  Shirt,
  Sofa,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

import type { CategoryIconName } from "@/lib/mock-data";

export const categoryIcons = {
  laptop: Laptop,
  car: Car,
  home: Home,
  sofa: Sofa,
  shirt: Shirt,
  bike: Bike,
  baby: Baby,
  wrench: Wrench,
  boxes: Boxes,
  sparkles: Sparkles,
  handshake: Handshake,
} satisfies Record<CategoryIconName, ComponentType<{ className?: string }>>;
