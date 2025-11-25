// backend/trpc/utils/casing.ts

/**
 * Converte recursivamente as chaves de um objeto de snake_case ou kebab-case para camelCase.
 * @param obj O objeto ou valor a ser convertido.
 */
export const toCamelCase = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  }
  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/([-_][a-z])/ig, ($1) =>
      $1.toUpperCase().replace('-', '').replace('_', '')
    );
    result[camelKey] = toCamelCase(obj[key]);
    return result;
  }, {} as { [key: string]: any });
};

/**
 * Converte recursivamente as chaves de um objeto de camelCase para snake_case.
 * @param obj O objeto ou valor a ser convertido.
 */
export const toSnakeCase = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  }
  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
    return result;
  }, {} as { [key: string]: any });
};

