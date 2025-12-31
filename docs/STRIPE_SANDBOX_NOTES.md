# Stripe Sandbox Notes

- Stripe sandboxes use separate API keys and isolated objects.
- Always use the platform sandbox secret key (`sk_test_...`) consistently in the app and CLI.
- Connected accounts are created and retrieved using the platform key.
- You cannot connect a platform sandbox to connected-account sandboxes.
- If you switch sandboxes, previously created connected accounts will not be visible.
