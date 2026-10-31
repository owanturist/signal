import { isDefined } from "./is-defined"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && isDefined(value)
}

export { isObject }
