import { fireEvent, render, screen } from '@testing-library/react';

import type { ProductVariant, VariantOptionGroup, VariantOptionValue } from '@/entities/product';

import { useProductVariantSelection } from '../model/useProductVariantSelection';
import { VariantSelector } from './VariantSelector';

function option(code: string, label: string, value: string): VariantOptionValue {
  return {
    code,
    label,
    value,
  };
}

function variant(
  id: string,
  optionValues: readonly VariantOptionValue[],
  status: ProductVariant['availability']['status'] = 'in_stock',
): ProductVariant {
  return {
    attributes: [],
    availability: {
      message: null,
      status,
    },
    availableQuantity: status === 'out_of_stock' ? null : '10',
    externalId: null,
    id,
    imageId: null,
    maxOrderQuantity: null,
    minOrderQuantity: '1',
    name: id,
    oldPrice: null,
    optionValues: [...optionValues],
    packageQuantity: null,
    price: {
      amountMinor: 10_000,
      currency: 'RUB',
    },
    priceType: 'fixed',
    quantityStep: '1',
    sku: id.toUpperCase(),
    unit: {
      code: 'piece',
      label: 'шт.',
    },
  };
}

const diameter20 = option('diameter', '20 мм', '20');
const diameter25 = option('diameter', '25 мм', '25');
const pressure20 = option('pressure', 'PN20', 'pn20');
const pressure25 = option('pressure', 'PN25', 'pn25');

const optionGroups: readonly VariantOptionGroup[] = [
  {
    code: 'diameter',
    name: 'Диаметр',
    sortOrder: 0,
    values: [diameter20, diameter25],
  },
  {
    code: 'pressure',
    name: 'Давление',
    sortOrder: 1,
    values: [pressure20, pressure25],
  },
];

const variants = [
  variant('20-pn20', [diameter20, pressure20]),
  variant('20-pn25', [diameter20, pressure25]),
  variant('25-pn20', [diameter25, pressure20]),
];

function SelectorHarness() {
  const selection = useProductVariantSelection(variants);

  return (
    <>
      <VariantSelector
        isOptionAvailable={selection.isOptionAvailable}
        onOptionSelect={selection.selectOption}
        optionGroups={optionGroups}
        selectedOptions={selection.selectedOptions}
      />
      <output aria-label="Выбранный артикул">
        {selection.selectedVariant?.sku ?? 'Нет варианта'}
      </output>
    </>
  );
}

describe('VariantSelector', () => {
  it('selects an available variant', () => {
    render(<SelectorHarness />);

    fireEvent.click(screen.getByRole('radio', { name: '25 мм' }));

    expect(screen.getByRole('radio', { name: '25 мм' })).toBeChecked();
    expect(screen.getByLabelText('Выбранный артикул')).toHaveTextContent('25-PN20');
  });

  it('disables a missing option combination', () => {
    render(<SelectorHarness />);

    fireEvent.click(screen.getByRole('radio', { name: '25 мм' }));

    expect(screen.getByRole('radio', { name: /PN25.*Недоступно/i })).toBeDisabled();
  });

  it('supports keyboard navigation inside a radio group', () => {
    render(<SelectorHarness />);

    const diameter20Input = screen.getByRole('radio', { name: '20 мм' });

    diameter20Input.focus();
    expect(diameter20Input).toHaveFocus();

    fireEvent.keyDown(diameter20Input, { key: 'ArrowRight' });

    expect(screen.getByRole('radio', { name: '25 мм' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '25 мм' })).toHaveFocus();
    expect(screen.getByLabelText('Выбранный артикул')).toHaveTextContent('25-PN20');
  });
});
