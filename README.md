# Algorithm Animator

A web-based tool to visualize common sorting and searching algorithms in action.

## Features

- **Sorting Algorithms:** Bubble Sort, Selection Sort, Insertion Sort, Quick Sort (with more coming soon).
- **Searching Algorithms:** Linear Search, Binary Search.
- **Interactive Controls:** Adjust array size, animation speed, and manually pause/resume the process.
- **Audio Feedback:** Sound effects for comparisons, swaps, and completion.
- **Real-time Stats:** Track comparisons, swaps, and steps as they happen.

## Project Structure

The project has been organized into a clean, modular directory structure:

- `/css`: Contains consolidated `styles.css` for all pages.
- `/js`: Modular JavaScript logic.
  - `core.js`: Shared state, audio context, and UI utilities.
  - `sorting.js`: Sorting algorithm implementations.
  - `searching.js`: Searching algorithm implementations.
- `/pages`: Algorithm-specific visualization pages.
  - `/sorting`: Pages for Bubble, Quick, Merge, etc.
  - `/searching`: Pages for Binary, Linear, etc.
- `index.html`: The main landing page.
- `sorting.html` & `searching.html`: Category hub pages.

## How to Run

Simply open `index.html` in any modern web browser. No local server or build step is required.

## License

MIT
