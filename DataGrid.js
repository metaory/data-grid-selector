/**
 * DataGrid - Framework Agnostic Web Component
 *
 * A standalone web component for boolean data visualization.
 * Uses CSS variables for styling - override them in your HTML.
 */

// Pure utility functions
const createGrid = (rows, cols) =>
  Array(rows).fill(null).map(() => Array(cols).fill(false));

const createLabels = (count, prefix) =>
  Array.from({length: count}, (_, i) => prefix + i);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = performance.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
};

// Pure state management
const createState = () => ({
  isDragging: false,
  dragStart: null,
  dragEnd: null,
  lastUpdateTime: 0
});

const createConfig = (element) => ({
  rows: parseInt(element.getAttribute('rows')) || 30,
  cols: parseInt(element.getAttribute('cols')) || 24,
  title: element.getAttribute('title') || 'Data Grid'
});

const createData = (rows, cols) => ({
  grid: createGrid(rows, cols),
  rowLabels: createLabels(rows, 'Row'),
  colLabels: createLabels(cols, 'Col')
});

// Pure selection calculations
const getSelectionBounds = (dragStart, dragEnd) => ({
  minRow: Math.min(dragStart.row, dragEnd.row),
  maxRow: Math.max(dragStart.row, dragEnd.row),
  minCol: Math.min(dragStart.col, dragEnd.col),
  maxCol: Math.max(dragStart.col, dragEnd.col)
});

const isInSelection = (row, col, bounds) =>
  row >= bounds.minRow && row <= bounds.maxRow &&
  col >= bounds.minCol && col <= bounds.maxCol;

const isValidCell = (cell, rows, cols) =>
  cell.row >= 0 && cell.col >= 0 && cell.row < rows && cell.col < cols;

// Pure DOM creation functions
const createElement = (tag, className, attributes = {}) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  Object.entries(attributes).forEach(([key, value]) =>
    element.setAttribute(key, value));
  return element;
};

const createCell = (rowIndex, colIndex, isActive) => {
  const cell = createElement('td', 'data-cell', {
    'data-row': rowIndex,
    'data-col': colIndex,
    'role': 'gridcell'
  });
  if (isActive) cell.dataset.active = 'true';
  return cell;
};

const createRow = (rowData, rowIndex, rowLabel) => {
  const tr = createElement('tr');
  const labelCell = createElement('td', 'row-label');
  labelCell.textContent = rowLabel;
  tr.appendChild(labelCell);

  const fragment = document.createDocumentFragment();
  rowData.forEach((cell, colIndex) => {
    const cellElement = createCell(rowIndex, colIndex, cell);
    fragment.appendChild(cellElement);
  });
  tr.appendChild(fragment);
  return tr;
};

const createHeader = (colLabels) => {
  const thead = createElement('thead');
  const headerRow = createElement('tr');

  headerRow.appendChild(createElement('th', 'corner-cell'));

  const fragment = document.createDocumentFragment();
  colLabels.forEach((label, index) => {
    const th = createElement('th', 'col-label');
    th.textContent = label;
    th.setAttribute('data-col', index);
    fragment.appendChild(th);
  });
  headerRow.appendChild(fragment);

  thead.appendChild(headerRow);
  return thead;
};

const createTable = (grid, rowLabels, colLabels) => {
  const table = createElement('table', 'data-table');
  table.appendChild(createHeader(colLabels));

  const tbody = createElement('tbody');
  const fragment = document.createDocumentFragment();
  grid.forEach((row, rowIndex) =>
    fragment.appendChild(createRow(row, rowIndex, rowLabels[rowIndex])));
  tbody.appendChild(fragment);

  table.appendChild(tbody);
  return table;
};

class DataGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Initialize with pure functions
    this.state = createState();
    this.config = createConfig(this);
    this.data = createData(this.config.rows, this.config.cols);

    // Cache for performance
    this._styles = null;
    this._isInitialized = false;
    this._cellsCache = null;
    this._boundsCache = null;

    // Bind methods once
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    // Throttled update function
    this.throttledUpdateSelection = throttle(this.updateSelection.bind(this), 16);
  }

  connectedCallback() {
    requestAnimationFrame(() => this.initialize());
  }

  initialize() {
    if (this._isInitialized) return;

    this.render();
    this.bindEvents();
    this._isInitialized = true;
  }

  render() {
    if (!this._styles) {
      this._styles = this.getStyles();
      this.shadowRoot.innerHTML = `<style>${this._styles}</style>`;
    }

    const grid = createElement('div', 'data-grid', {
      'role': 'grid',
      'tabindex': '0',
      'aria-label': this.config.title
    });

    const table = createTable(this.data.grid, this.data.rowLabels, this.data.colLabels);
    grid.appendChild(table);

    const existingGrid = this.shadowRoot.querySelector('.data-grid');
    if (existingGrid) {
      existingGrid.replaceWith(grid);
    } else {
      this.shadowRoot.appendChild(grid);
    }

    // Clear cache when DOM changes
    this._cellsCache = null;
  }

  getStyles() {
    return /*css*/`
      :host {
        /* CSS Variables with fallbacks */
        --grid-primary: #3b82f6;
        --grid-bg: #ffffff;
        --grid-cell-bg: #f8fafc;
        --grid-text: #1f2937;
        --grid-text-muted: #64748b;
        --grid-header-bg: #f1f5f9;
        --grid-cell-size: 28px;
        --grid-header-width: 80px;
        --grid-hover-bg: #f1f5f9;
        --grid-selection-bg: rgba(59, 130, 246, 0.25);
        --grid-selection-active-bg: rgba(59, 130, 246, 0.7);

        /* Smooth theme transitions */
        transition: all 0.2s ease;
      }

      .data-grid {
        width: 100%;
        height: 100%;
        min-height: 300px;
        user-select: none;
        cursor: crosshair;
        font-family: inherit;
        font-size: 0.875rem;
        outline: none;
        display: flex;
        flex-direction: column;
        background: var(--grid-bg);
        padding: 16px;
        border-radius: 12px;
      }

      .data-table {
        width: max-content;
        place-self: center;
        border-collapse: separate;
        border-spacing: 4px;
        table-layout: auto;
        background: var(--grid-bg);
        min-width: max-content;
      }

      .data-table thead tr,
      .data-table tbody tr {
        display: table-row;
      }

      .data-table th,
      .data-table td {
        border: none;
        padding: 0;
        text-align: center;
        vertical-align: middle;
        position: relative;
        margin: 0;
        background: var(--grid-cell-bg);
        box-sizing: border-box;
        display: table-cell;
      }

      .corner-cell {
        width: var(--grid-header-width);
        height: 30px;
        background: var(--grid-header-bg);
        border: 1px solid orange;
        color: var(--grid-text-muted);
        font-weight: 500;
        font-size: 0.75rem;
        position: sticky;
        top: 0;
        left: 0;
        z-index: 10;
        display: table-cell;
      }

      .col-label {
        height: 30px;
        width: var(--grid-cell-size);
        min-width: var(--grid-cell-size);
        max-width: var(--grid-cell-size);
        padding: 0 4px;
        background: var(--grid-header-bg);
        color: var(--grid-text-muted);
        font-weight: 500;
        font-size: xx-small;
        font-family: monospace;
        border: 1px solid blue;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        position: sticky;
        top: 0;
        z-index: 5;
        display: table-cell;
        transform: rotate(-90deg);
        transform-origin: center;
      }

      .row-label {
        width: var(--grid-header-width);
        height: var(--grid-cell-size);
        background: var(--grid-header-bg);
        color: var(--grid-text-muted);
        font-weight: 500;
        text-align: left;
        padding: 0 4px;
        border: 1px solid purple;
        font-size: 0.75rem;
        box-sizing: border-box;
        position: sticky;
        left: 0;
        z-index: 5;
        display: table-cell;
      }

      .data-cell {
        width: var(--grid-cell-size);
        aspect-ratio: 1;
        min-width: var(--grid-cell-size);
        max-width: var(--grid-cell-size);
        min-height: var(--grid-cell-size);
        transition: background-color 0.15s ease, transform 0.15s ease;
        cursor: pointer;
        border-radius: 8px;
        margin: 0;
        border: 1px solid green;
        background: var(--grid-cell-bg);
        box-sizing: border-box;
        position: relative;
      }

      .data-cell:hover {
        background-color: var(--grid-hover-bg);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transform: scale(1.05);
        z-index: 5;
      }

      .data-cell[data-active="true"] {
        background-color: var(--grid-primary) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .data-cell:not([data-active="true"]) {
        background-color: var(--grid-cell-bg) !important;
      }

      .data-cell[data-selecting="true"] {
        background-color: var(--grid-selection-bg) !important;
        border: 2px solid var(--grid-primary) !important;
        border-radius: 8px;
        z-index: 10;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: scale(1.02);
      }

      .data-cell[data-active="true"][data-selecting="true"] {
        background-color: var(--grid-primary) !important;
        border: 2px solid var(--grid-primary) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        transform: scale(1.02);
      }
    `;
  }

  bindEvents() {
    const grid = this.shadowRoot.querySelector('.data-grid');
    if (!grid) return;

    grid.addEventListener('mousedown', this.handleMouseDown);
    grid.addEventListener('mousemove', this.handleMouseMove);
    grid.addEventListener('mouseup', this.handleMouseUp);
    grid.addEventListener('mouseleave', this.handleMouseUp);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;

    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (!isValidCell(cell, this.config.rows, this.config.cols)) return;

    e.preventDefault();
    this.startDrag(cell);
  }

  handleMouseMove(e) {
    if (!this.state.isDragging) return;

    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (!isValidCell(cell, this.config.rows, this.config.cols)) return;

    e.preventDefault();
    this.updateDrag(cell);
  }

  handleMouseUp(e) {
    if (!this.state.isDragging) return;
    e.preventDefault();
    this.endDrag();
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') this.cancelDrag();
  }

  startDrag(cell) {
    this.state.isDragging = true;
    this.state.dragStart = cell;
    this.state.dragEnd = cell;
    this.throttledUpdateSelection();
  }

  updateDrag(cell) {
    this.state.dragEnd = cell;
    this.throttledUpdateSelection();
  }

  endDrag() {
    if (!this.state.isDragging || !this.state.dragStart || !this.state.dragEnd) {
      this.resetDrag();
      return;
    }

    this.toggleSelection();
    this.dispatchChangeEvent();
    this.resetDrag();
    this.clearSelectionVisuals();
  }

  cancelDrag() {
    this.resetDrag();
    this.clearSelectionVisuals();
  }

  resetDrag() {
    this.state.isDragging = false;
    this.state.dragStart = null;
    this.state.dragEnd = null;
  }

  clearSelectionVisuals() {
    // Use cached cells if available, otherwise query
    const cells = this._cellsCache || this.shadowRoot.querySelectorAll('.data-cell[data-selecting]');
    // Use more efficient iteration
    for (let i = 0; i < cells.length; i++) {
      delete cells[i].dataset.selecting;
    }
  }

  getCellFromPoint(x, y) {
    const grid = this.shadowRoot.querySelector('.data-grid');
    const table = grid.querySelector('table');
    const tableRect = table.getBoundingClientRect();
    const cells = table.querySelectorAll('td.data-cell');

    if (cells.length === 0) return { row: -1, col: -1 };

    const firstCell = cells[0];
    const cellRect = firstCell.getBoundingClientRect();
    const cellWidth = cellRect.width;
    const cellHeight = cellRect.height;
    const relativeX = x - tableRect.left;
    const relativeY = y - tableRect.top;

    // Account for header row and column with proper spacing
    const headerHeight = 30 + 4;
    const headerWidth = 80 + 4;
    const adjustedX = relativeX - headerWidth;
    const adjustedY = relativeY - headerHeight;

    // Account for cell spacing (4px between cells)
    const col = Math.floor(adjustedX / (cellWidth + 4));
    const row = Math.floor(adjustedY / (cellHeight + 4));

    return {
      row: clamp(row, 0, this.config.rows - 1),
      col: clamp(col, 0, this.config.cols - 1)
    };
  }

  toggleSelection() {
    const bounds = getSelectionBounds(this.state.dragStart, this.state.dragEnd);

    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        this.data.grid[r][c] = !this.data.grid[r][c];
      }
    }

    this.updateCellStates();
  }

  updateCellStates() {
    // Cache cells for better performance
    if (!this._cellsCache) {
      this._cellsCache = this.shadowRoot.querySelectorAll('.data-cell');
    }
    const cells = this._cellsCache;

    // Use more efficient iteration and avoid unnecessary DOM queries
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      // Cache parseInt results
      const row = cell.dataset.row | 0; // Faster than parseInt
      const col = cell.dataset.col | 0;
      const isActive = this.data.grid[row][col];

      // Only update if state actually changed - use faster attribute check
      const hasActive = cell.dataset.active === 'true';
      if (isActive !== hasActive) {
        if (isActive) {
          cell.dataset.active = 'true';
        } else {
          delete cell.dataset.active;
        }
      }
    }
  }

  updateSelection() {
    // Cache cells for better performance
    if (!this._cellsCache) {
      this._cellsCache = this.shadowRoot.querySelectorAll('.data-cell');
    }
    const cells = this._cellsCache;

    // Cache bounds calculation
    const boundsKey = `${this.state.dragStart?.row},${this.state.dragStart?.col}-${this.state.dragEnd?.row},${this.state.dragEnd?.col}`;
    if (!this._boundsCache || this._boundsCache.key !== boundsKey) {
      this._boundsCache = {
        key: boundsKey,
        bounds: getSelectionBounds(this.state.dragStart, this.state.dragEnd)
      };
    }
    const bounds = this._boundsCache.bounds;

    // Use more efficient iteration
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const row = cell.dataset.row | 0; // Faster than parseInt
      const col = cell.dataset.col | 0;
      const shouldBeSelecting = isInSelection(row, col, bounds);
      const isCurrentlySelecting = cell.dataset.selecting === 'true';

      if (shouldBeSelecting !== isCurrentlySelecting) {
        if (shouldBeSelecting) {
          cell.dataset.selecting = 'true';
        } else {
          delete cell.dataset.selecting;
        }
      }
    }
  }

  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('dataChange', {
      detail: this.data.grid,
      bubbles: true,
      composed: true
    }));
  }

  // Public API - Pure and functional
  setData(newData) {
    this.data.grid = newData;
    this.updateCellStates();
  }

  getData() {
    return this.data.grid;
  }

  reset() {
    this.data.grid = createGrid(this.config.rows, this.config.cols);
    this.updateCellStates();
  }

  setRowLabels(labels) {
    this.data.rowLabels = labels;
    const rowLabels = this.shadowRoot.querySelectorAll('.row-label');
    // Use more efficient iteration
    for (let i = 0; i < rowLabels.length; i++) {
      if (labels[i]) rowLabels[i].textContent = labels[i];
    }
  }

  setColLabels(labels) {
    this.data.colLabels = labels;
    const colLabels = this.shadowRoot.querySelectorAll('.col-label');
    // Use more efficient iteration
    for (let i = 0; i < colLabels.length; i++) {
      if (labels[i]) colLabels[i].textContent = labels[i];
    }
  }

  updateTheme(themeVars = {}) {
    // Temporarily disable transitions to prevent flash
    this.style.transition = 'none';

    // Apply theme variables to the host element efficiently
    const style = this.style;
    Object.entries(themeVars).forEach(([property, value]) => {
      style.setProperty(property, value);
    });

    // Force a reflow to ensure CSS variables are applied
    this.offsetHeight;

    // Ensure cell states are synchronized after theme change
    this.updateCellStates();

    // Re-enable transitions after a brief delay
    requestAnimationFrame(() => {
      this.style.transition = 'all 0.2s ease';
    });
  }
}

customElements.define('data-grid', DataGrid);

export default DataGrid;
