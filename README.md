# Welcome to the `@owanturist/signal` monorepo!

Below are links to the various packages in this monorepo:

- [`@owanturist/signal`](./packages/signal/README.md)
- [`@owanturist/signal-react`](./packages/signal-react/README.md)
- [`@owanturist/signal-form`](./packages/signal-form/README.md)

## Development

The toolchain is pinned in [`mise.toml`](./mise.toml) and managed by [mise](https://mise.jdx.dev) `2026.10.18`. CI pins the same mise version in [`.github/actions/setup-env/action.yml`](./.github/actions/setup-env/action.yml) to keep `mise.lock` stable across environments, so bump both together.

```sh
mise trust && mise install
pnpm install
```
