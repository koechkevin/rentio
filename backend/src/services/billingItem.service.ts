import { BillingFrequency, BillingItemType } from "@prisma/client";

const MONTHLY_LABELS: Record<string, string> = {
  JAN: "January", FEB: "February", MAR: "March", APR: "April",
  MAY: "May", JUN: "June", JUL: "July", AUG: "August",
  SEP: "September", OCT: "October", NOV: "November", DEC: "December",
};

const QUARTERLY_LABELS: Record<string, string> = {
  Q1: "Q1 (Jan–Mar)", Q2: "Q2 (Apr–Jun)",
  Q3: "Q3 (Jul–Sep)", Q4: "Q4 (Oct–Dec)",
};

const MONTH_INDEX: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const QUARTER_START_MONTH: Record<string, number> = {
  Q1: 0, Q2: 3, Q3: 6, Q4: 9,
};

export const BILLING_ITEM_TYPE_LABELS: Record<BillingItemType, string> = {
  RENT: "Rent",
  WATER: "Water Bill",
  ELECTRICITY: "Electricity Bill",
  GAS: "Gas / LPG",
  GARBAGE: "Garbage Collection",
  SEWERAGE: "Sewerage Charge",
  SECURITY: "Security Fee",
  INTERNET: "Internet / WiFi",
  PARKING: "Parking Fee",
  SERVICE_CHARGE: "Service Charge",
  OTHER: "Other",
};

export class BillingItemService {
  /**
   * Human-readable label for a billing period.
   */
  static generateBillingPeriodLabel(
    frequency: BillingFrequency,
    billingPeriod: string,
    year: number
  ): string {
    if (frequency === BillingFrequency.MONTHLY) {
      return `${MONTHLY_LABELS[billingPeriod] ?? billingPeriod} ${year}`;
    }
    if (frequency === BillingFrequency.QUARTERLY) {
      return `${QUARTERLY_LABELS[billingPeriod] ?? billingPeriod} ${year}`;
    }
    return `Annual ${year}`;
  }

  /**
   * Converts a billing period string + year to a DateTime (first day of the period).
   * Used when populating InvoiceItem.billingPeriod.
   */
  static billingPeriodToDate(
    frequency: BillingFrequency,
    billingPeriod: string,
    year: number
  ): Date {
    if (frequency === BillingFrequency.MONTHLY) {
      const month = MONTH_INDEX[billingPeriod] ?? 0;
      return new Date(year, month, 1);
    }
    if (frequency === BillingFrequency.QUARTERLY) {
      const month = QUARTER_START_MONTH[billingPeriod] ?? 0;
      return new Date(year, month, 1);
    }
    return new Date(year, 0, 1);
  }

  /**
   * Normalizes the billingPeriod — ANNUALLY always uses "ANNUAL".
   */
  static normalizeBillingPeriod(
    frequency: BillingFrequency,
    billingPeriod?: string
  ): string {
    if (frequency === BillingFrequency.ANNUALLY) return "ANNUAL";
    return (billingPeriod ?? "").toUpperCase();
  }

  /**
   * Valid billingPeriod values per frequency.
   */
  static validPeriodsForFrequency(frequency: BillingFrequency): string[] {
    if (frequency === BillingFrequency.MONTHLY) {
      return ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    }
    if (frequency === BillingFrequency.QUARTERLY) {
      return ["Q1", "Q2", "Q3", "Q4"];
    }
    return ["ANNUAL"];
  }

  /**
   * Returns the current month as a billing period string (e.g. "JAN").
   */
  static currentMonthPeriod(): { billingPeriod: string; year: number } {
    const now = new Date();
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return { billingPeriod: months[now.getMonth()], year: now.getFullYear() };
  }
}
