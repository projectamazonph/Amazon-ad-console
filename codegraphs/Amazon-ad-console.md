# Amazon-ad-console - Code Dependency Graph

This project is a single-file, offline HTML training simulator. The app and its
inline script live entirely inside `amazon_ppc_simulator.html`. Supporting files
are documentation and a Node-based QA harness.

```mermaid
graph TD
    APP["amazon_ppc_simulator.html<br/>(inline HTML + CSS + JS)"]
    CHECK["amazon_ppc_simulator_check.js<br/>(extracted script for syntax check)"]
    QA["amazon_ppc_simulator_v3_3_qa.js<br/>(Node VM QA harness)"]
    RESULTS["amazon_ppc_simulator_v3_3_qa_results.json"]
    DOC["amazon_ppc_simulator_v3_3_documentation.md"]
    CHANGELOG["amazon_ppc_simulator_v3_3_changelog.md"]
    REPORT["amazon_ppc_simulator_v3_3_qa_report.md"]
    MANIFEST["amazon_ppc_simulator_v3_3_release_manifest.json"]
    README["README.md"]

    QA -->|reads inline script| APP
    QA -->|writes| RESULTS
    CHECK -.->|mirrors app script| APP
    README --> APP
    README --> DOC
    README --> QA
    DOC --> APP
    CHANGELOG --> APP
    REPORT --> QA
    MANIFEST --> APP
```
