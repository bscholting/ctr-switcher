# Changelog

All notable changes to this project will be documented in this file.

---

## [v0.1.0] - 2025-05-04

### Added
- Google OAuth login with support for YouTube Data API
- Dashboard displaying user's YouTube videos (title, thumbnail, publish date)
- A/B test setup page with input for two alternate video titles
- Title update functionality using YouTube API (`youtube.force-ssl` scope)
- Local test session storage using `localStorage`
- Automatic title switching after 4 hours using `setTimeout`
- Persistent test status display (running, completed)

### Notes
- Title switching only occurs while the app is open; will auto-switch on page load if 4 hours have passed
- No backend yet; all state is local
- MVP milestone complete and tagged as `v0.1.0`
