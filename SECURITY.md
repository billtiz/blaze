# Security policy

## Reporting a vulnerability

Please do not publish exploitable vulnerabilities, tokens, database URIs or private logs in public issues. Contact the repository maintainer privately through the contact method configured on the project repository.

## Secret handling

- Keep `.env` out of version control.
- Use deployment secret managers for production credentials.
- Rotate any token or password that has been exposed.
- Avoid logging full connection strings or authorization headers.
- Grant the Discord bot only the permissions and intents it actually needs.
