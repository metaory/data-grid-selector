<div align="center">
  <h1>
    <img valign="middle" src=".github/assets/logo.png" alt="logo" height="48" />
    DataGrid Selector
  </h1>
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
- **Functional API** with property getters/setters
- **No wrapper needed** - use directly in any framework

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

### Functional API

```html
<data-grid rows="31" cols="24" title="Monthly Schedule"></data-grid>

<script>
  const grid = document.querySelector('data-grid');
  
  // Set data and labels
  grid.setData(Array(31).fill(null).map(() => Array(24).fill(false)));
  grid.setRowLabels(Array.from({length: 31}, (_, i) => `Day ${i + 1}`));
  grid.setColLabels(Array.from({length: 24}, (_, i) => `${i}h`));
  
  grid.addEventListener('dataChange', (e) => {
    console.log('Data changed:', e.detail);
  });
</script>
```

### Framework Integration (Svelte Example)

```svelte
<script>
  import 'data-grid-selector';
  
  let gridElement;
  let gridData = Array(7).fill(null).map(() => Array(24).fill(false));
  
  $effect(() => {
    if (gridElement) {
      gridElement.setData(gridData);
      gridElement.setRowLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      gridElement.setColLabels(Array.from({length: 24}, (_, i) => `${i}:00`));
      
      gridElement.addEventListener('dataChange', (e) => {
        gridData = e.detail;
      });
    }
  });
</script>

<data-grid bind:this={gridElement} rows={7} cols={24}></data-grid>
```

## API

### Attributes

- `rows` - Number of rows (default: 30)
- `cols` - Number of columns (default: 24)
- `title` - Accessibility title (default: "Data Grid")

### Methods

```javascript
// Get/set grid data
grid.setData(booleanArray);
const data = grid.getData();

// Get/set row labels
grid.setRowLabels(['Row 1', 'Row 2', ...]);

// Get/set column labels
grid.setColLabels(['Col 1', 'Col 2', ...]);

// Reset to empty grid
grid.reset();
```

### Theme Updates

```javascript
// Update theme with CSS variables
grid.updateTheme({
  '--grid-primary': '#3b82f6',
  '--grid-bg': '#ffffff',
  '--grid-cell-bg': '#f8fafc'
});
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
  
  grid.setData(Array(31).fill(null).map(() => Array(24).fill(false)));
  grid.setRowLabels(Array.from({length: 31}, (_, i) => `Day ${i + 1}`));
  grid.setColLabels(Array.from({length: 24}, (_, i) => `${i}h`));
  
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
  
  grid.setData(Array(7).fill(null).map(() => Array(24).fill(false)));
  grid.setRowLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  grid.setColLabels(Array.from({length: 24}, (_, i) => `${i}:00`));
</script>
```

### React Integration

```jsx
import 'data-grid-selector';
import { useEffect, useRef } from 'react';

function AttendanceGrid({ data, onDataChange }) {
  const gridRef = useRef();
  
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.setData(data);
      gridRef.current.setRowLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
      gridRef.current.setColLabels(Array.from({length: 24}, (_, i) => `${i}:00`));
      
      gridRef.current.addEventListener('dataChange', onDataChange);
    }
  }, [data, onDataChange]);
  
  return <data-grid ref={gridRef} rows={5} cols={24} />;
}
```

### Theme Switching

```javascript
// Apply different themes
const themes = {
  dark: {
    '--grid-primary': '#3b82f6',
    '--grid-bg': '#1e293b',
    '--grid-cell-bg': '#2d3748',
    '--grid-text': '#f1f5f9'
  },
  light: {
    '--grid-primary': '#2563eb',
    '--grid-bg': '#ffffff',
    '--grid-cell-bg': '#f1f5f9',
    '--grid-text': '#1f2937'
  }
};

const applyTheme = (theme) => {
  const grid = document.querySelector('data-grid');
  Object.entries(themes[theme]).forEach(([property, value]) => {
    grid.style.setProperty(property, value);
  });
  grid.updateTheme();
};

// Usage
applyTheme('dark');
```

## Browser Support

- Modern browsers with Web Components support
- Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+

## License

[MIT](LICENSE)
