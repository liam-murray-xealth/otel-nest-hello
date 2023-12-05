# Working on Documentation

This shows how to work on documentation and make it available to Backstage.

You write documentation in extended Markdown (see [code blocks](https://squidfunk.github.io/mkdocs-material/reference/content-tabs/#grouping-code-blocks) for example) which is then compiled into a static web
site.

A standard Markdown editor won't properly render the extended syntax so you normally view the rendered site while editing.

??? info "Non-repository documentation"
This document generally refers to repository documentation (i.e., the root docs folder) that is published to Backstage each time documentation is updated on the main branch.

    You can also use MkDocs for other documentation-as-code sites, e.g., to produce external documentation for external customers.

<!-- markdownlint-disable-next-line MD026 -->

## Quickstart :writing_hand:

### Build and Render documentation

Open a terminal at the root of your repository and use the Techdocs CLI to launch your local documentation site.

```bash
npx @techdocs/cli serve:mkdocs
```

Alternatively you can render the documentation in the Backstage UI with Backstage styling.

```bash
npx @techdocs/cli serve
```

??? question "Which one should I use?"

    Running the Backstage UI shows how your documentation will render in Backstage and may expose incompatibilities, problems with embedding, etc.

    Running `serve:mkdocs` is more responsive because it auto-reloads the web page.

??? tip "See broken links and other warnings"

    Pass the `--verbose` option too see broken link and other warnings.

    ```bash
     npx @techdocs/cli:mkdocs serve --verbose
    ```

??? tip "Setup a repository for documentation"

    If you don't have documentation set up for your repository yet, create it by using another repository as a template.

    At a minimum you should have the following.

    ```text
    ├── docs
    │   ├── index.md
    ├── mkdocs.yml
    ```

    Make sure the Techdocs core plugin is enabled.

    ```yaml title="mkdocs.yml"
    plugins:
      - techdocs-core
    ```

### Edit documentation

Edit using Markdown and [Material for MkDocs extensions](https://squidfunk.github.io/mkdocs-material/reference/).

Documentation will be automatically re-built as you edit files.

## MkDocs

Documentation is based on [mkdocs](https://www.mkdocs.org/), which creates a static web site from documentation you write in [Markdown](https://www.markdownguide.org/). When you run `@techdocs/cli serve` it runs `mkdocs build` for you.

??? note "Example mkdocs usage"

    The following is an example of commands you could run to build and serve your Markdown files via MkDocs.

    ```bash
    pip install mkdocs
    mkdocs new .
    mkdocs serve
    ```

    By default it assumes you have your documentation under `./docs`.

    Next open the site in your browser.

    ```bash
    open http://localhost:8080
    ```

    The following builds your doc site (to `./site` by default) so you can pack it up and serve it from a web server such as Nginx.

    ```bash
    mkdocs build
    ```

    We build using the Techdocs CLI (which calls `mkdocs build` under the hood) in CI/CD, or we let Backstage do it on the fly using the local builder feature.

By itself MkDocs adds a few bells and whistles such as a navigation bar and styling, but otherwise it is just rendering a site that looks like vanilla Markdown.

The power of MkDocs comes into play when you start using [plugins](https://www.mkdocs.org/dev-guide/plugins/) and [Markdown extensions](https://www.mkdocs.org/user-guide/configuration/#markdown_extensions).

These are configured via [`mkdocs.yml` configuration](https://www.mkdocs.org/user-guide/configuration/#introduction).

## Techdocs

[Techdocs](https://backstage.io/docs/features/techdocs/) is a small ecosystem of tools and features provided by Backstage built around MkDocs. The toolset includes:

- a docker container containing MkDocs and dependencies
- a CLI that runs the container
- a MkDocs plugin (part of mkdocs-techdocs-core) to simplifyt MkDocs configuration and provide consistency
- a Backstage frontend and backend plugin that supports building, fetching, rendering and searching documentation within Backstage

### Techdocs CLI

The [Techdocs CLI](https://backstage.io/docs/features/techdocs/cli/) is used instead of `mkdocs serve` because it runs the [techdocs docker container](https://github.com/backstage/techdocs-container) that packages all the required dependencies for you.

### Techdocs core plugin for MkDocs

The container packages the [mkdocs-techdocs-core plugin](https://github.com/backstage/mkdocs-techdocs-core) along with other dependencies. This ensures everyone has the right dependencies for building and rendering documentation. It also helps make sure that your documentation will render properly in Backstage itself.

In `mkdocs.yaml` you will see the plugin added like this:

```yaml title="mkdocs.yml"
plugins:
  - techdocs-core
```

Normally to configure an extension (e.g., Python Markdown extensions) you add quite a bit of configuration as you can see here:

- [PyMDown extensions mkdocs.yaml](https://github.com/facelessuser/pymdown-extensions/blob/main/mkdocs.yml).
- [ArgoCD's mkdocs.yaml](https://github.com/argoproj/argo-cd/blob/master/mkdocs.yml)

The [techdocs core plugin](https://github.com/backstage/mkdocs-techdocs-core/blob/ba8922e4059ed217284edba006be5868f3c48d51/src/core.py) does a lot of this configuration for us (programmatically) so it simplifies `mkdocs.yml`.

??? tip "Extending MkDocs with additional plugins and extensions"

    You may find other MkDocs plugins or extensions that you want to install, use and enable.

    For example, you might want to use the [mkdocs-table-reader-plugin](https://squidfunk.github.io/mkdocs-material/reference/data-tables/#import-table-from-file).

    Normally you would install the package that provides the extension (e.g. `pip install`) and configure it in `mkdocs.yml`. Then you can save the dependency (e.g. in `requirements.txt`) so other people can install the correct requirements.

    When using techdocs this doesn't quite work because the techdocs container is provided to us and doesn't have the dependency.

    There are several options including:

    - Ask Backstage maintainers to add it because it is really cool
    - Build a custom techdocs container and add it

      If you build a custom techdocs container you can then invoke it via the CLI by passing `--docker-image <DOCKER_IMAGE>`.

      This is what [Backstage currently recommends for Mermaid](https://backstage.io/docs/features/techdocs/how-to-guides/#how-to-add-mermaid-support-in-techdocs)

    - Manage the dependency independently (tell people to install it)

??? info "The container is not always used so we still need requirements.txt"

    There are several cases where the techdocs container is not used to invoke `mkdocs build`:

    - In GitHub Actions workflows
    - When Backstage is run as a container

      This is only relevent when Backstage is configured to build documentation (local builder) in the backend however.

      Backstage runs as a container when:

       - deployed to Kubernetes
       - running in docker compose (locally or in CI/CD environment)


    In those cases we install dependencies using the `requirements.txt` located at the root of this repository. If using plugins that require additional binaries (such as PlantUML) we'd also have to install those in these environments.

### Techdocs container dockerfile

The [techdocs dockerfile](https://github.com/backstage/techdocs-container/blob/main/Dockerfile) installs the following dependencies so you don't need to install them directly on your laptop.

- [mkdocs](https://www.mkdocs.org/)
- [mkdocs-material](https://squidfunk.github.io/mkdocs-material/getting-started/)
- [mkdocs-techdocs-core](https://github.com/backstage/mkdocs-techdocs-core)
- Huge [PlantUML](https://plantuml.com/starting) binary

When running `mkdocs` outside a docker container we have to install and manage the dependencies ourselves (via `requirements.txt`, etc.).

??? tip "How to install mkdocs-techdocs-core via Python"

    If you wish to run `mkdocs` directly here is how you do it.

    Currently requirements.txt is used by CI/CD and dockerfile that packages Backstage (since these environments can't run a container inside a container).

    Create a virtual environment and install the pinned versions in `requirements.txt`.

    ```bash
    mkvirtualenv makedocs -p $(which python3)
    pip install safety
    safety check
    pip install -r requirements.txt
    ```

    If you don't have `requirements.txt` yet (or want to update mkdocs-techdocs-core)

    ```bash
    pip install mkdocs-techdocs-core==1.2.3
    pip freeze > requirements.txt
    ```

    You should see the Python package `mkdocs-techdocs-core` along with extensions, plugins and `mkdocs` itself (all installed by `mkdocs-techdocs-core`).

    ```text
    $pip list | grep mkdocs
    mkdocs                             1.5.2
    mkdocs-material                    9.1.3
    mkdocs-material-extensions         1.1.1
    mkdocs-monorepo-plugin             1.0.5
    mkdocs-techdocs-core               1.2.1
    ```

    You can verify the installation by running the following:

    ```bash
    mkdocs serve
    ```

    From time to time we may need to update the version. The following shows the latest versions available.

    ```bash
    pip index versions mkdocs-techdocs-core
    ```

    You normally can install the latest. For more see [Techdocs: Getting Started](https://backstage.io/docs/features/techdocs/getting-started#disabling-docker-in-docker-situation-optional)


    ```bash
    pip install mkdocs-techdocs-core==1.2.3
    pip freeze > requirements.txt
    ```

## Material extensions

This provides the core of the documentation extensions.

See [Material for MkDoc: Getting Started](https://squidfunk.github.io/mkdocs-material/getting-started/). It links to a short video that shows how you would setup and write documentations using Material for MkDocs. It is a good primer.

Next browse through the various [Material for MkDoc: Extensions](https://squidfunk.github.io/mkdocs-material/reference/admonitions/#admonitions).

!!! warning "Your mileage may vary"

    The following features currently are not supported via Techdocs:

    - [Annotations](https://squidfunk.github.io/mkdocs-material/reference/annotations/)
    - [Diagrams with Mermaid](https://squidfunk.github.io/mkdocs-material/reference/diagrams/)

### Admonitions (example)

!!! pied-piper "Pied Piper"

    This is an example of a [custom admonition](https://squidfunk.github.io/mkdocs-material/reference/admonitions/#custom-admonitions). It adds a custom icon.

### Code block (example)

See [code blocks](https://squidfunk.github.io/mkdocs-material/reference/code-blocks/). The following as a title and highlight.

```py hl_lines="2 3" title="Example of N^2"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```

??? abstract "View the Markdown"

    ~~~
    ``` py hl_lines="2 3" title="Example of N^2"
    def bubble_sort(items):
        for i in range(len(items)):
            for j in range(len(items) - 1 - i):
                if items[j] > items[j + 1]:
                    items[j], items[j + 1] = items[j + 1], items[j]

    ```
    ~~~

## Python Markdown extensions

Material includes the [Python markdown extensions](https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown-extensions/).

For full documentation visit [PyMdown Extensions Documentation](https://facelessuser.github.io/pymdown-extensions/).

### Snippet (example)

See:

- [snippets](https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown-extensions/#snippets)
- [snippets full docs](https://facelessuser.github.io/pymdown-extensions/extensions/snippets/#snippets)

This shows a partial file snippet extracted from `mkdocs.yml`

```yaml title="mkdocs.yml"
--8<-- "./mkdocs.yml:mysnip"
```

???abstract "View the Markdown"

    This document contains the following Markdown to include the snippet above.

    ~~~
    ```yaml title="mkdocs.yml"
    ;--8<-- "./mkdocs.yml:mysnip"
    ```
    ~~~

    In `mkdocs.yml` there is a comment-decorated block of code that provides the snippet:

    ```yaml
    # --8<-- [start:mysnip]
    CODE
    # --8<-- [end:mysnip]
    ```

    Note that this is something we had to enable ourselves. It was not automatically enabled in by the techdocs core plugin for MkDocs.

## Additional tips

### Icon search

:boom:{ .heart } Use [Material for Mkdocs: Icons](https://squidfunk.github.io/mkdocs-material/reference/icons-emojis/) to search for icons.

### Material for MkDocs site examples

Additional Material for MkDocs examples and references:

- [Material for MkDocs GitHub soruce](https://github.com/squidfunk/mkdocs-material/tree/master/docs)
- [Open source projects using Material for Mkdocs](https://github.com/squidfunk/mkdocs-material#trusted-by-)

### Monorepos

See the [Backstage monorepo plugin](https://backstage.github.io/mkdocs-monorepo-plugin/) (already included with the Techdocs core package).

### Diagrams and Images

[Diagrams](https://squidfunk.github.io/mkdocs-material/reference/diagrams/) are not supported yet. You can create diagrams in LucidChart, etc. and embed images however.

#### Local Images

Just copy the image to a folder under docs and link to it.

!!! note

    The image needs to be linked relative to this document.

<figure markdown>
  ![Wheelchair Image](../images/patient-male-wheelchair.svg){ style="width: 100px" }
  <figcaption>Get Well Soon</figcaption>
</figure>

??? abstract "View HTML snippet"

    This image above has a [caption](https://squidfunk.github.io/mkdocs-material/reference/images/#image-captions):

    ```HTML title="snippet"
    <figure markdown>
      ![Wheelchair Image](../images/patient-male-wheelchair.svg){ style="width: 100px" }
      <figcaption>Get Well Soon</figcaption>
    </figure>
    ```

    If you don't need the caption just include the link in the middle (without the `<figure>`).

### Embedding

??? question "Why is nothing showing below?"

    See [How to enable iframes](https://backstage.io/docs/features/techdocs/how-to-guides/#how-to-enable-iframes-in-techdocs).

    Some of these may only show when you view locally using `serve:mkdocs`. The Backstage UI will clean iframes not excepted in the config. The CLI doesn't appear to have an option to pass these.

    Anoter possibility is you are not logged in or do not have permissions, etc.

#### Giphy

Find a GIF and copy and paste the HTML snippet directly to your document.

!!! info
This won't show in Backstage if `giphy.com` is not enabled in `app-config.yaml`

<iframe src="https://giphy.com/embed/yYSSBtDgbbRzq" width="480" height="360" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/frustrated-annoyed-programming-yYSSBtDgbbRzq">via GIPHY</a></p>

#### LucidChart

1. Select file->embed

1. Activate embed code

1. Copy and paste the HTML snippet directly to your document

1. Add a width and height, etc.

#### Google Docs

1. Open the document

1. Go to file->share->Publish to web

1. Select embed and publish

1. Copy and paste the HTML snippet directly to your document

## Troubleshooting

### Embed not working

See [How to enable iframes](https://backstage.io/docs/features/techdocs/how-to-guides/#how-to-enable-iframes-in-techdocs).

We currently allow the following:

```yaml title="app-config.yaml"
--8<-- "./app-config.yaml:allowed-iframe"
```

### Markdownlint

Unfortunately some extension syntax is non-conformant with Markdown so Markdownlint may complain. An example of this is [MD046 when using admonitions](https://github.com/DavidAnson/markdownlint/issues/207).

One work-around is to use [configuration rules](https://github.com/DavidAnson/markdownlint#configuration).

### Extension sytax not working

If you see an extension feature that does not seem to work:

Check the configuration done by [techdocs core plugin](https://github.com/backstage/mkdocs-techdocs-core/blob/ba8922e4059ed217284edba006be5868f3c48d51/src/core.py)

Refer to the [techdocs dockerfile](https://github.com/backstage/techdocs-container/blob/main/Dockerfile). Some extensions may require an additional binary (such as PlantUML).

In some cases there are compatibility issues with the way Backstage renders documentation. See [GitHub issue (Material Annotations)](https://github.com/backstage/mkdocs-techdocs-core/issues/128).

In some cases the Backstage UI may require an addon. See:

- [GitHub issue (mermaid)](https://github.com/backstage/mkdocs-techdocs-core/issues/147)
- [GitHub issue (mermaid)](https://github.com/backstage/backstage/issues/4123)

## Techdocs Additional Topics

### The Backstage local builder

When the Backstage backend is not fetching documentation from a remote publishing location (e.g., published to an S3 bucket during CI/CD), it invokes `mkdocs` on the fly in the backend server. This is known as "local builder" mode.

It will run the techdocs docker container or use `mkdocs` directly depending on how we configure [techdocs.generator.runIn](https://backstage.io/docs/features/techdocs/configuration/).

When we run the backend as a docker container we need to set that to `local` to avoid docker in docker.
