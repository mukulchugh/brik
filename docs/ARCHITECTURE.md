## Pipeline

```mermaid
graph TD
  A[JSX/TSX] --> B[Babel Parser]
  B --> C[IR]
  C --> D[SwiftUI Target]
  C --> E[Compose Target]
  D --> F[iOS Sources]
  E --> G[Android Sources]
```






