# Optimization Trigger Policy

`OptimizationTriggerPolicy` decides whether current Route input requires a new
Optimization. The Route implementation triggers when no previous input exists
or when the Route input version changed.

It compares already-loaded values, has no Infrastructure dependencies, and does
not queue or persist an Optimization.
