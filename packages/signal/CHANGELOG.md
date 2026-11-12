# @owanturist/signal

## 0.1.1

### Patch Changes

- [#1115](https://github.com/owanturist/signal/pull/1115) [`bddd1f8`](https://github.com/owanturist/signal/commit/bddd1f8bdd6bffc0adb0665f3f340f8c8d59c2f3) Thanks [@owanturist](https://github.com/owanturist)! - List the private `@owanturist/internals` helpers package in `devDependencies`. Its code is inlined into the build, so nothing changes for installs.

- [#1114](https://github.com/owanturist/signal/pull/1114) [`cce4c96`](https://github.com/owanturist/signal/commit/cce4c961eef54ec698f05ceb1e23f22ad05d0cf2) Thanks [@owanturist](https://github.com/owanturist)! - Add an internal `@owanturist/source` export condition used by the monorepo tooling. It has no effect unless a bundler explicitly enables that condition.

- [#1101](https://github.com/owanturist/signal/pull/1101) [`d37cfd8`](https://github.com/owanturist/signal/commit/d37cfd80a0b628aad218978fa3a42d8c99bbd099) Thanks [@owanturist](https://github.com/owanturist)! - Internal refactor to remove unsafe type assertions. No public API or behavior changes.

- [#1103](https://github.com/owanturist/signal/pull/1103) [`8d58f59`](https://github.com/owanturist/signal/commit/8d58f59715d3591e1028e9f2514be2151d74c877) Thanks [@owanturist](https://github.com/owanturist)! - Build with tsdown instead of tsup. The CommonJS bundles are smaller, and type-only exports are now declared with `export type` in the `.d.ts` files.

## 0.1.0

### Minor Changes

- [#1034](https://github.com/owanturist/signal/pull/1034) [`651127e`](https://github.com/owanturist/signal/commit/651127eaa563b99766a31e801797edbe1cbc6c51) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Initial release of `@owanturist/signal` package.
