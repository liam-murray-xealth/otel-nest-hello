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

## Nest.js

Generate new REST API

```bash
npx @nestjs/cli@latest generate resource memoryleak
```

## Memory leak

Run with insepector

1. Run start:debug
1. Output will have `Debugger listening on ws://127.0.0.1:9229`
1. Launch [chrome://inspect/](chrome://inspect/)

## Release please

### Fix conventional commit

Sometimes you may want to correct/modify conventional commit messages.

- They show up in release notes so you may want to improve the message
- You may want to change feat vs fix to influence the next proposed version
- You forgot to merge a PR with a conventional commit message (so release-please ignores it)

Ensuring the PR title conforms to conventional-commit syntax is the best line of defense (see the GHA workflows).

#### Solution for unprotected main branch

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

Delete a release;

```bash
gh release delete v1.0.7
git push --delete origin v1.0.7
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
