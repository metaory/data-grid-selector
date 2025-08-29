
const dataGrid = new DataGrid({
  data: Array(31).fill(null).map(() => Array(24).fill(false)),
  rowLabels: Array.from({length: 31}, (_, i) => `Day ${i + 1}`),
  colLabels: Array.from({length: 24}, (_, i) => `${i}h`),
  onChange: (data) => console.log('Data changed:', data)
});
dataGrid.update({
  data: newData,
  rowLabels: newRowLabels, // optional
  colLabels: newColLabels  // optional
});