import { entries } from "~/tools/entries"

function mapValues<TObject extends Record<string, unknown>, TResult>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult>

function mapValues<TObject extends Record<string, unknown>>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TObject[typeof key],
): TObject

function mapValues<TObject extends Record<string, unknown>, TResult>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult> {
  // biome-ignore lint/nursery/noUnsafeTypeAssertion: the accumulator is filled for every key of the object by the loop below
  const result = {} as Record<keyof TObject, TResult>

  for (const [key, value] of entries(object)) {
    result[key] = fn(value, key)
  }

  return result
}

export { mapValues }
