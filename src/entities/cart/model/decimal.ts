const DECIMAL_PATTERN = /^\d+(?:[.,]\d+)?$/;
const MAX_DECIMAL_LENGTH = 100;

interface ParsedDecimal {
  scale: number;
  units: bigint;
}

function powerOfTen(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

function parseDecimal(value: string): ParsedDecimal | null {
  const normalizedValue = value.trim().replace(',', '.');

  if (
    normalizedValue.length === 0 ||
    normalizedValue.length > MAX_DECIMAL_LENGTH ||
    !DECIMAL_PATTERN.test(normalizedValue)
  ) {
    return null;
  }

  const [integerPart = '', fractionalPart = ''] = normalizedValue.split('.');

  try {
    return {
      scale: fractionalPart.length,
      units: BigInt(`${integerPart}${fractionalPart}`),
    };
  } catch {
    return null;
  }
}

function toScale(decimal: ParsedDecimal, scale: number): bigint {
  return decimal.units * powerOfTen(scale - decimal.scale);
}

function formatScaledDecimal(units: bigint, scale: number): string {
  if (scale === 0) {
    return units.toString();
  }

  const paddedValue = units.toString().padStart(scale + 1, '0');
  const integerPart = paddedValue.slice(0, -scale);
  const fractionalPart = paddedValue.slice(-scale).replace(/0+$/, '');

  return fractionalPart.length === 0 ? integerPart : `${integerPart}.${fractionalPart}`;
}

function roundPositiveFraction(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

export interface CartQuantityRules {
  max: string | null;
  min: string;
  step: string;
}

interface AlignedQuantityRules {
  maxUnits: bigint | null;
  minUnits: bigint;
  scale: number;
  stepUnits: bigint;
}

function expandAlignedRules(
  rules: AlignedQuantityRules,
  decimals: readonly ParsedDecimal[],
): AlignedQuantityRules {
  const scale = Math.max(rules.scale, ...decimals.map((decimal) => decimal.scale));

  if (scale === rules.scale) {
    return rules;
  }

  const scaleMultiplier = powerOfTen(scale - rules.scale);

  return {
    maxUnits: rules.maxUnits === null ? null : rules.maxUnits * scaleMultiplier,
    minUnits: rules.minUnits * scaleMultiplier,
    scale,
    stepUnits: rules.stepUnits * scaleMultiplier,
  };
}

function alignQuantityRules(rules: CartQuantityRules): AlignedQuantityRules | null {
  const minimum = parseDecimal(rules.min);
  const step = parseDecimal(rules.step);
  const maximum = rules.max === null ? null : parseDecimal(rules.max);

  if (
    minimum === null ||
    step === null ||
    minimum.units <= 0n ||
    step.units <= 0n ||
    (rules.max !== null && maximum === null)
  ) {
    return null;
  }

  const scale = Math.max(minimum.scale, step.scale, maximum?.scale ?? 0);
  const minUnits = toScale(minimum, scale);
  const stepUnits = toScale(step, scale);
  const rawMaxUnits = maximum === null ? null : toScale(maximum, scale);

  if (rawMaxUnits !== null && rawMaxUnits < minUnits) {
    return null;
  }

  const maxUnits =
    rawMaxUnits === null ? null : minUnits + ((rawMaxUnits - minUnits) / stepUnits) * stepUnits;

  return {
    maxUnits,
    minUnits,
    scale,
    stepUnits,
  };
}

export function createCartQuantityRules(
  min: string,
  step: string,
  max: string | null,
): CartQuantityRules | null {
  const candidate = {
    max,
    min,
    step,
  };
  const alignedRules = alignQuantityRules(candidate);

  if (alignedRules === null) {
    return null;
  }

  return {
    max:
      alignedRules.maxUnits === null
        ? null
        : formatScaledDecimal(alignedRules.maxUnits, alignedRules.scale),
    min: formatScaledDecimal(alignedRules.minUnits, alignedRules.scale),
    step: formatScaledDecimal(alignedRules.stepUnits, alignedRules.scale),
  };
}

export function isPositiveDecimal(value: string): boolean {
  const parsedValue = parseDecimal(value);

  return parsedValue !== null && parsedValue.units > 0n;
}

export function normalizeCartQuantity(value: string, rules: CartQuantityRules): string {
  const baseRules = alignQuantityRules(rules);

  if (baseRules === null) {
    return rules.min;
  }

  const parsedValue = parseDecimal(value);
  const alignedRules = expandAlignedRules(baseRules, parsedValue === null ? [] : [parsedValue]);
  const requestedUnits =
    parsedValue === null ? alignedRules.minUnits : toScale(parsedValue, alignedRules.scale);
  const clampedUnits =
    requestedUnits < alignedRules.minUnits ? alignedRules.minUnits : requestedUnits;
  const offset = clampedUnits - alignedRules.minUnits;
  const stepCount = roundPositiveFraction(offset, alignedRules.stepUnits);
  const normalizedUnits = alignedRules.minUnits + stepCount * alignedRules.stepUnits;
  const boundedUnits =
    alignedRules.maxUnits === null || normalizedUnits <= alignedRules.maxUnits
      ? normalizedUnits
      : alignedRules.maxUnits;

  return formatScaledDecimal(boundedUnits, alignedRules.scale);
}

export function addCartQuantities(first: string, second: string, rules: CartQuantityRules): string {
  const baseRules = alignQuantityRules(rules);
  const firstValue = parseDecimal(first);
  const secondValue = parseDecimal(second);

  if (baseRules === null || firstValue === null || secondValue === null) {
    return normalizeCartQuantity(first, rules);
  }

  const alignedRules = expandAlignedRules(baseRules, [firstValue, secondValue]);
  const sum = formatScaledDecimal(
    toScale(firstValue, alignedRules.scale) + toScale(secondValue, alignedRules.scale),
    alignedRules.scale,
  );

  return normalizeCartQuantity(sum, rules);
}

export function incrementCartQuantity(quantity: string, rules: CartQuantityRules): string {
  return addCartQuantities(quantity, rules.step, rules);
}

export function decrementCartQuantity(quantity: string, rules: CartQuantityRules): string {
  const alignedRules = alignQuantityRules(rules);
  const currentValue = parseDecimal(normalizeCartQuantity(quantity, rules));

  if (alignedRules === null || currentValue === null) {
    return rules.min;
  }

  const nextUnits = toScale(currentValue, alignedRules.scale) - alignedRules.stepUnits;
  const boundedUnits = nextUnits < alignedRules.minUnits ? alignedRules.minUnits : nextUnits;

  return formatScaledDecimal(boundedUnits, alignedRules.scale);
}

export function canIncrementCartQuantity(quantity: string, rules: CartQuantityRules): boolean {
  return incrementCartQuantity(quantity, rules) !== normalizeCartQuantity(quantity, rules);
}

export function canDecrementCartQuantity(quantity: string, rules: CartQuantityRules): boolean {
  return decrementCartQuantity(quantity, rules) !== normalizeCartQuantity(quantity, rules);
}

export function calculateLineTotalMinor(amountMinor: number, quantity: string): bigint | null {
  const parsedQuantity = parseDecimal(quantity);

  if (
    !Number.isSafeInteger(amountMinor) ||
    amountMinor < 0 ||
    parsedQuantity === null ||
    parsedQuantity.units <= 0n
  ) {
    return null;
  }

  return roundPositiveFraction(
    BigInt(amountMinor) * parsedQuantity.units,
    powerOfTen(parsedQuantity.scale),
  );
}

export function calculateCartTotalMinor(
  lines: readonly {
    amountMinor: number;
    quantity: string;
  }[],
): bigint {
  return lines.reduce((total, line) => {
    const lineTotal = calculateLineTotalMinor(line.amountMinor, line.quantity);

    return lineTotal === null ? total : total + lineTotal;
  }, 0n);
}

export function formatCartMoney(amountMinor: bigint): string {
  const isNegative = amountMinor < 0n;
  const absoluteAmount = isNegative ? -amountMinor : amountMinor;
  const rubles = absoluteAmount / 100n;
  const kopecks = (absoluteAmount % 100n).toString().padStart(2, '0');
  const groupedRubles = rubles.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  return `${isNegative ? '−' : ''}${groupedRubles},${kopecks} ₽`;
}
