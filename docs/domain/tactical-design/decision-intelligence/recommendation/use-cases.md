# Recommendation Use Cases

| Use case | Purpose |
| --- | --- |
| `GetRecommendationAnalysisContextQuery` | Return the Recommendation facts and Route context required by AI analysis. |

The gRPC adapter maps this query result to the published `RecommendationAnalysis`
service contract. Recommendation mutation use cases are not exposed until they
are implemented and wired.
