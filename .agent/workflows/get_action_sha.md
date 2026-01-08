---
description: How to safely retrieve the immutable commit SHA for a specific version of a GitHub Action
---
# Get GitHub Action SHA

When pinning GitHub Actions to a specific SHA (for security and reliability), do NOT rely on web searches or the default `HEAD`. Always verify the SHA against the official tags.

## Steps

1.  **Identify the Action Repository**
    Get the full HTTPS URL of the action repo (e.g., `https://github.com/actions/checkout.git`).

2.  **Determine the Target Version**
    Decide which version tag you want to target (e.g., `v4`, `v4.2.0`).

3.  **Fetch Tags and SHAs**
    Use `git ls-remote` combined with `sort -V` to list tags in semantic order. This ensures you can easily identify the absolutely latest version.

    ```bash
    git ls-remote --tags --refs https://github.com/<owner>/<repo>.git | grep -v "\^{}" | sort -t '/' -k 3 -V | tail -n 5
    ```

    *Example:*
    ```bash
    # To find the latest SHA for actions/checkout v4
    git ls-remote --tags --refs https://github.com/actions/checkout.git | grep "refs/tags/v4" | sort -t '/' -k 3 -V | tail -n 5
    ```

4.  **Select the SHA**
    *   **Always pick the LAST item** in the sorted list (the highest version number).
    *   The output format is `<SHA> <REF>`. Copy the 40-character SHA.
    *   *Note*: The command above uses `--refs` to avoid duplicate entries for dereferenced tags.

5.  **Pin in Workflow**
    Use the format: `uses: owner/repo@<SHA> # <tag>`

    *Example:*
    ```yaml
    uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
    ```
