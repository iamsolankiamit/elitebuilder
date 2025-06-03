Below is a **battle-tested recipe** for evaluating user repos **and** injecting sponsor tests—without letting the contestant control the environment or the results.

---

## 1. High-Level Strategy

1. **Language sniff + policy check** (package.json, pyproject.toml, Dockerfile).
2. **Build an *immutable* container image** for the contestant’s code—but **you** own the final layer that runs the tests.
3. **Mount/overlay the sponsor’s private test harness** *inside* that image (or run it from a sibling container) so user-supplied tests are irrelevant.
4. **Execute the harness**, capture JUnit/JSON, calculate scores.
5. **Post results** back to your API; throw away the image.

Because the harness lives outside the contestant repo and the final test-running layer is yours, fake or doctored tests in the repo never get a say.

---

## 2. Minimal File/Folder Contract

```
challenge-pack/
├─ tests/               # sponsor’s pytest or jest files
├─ eval_config.yaml     # entrypoint, healthcheck, ports, env vars, timeouts
└─ Docker.addon         # optional layer tweaks (curl, ffmpeg, etc.)
```

Contestants just push their repo; your pipeline merges the two at build time.

---

## 3. GitHub Actions Workflow (one job, Docker-in-Docker)

```yaml
name: Evaluate submission
on:
  workflow_dispatch:
    inputs:
      repo_url:        { required: true }
      submission_id:   { required: true }
      challenge_pack:  { required: true }   # presigned ZIP on S3

jobs:
  eval:
    runs-on: ubuntu-latest
    services:
      docker:
        image: docker:dind
        options: --privileged  # needed for nested builds
    steps:
    # --- 1) Pull contestant repo --------------------------
    - name: Checkout contestant code
      run: git clone ${{ github.event.inputs.repo_url }} code

    # --- 2) Download sponsor test pack --------------------
    - name: Download challenge pack
      run: |
        curl -L ${{ github.event.inputs.challenge_pack }} -o pack.zip
        unzip -q pack.zip -d pack

    # --- 3) Detect language / choose base -----------------
    - name: Detect project type
      id: detect
      run: |
        if [[ -f code/package.json ]]; then echo "type=node" >> $GITHUB_OUTPUT
        elif [[ -f code/pyproject.toml || -f code/requirements.txt ]]; then echo "type=python" >> $GITHUB_OUTPUT
        else echo "type=unknown" >> $GITHUB_OUTPUT; fi

    # --- 4) Build unified image ---------------------------
    - name: Build Docker image
      run: |
        if [[ -f code/Dockerfile ]]; then
            # we add a final layer that copies test harness
            cat <<'EOF' > code/Dockerfile.evaladdon
            FROM submission AS tests
            COPY pack/tests /opt/tests
            COPY pack/eval_config.yaml /opt
            CMD ["sh", "-c", "/opt/entrypoint.sh"]
            EOF
            docker build -t submission:latest -f code/Dockerfile.evaladdon code
        else
            # language-based standard Dockerfile
            cp pack/Docker.addon /tmp/base.Dockerfile
            docker build -t submission:latest \
              --build-arg PROJECT_TYPE=${{ steps.detect.outputs.type }} \
              -f /tmp/base.Dockerfile code
        fi

    # --- 5) Run harness inside container ------------------
    - name: Run tests
      run: |
        docker run --rm -v $PWD/results:/results \
          -e TIMEOUT=$(yq '.timeout' pack/eval_config.yaml) \
          submission:latest

    # --- 6) Push score ------------------------------------
    - name: Post results
      env:
        API:  ${{ secrets.SUBMISSION_API }}
        TOKEN: ${{ secrets.SUBMISSION_TOKEN }}
      run: |
        curl -X PATCH "$API/${{ github.event.inputs.submission_id }}" \
             -H "Authorization: Bearer $TOKEN" \
             -F "results=@results/score.json"
```

### What’s going on?

* **Standard build path**
  *`Docker.addon`* is a generic template you maintain:

  ```Dockerfile
  ARG PROJECT_TYPE
  FROM node:20-slim    AS base-node
  FROM python:3.11-slim AS base-python
  FROM ${PROJECT_TYPE == "node" ? "base-node" : "base-python"} AS submission
  COPY . /app
  RUN if [ "$PROJECT_TYPE" = "node" ]; then npm ci; else pip install -r requirements.txt; fi
  ```

* **User-supplied Dockerfile path**
  You treat their Dockerfile as an **intermediate stage** (`FROM submission`).
  Your addon layer copies the harness and overrides `CMD` so you always decide what runs.

* **Test execution**
  The harness’s `entrypoint.sh` typically:

  ```bash
  pytest /opt/tests --junitxml=/results/junit.xml
  python /opt/score.py /results/junit.xml > /results/score.json
  ```

* **Cheat-proofing**
  – Sponsor tests live outside repo.
  – User ENTRYPOINT is replaced.
  – Hidden tests in `/opt/tests/private` aren’t committed anywhere public.
  – You can SHA-256 the user image layer to cache builds but still run fresh tests every time.

---

## 4. Handling Environment Mismatches

| Risk                                           | Mitigation                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Missing system libs (ffmpeg, libpq)            | Let sponsors specify `apt-get` lines in **Docker.addon** or `eval_config.yaml`.                                          |
| Different port / CLI entrypoints               | Sponsor defines `service_url` or `command` in `eval_config.yaml`; your entrypoint does health-poll before running tests. |
| Long builds                                    | Cache `~/.npm` / `~/.cache/pip` in GitHub Actions; warm layer drops from 3 min → 30 s.                                   |
| Dangerous Dockerfile (privileged, bind mounts) | Parse with `dockerfile-ast`; reject `--privileged`, `VOLUME /`, `ADD http://`.                                           |
| Fake tests                                     | Ignore any JUnit the repo ships; run only sponsor harness; optionally delete `/tests` in contestant repo before build.   |

---

## 5. Plug-and-Play Re-use

* **Drop-in for GitLab CI, Buildkite, CircleCI** – Replace the `docker run` lines; the merge-layer pattern stays unchanged.
* **Works locally** – Devs can replicate with:

  ```bash
  ./bin/local_eval.sh --repo /path/to/repo --pack challenge-pack.zip
  ```
* **Self-hosted runners** – Swap `runs-on: ubuntu-latest` for `runs-on: self-hosted` when you need gVisor/Firecracker.

---

## 6. Next Tickets (copy/paste into Linear/Jira)

1. **`detect_project_type.ts`** – heuristics for Node, Python, Go, Rust.
2. **`dockerfile_linter.py`** – reject privileged instructions.
3. **`entrypoint-gen`** – template renderer that turns `eval_config.yaml` into `entrypoint.sh`.
4. **Secret scanning step** (truffleHog) prior to docker build.
5. **Artifact uploader** – push `/results/*.json` and `/results/log.txt` to S3 for judge download.

---
