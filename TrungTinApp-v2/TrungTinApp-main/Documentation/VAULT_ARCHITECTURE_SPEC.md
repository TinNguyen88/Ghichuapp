# VAULT — iOS Security & Dual-Workspace Architecture Specification v1.0

## Overview
Vault is an offline-first, dual-workspace iOS security application engineered for zero-knowledge plausible deniability under extreme physical duress.

## Architectural Pillars

### 1. The 10-Second Emergency Activation Engine
In duress situations, fine motor skills degrade by up to 70%. Vault introduces a multi-modal trigger system designed for 100% reliability within 3 seconds, well inside the 10-second survival window:
- **Hardware-Level Trigger**: Native App Intent integration bound to the iPhone Action Button (iPhone 15 Pro+) or Back Tap (Triple Tap), launching Fake Mode from a locked screen without FaceID biometric prompt.
- **Duress PIN Biometric Trap**: When unlocking Vault from cold launch or lock screen, entering the Duress PIN (e.g., `1111`) instead of the Real PIN (e.g., `8492`) instantly mounts the Fake Workspace and triggers immediate RAM key wiping.
- **In-App Panic Gesture**: A broad, screen-wide 3-finger swipe down or device inversion + accelerometer spike instantly swaps the UI window root and purges sensitive memory.

### 2. Zero-Knowledge Memory & Storage Cryptography
- **Dual-Container Separation**: Two distinct encrypted SQLite blobs (`real.sqlite.enc` and `fake.sqlite.enc`). Neither database contains pointers, metadata, or table names referencing the other.
- **Secure Enclave Key Derivation**: Master encryption keys derived via PBKDF2 / Argon2id using device-specific Secure Enclave hardware entropy combined with the user PIN.
- **Active RAM Zeroing**: Upon panic trigger or app suspension, Swift/C memory buffers holding $K_{real}$ are forcefully overwritten using `memset_s` before deallocation.

### 3. Strict Local & Offline-First Boundary
- Zero network socket permissions or cloud synchronization by default.
- Eliminates cloud sync vulnerabilities, remote account takeovers, and metadata leakage.
