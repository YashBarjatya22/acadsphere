"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;
const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;
const INSTANT = { duration: 0 } as const;

const COMMON =
  /^(?:password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|monkey|dragon|abc123|111111|123123|123456)/i;
const RUN = /(.)\1{3,}/;
const RUN_UP =
  /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf)/i;
const SYMBOL = /[!-/:-@[-`{-~]/;

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

export type EvaluatedRule = PasswordRule & { met: boolean };

export type UsePasswordStrengthOptions = {
  rules?: readonly PasswordRule[];
  labels?: readonly string[];
  announceDelay?: number;
};

export type PasswordStrengthState = {
  score: number;
  max: number;
  label: string;
  rules: EvaluatedRule[];
  guessable: boolean;
  announcement: string;
};

export const defaultPasswordRules: readonly PasswordRule[] = [
  { id: "length", label: "12 characters or more", test: (v) => v.length >= 12 },
  {
    id: "case",
    label: "Upper and lower case",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "digit", label: "A number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v) => SYMBOL.test(v) },
];

const defaultLabels = ["Empty", "Weak", "Fair", "Good", "Strong"] as const;

export function usePasswordStrength(
  value: string,
  {
    rules = defaultPasswordRules,
    labels = defaultLabels,
    announceDelay = 700,
  }: UsePasswordStrengthOptions = {},
): PasswordStrengthState {
  const state = useMemo(() => {
    const evaluated = rules.map((rule) => ({ ...rule, met: rule.test(value) }));
    const passed = evaluated.reduce((n, r) => n + (r.met ? 1 : 0), 0);
    const guessable =
      value.length > 0 &&
      (COMMON.test(value) || RUN.test(value) || RUN_UP.test(value));

    const score =
      value.length === 0
        ? 0
        : guessable
          ? 1
          : Math.min(rules.length, Math.max(1, passed));

    const label = labels[Math.min(score, labels.length - 1)] ?? "";
    const unmet = evaluated.filter((r) => !r.met);

    const announcement =
      value.length === 0
        ? ""
        : [
            `Password strength .`,
            guessable ? "This is a commonly guessed pattern." : "",
            unmet.length === 0
              ? "All requirements met."
              : `Still needed: . `,
          ]
            .filter(Boolean)
            .join(" ");

    return {
      score,
      max: rules.length,
      label,
      rules: evaluated,
      guessable,
      announcement,
    };
  }, [value, rules, labels]);

  const [settled, setSettled] = useState("");

  useEffect(() => {
    if (state.announcement === "") {
      setSettled("");
      return;
    }
    const id = setTimeout(() => setSettled(state.announcement), announceDelay);
    return () => clearTimeout(id);
  }, [state.announcement, announceDelay]);

  return { ...state, announcement: settled };
}
