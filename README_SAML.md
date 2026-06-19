# SAML scaffold for costofliving-site

This scaffold adds a minimal SAML Service Provider (SP) using Express and passport-saml. It includes placeholder configuration which you must set via environment variables before running.

Files added:
- server.js - Express server with SAML routes (/login, /auth/saml/callback, /metadata, /logout, /profile)
- package.json - dependencies and scripts
- README_SAML.md - setup and testing instructions
- .gitignore - Node ignores
- public/ (symlink to root static files not provided; server serves repo root by default)

Security: Do NOT commit your IdP certificate or session secret. Use environment variables.
