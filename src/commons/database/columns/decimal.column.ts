export const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

export const decimalColumn = {
  type: 'decimal',
  precision: 10,
  scale: 2,
  transformer: decimalTransformer,
} as const;
