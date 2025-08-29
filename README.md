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
- **Desktop optimized** with sticky headers
- **Basic touch support** for single-tap on mobile

## Demo

🎮 **Live Demo**: [https://metaory.github.io/data-grid-selector](https://metaory.github.io/data-grid-selector)

## Installation

```bash
npm install data-grid-selector
```

## Usage

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import 'data-grid-selector';
  </script>
</head>
<body>
  <data-grid></data-grid>
  
  <script>
    const grid = document.querySelector('data-grid');
    grid.addEventListener('dataChange', (e) => {
      console.log('Data changed:', e.detail);
    });
  </script>
</body>
</html>
```

### With Custom Data

```html
<data-grid></data-grid>

<script>
  const grid = document.querySelector('data-grid');
  
  grid.update({
    data: Array(7).fill(null).map(() => Array(24).fill(false)),
    rowLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    colLabels: Array.from({length: 24}, (_, i) => `${i}:00`)
  });
</script>
```

### JavaScript Constructor

```javascript
import DataGrid from 'data-grid-selector';

const grid = new DataGrid({
  data: Array(31).fill(null).map(() => Array(24).fill(false)),
  rowLabels: Array.from({length: 31}, (_, i) => `Day ${i + 1}`),
  colLabels: Array.from({length: 24}, (_, i) => `${i}h`)
});

// ⚠️ Must append to DOM
document.getElementById('container').appendChild(grid);
```

## API

### Constructor Options

```javascript
const grid = new DataGrid({
  data: boolean[][],           // 2D boolean array (default: 5x5 grid)
  rowLabels: string[],          // Array of row labels
  colLabels: string[],          // Array of column labels
  onChange: function,           // Callback for data changes
  debounceMs: number           // Debounce delay (default: 100ms)
});
```

### Methods

```javascript
// Get current data
const data = grid.getData();

// Update data and labels
grid.update({ data: newData, rowLabels: [...], colLabels: [...] });

// Reset to empty grid
grid.reset();
```

### Events

```javascript
grid.addEventListener('dataChange', (e) => {
  const data = e.detail; // 2D boolean array
  console.log('Grid data changed:', data);
});
```

## CSS Customization

```css
data-grid {
  --grid-primary: #3b82f6;                    /* Active cell color */
  --grid-bg: #ffffff;                         /* Background color */
  --grid-cell-bg: #f8fafc;                    /* Cell background */
  --grid-text: #1f2937;                       /* Text color */
  --grid-cell-size: 28px;                     /* Cell size */
  --grid-header-width: 80px;                  /* Header width */
  --grid-cell-spacing: 4px;                   /* Cell spacing */
  --grid-cell-radius: 8px;                    /* Cell border radius */
}
```

## Examples

### Monthly Schedule

```html
<data-grid></data-grid>

<script>
  const grid = document.querySelector('data-grid');
  
  grid.update({
    data: Array(31).fill(null).map(() => Array(24).fill(false)),
    rowLabels: Array.from({length: 31}, (_, i) => `Day ${i + 1}`),
    colLabels: Array.from({length: 24}, (_, i) => `${i}h`)
  });
  
  grid.addEventListener('dataChange', (e) => {
    const activeHours = e.detail.flat().filter(cell => cell).length;
    console.log(`Active hours: ${activeHours}`);
  });
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
      gridRef.current.update({
        data: data,
        rowLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        colLabels: Array.from({length: 24}, (_, i) => `${i}:00`)
      });
      
      gridRef.current.addEventListener('dataChange', onDataChange);
    }
  }, [data, onDataChange]);
  
  return <data-grid ref={gridRef} />;
}
```

## License

[MIT](LICENSE)
