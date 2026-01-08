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
    Use `git ls-remote` to list tags and filter for your version. This ensures you see the actual commit hash the tag points to.

    ```bash
    git ls-remote --tags https://github.com/<owner>/<repo>.git | grep <version>
    ```

    *Example:*
    ```bash
    # To find the SHA for actions/checkout v4
    git ls-remote --tags https://github.com/actions/checkout.git | grep "refs/tags/v4"
    ```

4.  **Select the SHA**
    *   Look for the specific tag you want (e.g., `refs/tags/v4.2.0`).
    *   Copy the full 40-character SHA hash.
    *   **Verify**: If there are multiple entries (e.g., one for the lightweight tag and one for the dereferenced object `^{}`), pick the commit SHA. Usually, the first one is sufficient, but ensure it looks like a commit hash.

5.  **Pin in Workflow**
    Use the format: `uses: owner/repo@<SHA> # <tag>`

    *Example:*
    ```yaml
    uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
    ```
