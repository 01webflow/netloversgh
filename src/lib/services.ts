import {
  Zap,
  Droplets,
  Phone,
  IdCard,
  GraduationCap,
  Tv,
  LucideIcon,
} from "lucide-react";

export interface ServicePackage {
  id: string;
  name: string;
  amount: number;
}

export interface ServiceProviderOption {
  id: string;
  name: string;
}

export interface ServiceDefinition {
  slug: string;
  type: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes
  accountLabel: string;
  accountPlaceholder: string;
  /** Regex the account/meter/phone number must match */
  accountPattern?: RegExp;
  accountHint?: string;
  providers: ServiceProviderOption[];
  /** Fixed packages; when empty the user enters a custom amount */
  packages?: ServicePackage[];
  minAmount?: number;
  maxAmount?: number;
}

export const SERVICES: ServiceDefinition[] = [
  {
    slug: "electricity",
    type: "electricity",
    title: "ECG Electricity",
    tagline: "Top up your prepaid meter instantly",
    icon: Zap,
    accent: "from-amber-400 to-orange-500",
    accountLabel: "Meter number",
    accountPlaceholder: "e.g. P123456789",
    accountHint: "Enter the number printed on your prepaid meter",
    providers: [
      { id: "ecg", name: "ECG (Electricity Company of Ghana)" },
      { id: "nedco", name: "NEDCo (Northern Electricity)" },
    ],
    minAmount: 10,
    maxAmount: 2000,
  },
  {
    slug: "water",
    type: "water",
    title: "Ghana Water",
    tagline: "Settle your GWCL bill in seconds",
    icon: Droplets,
    accent: "from-sky-400 to-blue-600",
    accountLabel: "Account / meter number",
    accountPlaceholder: "e.g. 0201234567",
    providers: [{ id: "gwcl", name: "Ghana Water Company Limited" }],
    minAmount: 10,
    maxAmount: 2000,
  },
  {
    slug: "airtime",
    type: "airtime",
    title: "Airtime Top-up",
    tagline: "Instant credit on every network",
    icon: Phone,
    accent: "from-emerald-400 to-green-600",
    accountLabel: "Phone number",
    accountPlaceholder: "0XXXXXXXXX",
    accountPattern: /^0\d{9}$/,
    accountHint: "10-digit Ghana number starting with 0",
    providers: [
      { id: "mtn", name: "MTN" },
      { id: "telecel", name: "Telecel" },
      { id: "at", name: "AT (AirtelTigo)" },
    ],
    minAmount: 1,
    maxAmount: 500,
  },
  {
    slug: "mtn-afa",
    type: "afa",
    title: "MTN AFA Registration",
    tagline: "Register a new AFA SIM profile",
    icon: IdCard,
    accent: "from-yellow-400 to-amber-500",
    accountLabel: "Phone number to register",
    accountPlaceholder: "0XXXXXXXXX",
    accountPattern: /^0\d{9}$/,
    accountHint: "10-digit Ghana number starting with 0",
    providers: [{ id: "mtn", name: "MTN AFA" }],
    packages: [{ id: "afa-registration", name: "AFA Registration", amount: 12 }],
  },
  {
    slug: "result-checker",
    type: "result_checker",
    title: "Result Checkers",
    tagline: "WAEC checker PINs delivered instantly",
    icon: GraduationCap,
    accent: "from-violet-400 to-purple-600",
    accountLabel: "Phone number for delivery",
    accountPlaceholder: "0XXXXXXXXX",
    accountPattern: /^0\d{9}$/,
    providers: [{ id: "waec", name: "WAEC Ghana" }],
    packages: [
      { id: "bece", name: "BECE Checker", amount: 20 },
      { id: "wassce", name: "WASSCE Checker", amount: 25 },
      { id: "nov-dec", name: "NOV/DEC Checker", amount: 25 },
      { id: "cssps", name: "CSSPS Placement Checker", amount: 20 },
    ],
  },
  {
    slug: "tv",
    type: "tv",
    title: "TV Subscriptions",
    tagline: "DStv, GOtv and StarTimes renewals",
    icon: Tv,
    accent: "from-rose-400 to-red-600",
    accountLabel: "Smartcard / decoder number",
    accountPlaceholder: "e.g. 1234567890",
    providers: [
      { id: "dstv", name: "DStv" },
      { id: "gotv", name: "GOtv" },
      { id: "startimes", name: "StarTimes" },
    ],
    packages: [
      { id: "gotv-smallie", name: "GOtv Smallie", amount: 47 },
      { id: "gotv-jinja", name: "GOtv Jinja", amount: 105 },
      { id: "gotv-jolli", name: "GOtv Jolli", amount: 155 },
      { id: "gotv-max", name: "GOtv Max", amount: 235 },
      { id: "dstv-padi", name: "DStv Padi", amount: 190 },
      { id: "dstv-yanga", name: "DStv Yanga", amount: 265 },
      { id: "dstv-confam", name: "DStv Confam", amount: 470 },
      { id: "dstv-compact", name: "DStv Compact", amount: 800 },
      { id: "startimes-nova", name: "StarTimes Nova", amount: 55 },
      { id: "startimes-basic", name: "StarTimes Basic", amount: 95 },
      { id: "startimes-classic", name: "StarTimes Classic", amount: 145 },
    ],
  },
];

export const getService = (slug?: string) =>
  SERVICES.find((s) => s.slug === slug);
