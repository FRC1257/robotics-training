# External-link checker

Run `python3 scripts/check-external-links.py` from the repository root. It inventories Markdown destinations, reference definitions, naked URLs and embedded HTML links/resources in `docs/`, excludes vendored files, flags historical archives and writes `research_sources/link-check.json`. Each URL is requested without its fragment, with a 12-second timeout and at most six concurrent requests. HTTP 404 and 410 are retried once. Each attempt records UTC time, HTTP status and public redirect chain, plus source file and line occurrences. It stores no response body or headers. HTTP 401/403/405/429 and network errors are blocked/unreachable, not classified as broken. A repeated 404 means the requester received it twice: private Google files may return 404 to an unauthenticated requester, and availability can differ by region or account.

Credential-bearing URLs, sensitive query keys, localhost, private IP literals and sensitive redirect destinations are skipped without printing or writing the URL. This heuristic cannot recognize every possible secret in a path or query and does not guarantee that a public DNS name cannot resolve privately; review source links before adding credentials and never include secrets. Fragments are not checked as HTML anchors, and HTTP 200 does not prove content relevance, media access, link rendering, or JavaScript behavior. Bare URLs inside code examples may be inventoried even where they are not clickable. Redirects and results can change over time; review them rather than blindly substituting a working page.

Local parser/security smoke check (no network):

```sh
python3 - <<'PY'
import importlib.util
spec = importlib.util.spec_from_file_location('checklinks', 'scripts/check-external-links.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
assert m.clean('https://example.org/page#part') == 'https://example.org/page'
for u in ('https://example.org/?token=secret', 'https://user:pass@example.org/', 'http://localhost:8000/', 'http://127.0.0.1/'):
    assert m.clean(u) is None
assert list(m.markdown_links('[text](https://example.org/a(b))'))[0][1] == 'https://example.org/a(b)'
print('parser and URL filtering smoke checks passed')
PY
```

The checked-in snapshot dated 2026-11-11 UTC was collected before the verified curriculum replacements in this work; its results document the pre-fix state. Re-run the checker after publishing to measure the current deployed-link state.
