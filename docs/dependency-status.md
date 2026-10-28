# Dependency baseline

The owner approved Next.js 16 instead of the original brief's Next.js 14 requirement. The scaffold uses Next.js and eslint-config-next 16.4.3, React 19.3.1, and ESLint 10.13.0. The lockfile records installed versions.

The proposed Next.js 14 baseline reported five affected packages in the registry audit, including a critical Next.js entry. The framework and lint configuration were upgraded before finalizing the setup commit. The final installation audit reports zero known vulnerabilities across 443 audited packages.

No remote deployment is configured. Development and preview commands bind to loopback. Audit results describe known dependency metadata rather than a guarantee that the complete application is secure.

Recheck with `npm audit` when changing dependencies. Avoid `npm audit fix --force` without reviewing the framework and lint configuration changes.
