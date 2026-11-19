# @owanturist/signal-react

## 0.1.1

### Patch Changes

- [#1099](https://github.com/owanturist/signal/pull/1099) [`1a710e3`](https://github.com/owanturist/signal/commit/1a710e3f6bf52df55b46edf19752d46a823df92e) Thanks [@owanturist](https://github.com/owanturist)! - Bump `use-sync-external-store` dependency from `^1.6.0` to `^1.7.0`.

- [#1115](https://github.com/owanturist/signal/pull/1115) [`bddd1f8`](https://github.com/owanturist/signal/commit/bddd1f8bdd6bffc0adb0665f3f340f8c8d59c2f3) Thanks [@owanturist](https://github.com/owanturist)! - List the private `@owanturist/internals` helpers package in `devDependencies`. Its code is inlined into the build, so nothing changes for installs.

- [#1114](https://github.com/owanturist/signal/pull/1114) [`cce4c96`](https://github.com/owanturist/signal/commit/cce4c961eef54ec698f05ceb1e23f22ad05d0cf2) Thanks [@owanturist](https://github.com/owanturist)! - Add an internal `@owanturist/source` export condition used by the monorepo tooling. It has no effect unless a bundler explicitly enables that condition.

- [#1103](https://github.com/owanturist/signal/pull/1103) [`8d58f59`](https://github.com/owanturist/signal/commit/8d58f59715d3591e1028e9f2514be2151d74c877) Thanks [@owanturist](https://github.com/owanturist)! - Build with tsdown instead of tsup. The CommonJS bundles are smaller, and type-only exports are now declared with `export type` in the `.d.ts` files.
- Updated dependencies [[`bddd1f8`](https://github.com/owanturist/signal/commit/bddd1f8bdd6bffc0adb0665f3f340f8c8d59c2f3), [`cce4c96`](https://github.com/owanturist/signal/commit/cce4c961eef54ec698f05ceb1e23f22ad05d0cf2), [`d37cfd8`](https://github.com/owanturist/signal/commit/d37cfd80a0b628aad218978fa3a42d8c99bbd099), [`8d58f59`](https://github.com/owanturist/signal/commit/8d58f59715d3591e1028e9f2514be2151d74c877)]:
  - @owanturist/signal@0.1.1

## 0.1.0

### Minor Changes

- [#1054](https://github.com/owanturist/signal/pull/1054) [`28e7915`](https://github.com/owanturist/signal/commit/28e79152c7ba74ed47a6abcebdb0d7af467cb01c) Thanks [@owanturist](https://github.com/owanturist)! - Initial release of `@owanturist/signal-form` and `@owanturist/signal-react` packages.
