<div align="center">
  <h1>DataGrid Selector</h1>
  <strong>
    A lightweight, framework-agnostic web component
  </strong>
  <br>
  for interactive boolean data visualization
  <br>
  Click and drag to toggle cells on/off with smooth selection feedback
  <br>
  <img valign="middle" src="https://raw.githubusercontent.com/metaory/data-grid-selector/refs/heads/master/.github/assets/gifcast.gif" alt="datagrid" width="80%" />
</div>

---

## Features

- **Click and drag selection** for bulk operations
- **Customizable themes** with CSS variables
- **Framework agnostic** - works in any project
- **No dependencies** - pure vanilla JavaScript
- **Accessible** with proper ARIA attributes
- **Responsive design** with sticky headers
- **Custom scrollbars** for better UX

## Demo

🎮 **Live Demo**: [https://metaory.github.io/data-grid-selector](https://metaory.github.io/data-grid-selector)

Try the interactive demo with different themes and see the component in action!

## Installation

```bash
npm install data-grid-selector
```

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import 'data-grid-selector';
  </script>
  <style>
    /* Customize with CSS variables */
    data-grid {
      --grid-primary: #3b82f6;
      --grid-bg: #ffffff;
      --grid-border: #e2e8f0;
      --grid-text: #1f2937;
      --grid-text-muted: #64748b;
      --grid-header-bg: #f1f5f9;
      --grid-cell-size: 30px;
      --grid-header-width: 80px;
    }
  </style>
</head>
<body>
  <data-grid 
    rows="7" 
    cols="24" 
    title="Weekly Schedule">
  </data-grid>
  
  <script>
    const grid = document.querySelector('data-grid');
    grid.addEventListener('dataChange', (e) => {
      console.log('Data changed:', e.detail);
    });
  </script>
</body>
</html>
```

### With Custom Labels

```html
<data-grid rows="31" cols="24" title="Monthly Schedule"></data-grid>

<script>
  const grid = document.querySelector('data-grid');
  
  // Set custom row labels (days)
  const dayLabels = Array.from({length: 31}, (_, i) => `Day ${i + 1}`);
  grid.setRowLabels(dayLabels);
  
  // Set custom column labels (hours)
  const hourLabels = Array.from({length: 24}, (_, i) => `${i}h`);
  grid.setColLabels(hourLabels);
</script>
```

## API

### Attributes

- `rows` - Number of rows (default: 30)
- `cols` - Number of columns (default: 24)
- `title` - Accessibility title (default: "Data Grid")

### Methods

```javascript
// Set grid data
grid.setData(booleanArray);

// Get current data
const data = grid.getData();

// Reset to empty grid
grid.reset();

// Set custom row labels
grid.setRowLabels(['Row 1', 'Row 2', ...]);

// Set custom column labels
grid.setColLabels(['Col 1', 'Col 2', ...]);

// Update theme (re-renders with new CSS variables)
grid.updateTheme();
```

### Events

```javascript
grid.addEventListener('dataChange', (e) => {
  const data = e.detail; // 2D boolean array
  console.log('Grid data changed:', data);
});
```

## CSS Custom Properties

Customize the appearance using CSS variables:

```css
data-grid {
  --grid-primary: #3b82f6;                    /* Active cell color */
  --grid-bg: #ffffff;                         /* Background color */
  --grid-border: #e2e8f0;                     /* Border color */
  --grid-text: #1f2937;                       /* Text color */
  --grid-text-muted: #64748b;                 /* Muted text color */
  --grid-header-bg: #f1f5f9;                  /* Header background */
  --grid-cell-size: 30px;                     /* Cell size */
  --grid-header-width: 80px;                  /* Header width */
  --grid-hover-bg: #f1f5f9;                   /* Hover background */
  --grid-selection-bg: rgba(59, 130, 246, 0.25); /* Selection background */
  --grid-selection-active-bg: rgba(59, 130, 246, 0.7); /* Active selection */
}
```

## Examples

### Monthly Schedule Grid

```html
<data-grid rows="31" cols="24" title="Monthly Schedule"></data-grid>

<script>
  const grid = document.querySelector('data-grid');
  
  // Day labels
  const dayLabels = Array.from({length: 31}, (_, i) => `Day ${i + 1}`);
  grid.setRowLabels(dayLabels);
  
  // Hour labels
  const hourLabels = Array.from({length: 24}, (_, i) => `${i}h`);
  grid.setColLabels(hourLabels);
  
  // Listen for changes
  grid.addEventListener('dataChange', (e) => {
    const activeHours = e.detail.flat().filter(cell => cell).length;
    console.log(`Active hours: ${activeHours}`);
  });
</script>
```

### Attendance Tracker

```html
<data-grid rows="7" cols="24" title="Weekly Attendance"></data-grid>

<script>
  const grid = document.querySelector('data-grid');
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  grid.setRowLabels(dayLabels);
  
  const hourLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
  grid.setColLabels(hourLabels);
</script>
```

## Browser Support

- Modern browsers with Web Components support
- Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+

## License

[MIT](LICENSE)
