/**
 * DataGrid - Framework Agnostic Web Component
 * 
 * A standalone web component for boolean data visualization.
 * Uses CSS variables for styling - override them in your HTML.
 */

class DataGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.state = {
      isDragging: false,
      dragStart: null,
      dragEnd: null,
      lastUpdateTime: 0
    };
    
    this.config = {
      rows: parseInt(this.getAttribute('rows')) || 30,
      cols: parseInt(this.getAttribute('cols')) || 24,
      title: this.getAttribute('title') || 'Data Grid'
    };
    
    this.data = {
      grid: Array(this.config.rows).fill(null).map(() => 
        Array(this.config.cols).fill(false)
      ),
      rowLabels: Array(this.config.rows).fill(null).map((_, i) => `Row ${i + 1}`),
      colLabels: Array(this.config.cols).fill(null).map((_, i) => `Col ${i + 1}`)
    };
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="data-grid" role="grid" tabindex="0" aria-label="${this.config.title}">
        <table class="data-table">
          <thead>
            <tr>
              <th class="corner-cell"></th>
              ${this.data.colLabels.map(label => `<th class="col-label">${label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${this.data.grid.map((row, rowIndex) => `
              <tr>
                <td class="row-label">${this.data.rowLabels[rowIndex]}</td>
                ${row.map((cell, colIndex) => `
                  <td 
                    class="data-cell"
                    data-active="${cell}"
                    data-row="${rowIndex}"
                    data-col="${colIndex}"
                    role="gridcell">
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    // Re-bind events after render
    this.bindEvents();
  }

  getStyles() {
    return `
      .data-grid {
        width: 100%;
        height: 100%;
        min-height: 300px;
        user-select: none;
        cursor: crosshair;
        background: var(--grid-bg);
        font-family: inherit;
        font-size: 0.875rem;
        outline: none;
        display: flex;
        flex-direction: column;
      }

      .data-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 4px;
        table-layout: fixed;
        background: var(--grid-bg);
        min-width: max-content;
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
      }

      .corner-cell {
        width: var(--grid-header-width);
        height: 30px;
        background: var(--grid-header-bg);
        border: none;
        color: var(--grid-text-muted);
        font-weight: 500;
        font-size: 0.75rem;
        position: sticky;
        top: 0;
        left: 0;
        z-index: 10;
      }

      .col-label {
        height: 30px;
        width: var(--grid-cell-size);
        min-width: var(--grid-cell-size);
        padding: 0 4px;
        background: var(--grid-header-bg);
        color: var(--grid-text-muted);
        font-weight: 500;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: 0.75rem;
        border: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        position: sticky;
        top: 0;
        z-index: 5;
      }

      .row-label {
        width: var(--grid-header-width);
        height: var(--grid-cell-size);
        background: var(--grid-header-bg);
        color: var(--grid-text-muted);
        font-weight: 500;
        text-align: left;
        padding: 0 4px;
        border: none;
        font-size: 0.75rem;
        box-sizing: border-box;
        position: sticky;
        left: 0;
        z-index: 5;
      }

      .data-cell {
        width: var(--grid-cell-size);
        height: var(--grid-cell-size);
        min-width: var(--grid-cell-size);
        min-height: var(--grid-cell-size);
        transition: all 0.15s ease;
        cursor: pointer;
        border-radius: 8px;
        margin: 0;
        border: none;
        background: var(--grid-cell-bg);
        box-sizing: border-box;
        position: relative;
      }

      .data-cell:hover {
        background-color: var(--grid-hover-bg, #f3f4f6);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transform: scale(1.05);
        z-index: 5;
      }

      .data-cell[data-active="true"] {
        background-color: var(--grid-primary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .data-cell[data-selecting="true"] {
        background-color: rgba(59, 130, 246, 0.2) !important;
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
    
    grid.addEventListener('mousedown', this.handleMouseDown.bind(this));
    grid.addEventListener('mousemove', this.handleMouseMove.bind(this));
    grid.addEventListener('mouseup', this.handleMouseUp.bind(this));
    grid.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;
    
    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (!this.isValidCell(cell)) return;
    
    e.preventDefault();
    this.startDrag(cell);
  }

  handleMouseMove(e) {
    if (!this.state.isDragging) return;
    
    const cell = this.getCellFromPoint(e.clientX, e.clientY);
    if (!this.isValidCell(cell)) return;
    
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
    this.updateSelection();
  }

  updateDrag(cell) {
    this.state.dragEnd = cell;
    this.updateSelection();
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
    const cells = this.shadowRoot.querySelectorAll('.data-cell');
    cells.forEach(cell => {
      cell.removeAttribute('data-selecting');
    });
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
    const headerHeight = 30 + 4; // header height + spacing
    const headerWidth = 80 + 4; // header width + spacing
    
    const adjustedX = relativeX - headerWidth;
    const adjustedY = relativeY - headerHeight;
    
    // Account for cell spacing (4px between cells)
    const col = Math.floor(adjustedX / (cellWidth + 4));
    const row = Math.floor(adjustedY / (cellHeight + 4));
    
    return {
      row: Math.max(0, Math.min(this.config.rows - 1, row)),
      col: Math.max(0, Math.min(this.config.cols - 1, col))
    };
  }

  isValidCell(cell) {
    return cell.row >= 0 && cell.col >= 0 && 
           cell.row < this.config.rows && cell.col < this.config.cols;
  }

  toggleSelection() {
    const bounds = this.getSelectionBounds();
    
    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        this.data.grid[r][c] = !this.data.grid[r][c];
      }
    }
    
    // Update visual state immediately
    this.updateCellStates();
  }

  updateCellStates() {
    const cells = this.shadowRoot.querySelectorAll('.data-cell');
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const isActive = this.data.grid[row][col];
      cell.setAttribute('data-active', isActive);
    });
  }

  updateSelection() {
    // Throttle updates for better performance (max 60fps)
    const now = performance.now();
    if (now - this.state.lastUpdateTime < 16) return; // ~60fps
    this.state.lastUpdateTime = now;
    
    const cells = this.shadowRoot.querySelectorAll('.data-cell');
    const bounds = this.getSelectionBounds();
    
    cells.forEach(cell => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const shouldBeSelecting = this.isInSelection(row, col);
      const isCurrentlySelecting = cell.hasAttribute('data-selecting');
      
      if (shouldBeSelecting !== isCurrentlySelecting) {
        if (shouldBeSelecting) {
          cell.setAttribute('data-selecting', 'true');
        } else {
          cell.removeAttribute('data-selecting');
        }
      }
    });
  }

  isInSelection(row, col) {
    if (!this.state.isDragging || !this.state.dragStart || !this.state.dragEnd) return false;
    
    const bounds = this.getSelectionBounds();
    return row >= bounds.minRow && row <= bounds.maxRow && 
           col >= bounds.minCol && col <= bounds.maxCol;
  }

  getSelectionBounds() {
    const { dragStart, dragEnd } = this.state;
    
    return {
      minRow: Math.min(dragStart.row, dragEnd.row),
      maxRow: Math.max(dragStart.row, dragEnd.row),
      minCol: Math.min(dragStart.col, dragEnd.col),
      maxCol: Math.max(dragStart.col, dragEnd.col)
    };
  }

  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('dataChange', {
      detail: this.data.grid,
      bubbles: true,
      composed: true
    }));
  }

  // Public API
  setData(newData) {
    this.data.grid = newData;
    this.render();
  }

  getData() {
    return this.data.grid;
  }

  reset() {
    this.data.grid = Array(this.config.rows).fill(null).map(() => 
      Array(this.config.cols).fill(false)
    );
    this.render();
  }

  setRowLabels(labels) {
    this.data.rowLabels = labels;
    this.render();
  }

  setColLabels(labels) {
    this.data.colLabels = labels;
    this.render();
  }

  // Theme update method
  updateTheme() {
    this.render();
  }
}

customElements.define('data-grid', DataGrid);

export default DataGrid;