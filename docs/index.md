# OTEL demo

Playground project that demonstrates the following:

- a Nest.js service configured for traces and metrics using the [OTEL SDK for node](https://www.npmjs.com/package/@opentelemetry/sdk-node).
- Memory leak testing
- Basic REST APIs with OpenAPI endpoint
- GitHub action workflow to build Backstage techdocs
- Use of [release-please-action](https://github.com/google-github-actions/release-please-action]) for releases

The SDK install guide (above link) tells you to install `@opentelemetry/auto-instrumentations-node`.

This brings in automatic instrumentation for popular node packages including Nest.js, Mongoose, etc. You don't need to install these packages separately.

Check out (and confirm) the [dev environment runtime configuration](./.env). This configures the Jaeger collector address, etc. You will see similar in the docker-compose file and Kubernetes example manifests.

[Writing Documenation](./docs-overview)

## Quickstart

Start server

```bash
npm run start:dev
```

Open API

```bash
open http://localhost:3010/api
```

See prom metrics

```bash
curl http://localhost:9464/metrics
```

Run local [jaeger](https://www.jaegertracing.io/docs/1.47/getting-started/) to see traces (we could move these to npm scripts)

- task explorer->run
- task explorer->browser

This will listen for various export formats. We will use [otel http](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http) (on 4318) since exporter-jaeger is being deprecated.

Next steps:

- Build and test docker image: [docker build readme](./docker/README.md)
- Deploy to kubernetes: [Kubernetes deploy readme](./kubernetes/otel-hello/README.md)

## Testing notes

1. Seeing traces/metrics for outbound calls

The `POST /posts` will call out to a remote API (cat facts) if you set the body to an empty string

1. Prometheus HTTP metrics

To enable http instrumentation prometheus metrics comment out `views.push` where we add DropAggregation.

## Nest.js

Generate new REST API

```bash
npx @nestjs/cli@latest generate resource memoryleak
```

Update packages

```bash
npx npm-check-updates -i
```

## Memory leak

Run with insepector

1. Run start:debug
1. Output will have `Debugger listening on ws://127.0.0.1:9229`
1. Launch [chrome://inspect/](chrome://inspect/)

## Release please

### Configuration

This describes config in `release-please-config.json`

#### include-component-in-tag

We disable the component name (e.g., from package.json) which looks like this `refs/tags/<PACKAGENAME>-v1.0.12`

That interferes with the docker meta action when it parses the semver.

```text
Warning: hello-v1.0.12 is not a valid semver
```

#### include-v-in-tag

Set true so tags look like

```text
refs/tags/v1.0.10
```

### Fix conventional commit or changelog

Sometimes you may want to correct/modify release notes.

#### Option 1: Touchup prior to merging release PR

You can edit the release PR description and changelog before approving and merging it.

#### Option 2: Solution for unprotected main branch

This works only if the main branch is unprotected because it requires re-writing commits to the main branch.

See [GitHub--changing a commit message](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/changing-a-commit-message)

Last commit (merged PR with bad message)

```bash
git pull --prune
git log
```

Then edit the last

```bash
git commit --amend
```

Or last N (e.g. 3)

- Use 'pick' and 'reword'

```bash
git rebase -i HEAD~3
```

Then push those commits

```bash
git push --force-with-lease
```

Then trigger build

```bash
git commit --allow-empty -m "Build trigger"
```

Check the release PR and verify it picks up the commits.

### Tags and releases

To see tag information:

```bash
git fetch origin --tags
git ls-remote --tags
git show v1.0.1
```

Use the GH CLI to show relase information in a more pleasing format

```bash
gh release list
gh release view v1.0.0
```

## References

### OpenTelemetry Tracing

- [Instrumentation Docs](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
- [Blog with trace examples](https://uptrace.dev/opentelemetry/js-tracing.html#quickstart)

## Project layout

```text
    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
```
