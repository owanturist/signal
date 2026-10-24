import type { FormUnitTransformer } from "../form-unit-transformer"
import type { FormUnitValidator } from "../form-unit-validator"

import { type ZodLikeSchema, zodLikeParse } from "./zod-like-schema"

interface FormUnitTransform<TInput, TError, TOutput> {
  readonly _transformer: boolean
  readonly _validator: FormUnitValidator<TInput, TError, TOutput>
}

function transformFromInput<TInput>() {
  return {
    _transformer: true,
    _validator: (input) => [null, input],
  } satisfies FormUnitTransform<TInput, never, TInput>
}

function transformFromTransformer<TInput, TOutput>(
  transformer: FormUnitTransformer<TInput, TOutput>,
): FormUnitTransform<TInput, never, TOutput> {
  return {
    _transformer: true,
    _validator: (input) => [null, transformer(input)],
  }
}

function transformFromValidator<TInput, TError, TOutput>(
  validator: FormUnitValidator<TInput, TError, TOutput>,
): FormUnitTransform<TInput, TError, TOutput> {
  return {
    _transformer: false,
    _validator: validator,
  }
}

function transformFromSchema<TInput, TOutput>(
  schema: ZodLikeSchema<TOutput>,
): FormUnitTransform<TInput, ReadonlyArray<string>, TOutput> {
  return {
    _transformer: false,
    _validator: (input) => zodLikeParse(schema, input),
  }
}

export type { FormUnitTransform }
export { transformFromInput, transformFromSchema, transformFromTransformer, transformFromValidator }
