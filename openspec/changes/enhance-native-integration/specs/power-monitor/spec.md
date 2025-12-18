# Spec: Power Monitor

## ADDED Requirements

### Requirement: The app MUST detect power source changes.
The application MUST monitor the system power source and broadcast events when switching between AC and battery power.
#### Scenario: Switch to battery
  - **Given** the computer is connected to AC power.
  - **When** the power cable is disconnected (switch to battery).
  - **Then** the app receives a `power:status-changed` event with state `on-battery`.
  - **And** the app pauses high-energy tasks (e.g., animations, heavy background sync).

### Requirement: The app MUST respect system sleep.
The application MUST handle system suspend and resume events to ensure data integrity and pause network activity.
#### Scenario: System sleep
  - **Given** the app is running.
  - **When** the system is about to suspend.
  - **Then** the app pauses all network activity and saves state immediately.
  - **When** the system resumes.
  - **Then** the app resumes normal activity.
