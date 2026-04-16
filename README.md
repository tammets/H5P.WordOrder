# H5P Word Order

An H5P content type where students arrange words into the correct order by drag and drop.

## Features

- **Simple text input** for authors: enter words separated by spaces, use `*asterisks*` to group multi-word blocks (e.g. `elas metsas *kes oli must* ja inetu`)
- **Drag-and-drop** reordering with touch/mobile support
- **Fisher-Yates shuffle** that guarantees a different starting order
- **Check Answer**, **Retry**, and **Show Solution** buttons (configurable)
- **Per-word feedback** showing correct/incorrect positions
- **xAPI scoring** with `getScore()` and `getMaxScore()`
- **State persistence** via `getCurrentState()` — students can resume where they left off
- **Translatable UI strings** via l10n group in semantics

## Installation

1. Download the `.h5p` file from [Releases](../../releases)
2. Upload it to your H5P-enabled platform (Moodle, WordPress, Drupal, etc.)
3. Create a new activity and select "Word Order"

## Usage

### For authors

Enter words in the correct order, separated by spaces:

```
The cat sat on the mat
```

To make multiple words into one draggable block, wrap them with asterisks:

```
elas metsas *kes oli must* ja inetu
```

This creates 5 draggable parts: `elas`, `metsas`, `kes oli must`, `ja`, `inetu`.

### For students

1. Words appear in random order
2. Drag words to rearrange them
3. Click "Check Answer" to see which are correct
4. Use "Retry" to try again or "Show Solution" to see the answer

## Dependencies

- H5P Core API >= 1.19
- jQuery.ui 1.10 (bundled with H5P, provides sortable + touch support)

## License

[MIT License](LICENSE)

## Credits

Priit Tammets
