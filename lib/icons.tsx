// lib/icons.tsx
// One icon family for the whole app (Phosphor). No emoji as structural icons.
// Stroke weight is standardized via IconContext where rendered.

import {
  Lightning,
  Drop,
  Trash,
  Bus,
  ForkKnife,
  type Icon,
} from "@phosphor-icons/react";
import type { CategoryKey } from "./schema";

export const CATEGORY_ICON: Record<CategoryKey, Icon> = {
  energy: Lightning,
  water: Drop,
  waste: Trash,
  transportation: Bus,
  food: ForkKnife,
};
