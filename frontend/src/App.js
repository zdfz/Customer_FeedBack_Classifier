import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { FaFileAlt, FaUpload, FaDownload, FaCog, FaChevronDown, FaChevronUp, FaSpinner } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

const COLORS = {
  primaryMain: '#1f6a4a',
  primaryHover: '#2e9e6e',
  primarySurface: '#184c36',
  primaryBorder: '#295c47',
  primaryFocus: '#184c36',
  secondaryMain: '#ff9d18',
  secondaryHover: '#e58400',
  secondarySurface: '#2a3c33',
  secondaryFocus: '#3a2a1a',
  neutral: '#103525',
  white: '#fff',
  text: '#f2f6f4',
  textSecondary: '#ffd8a3',
  border: '#295c47',
};

// CollapsiblePanel component
function CollapsiblePanel({ title, children, defaultOpen = false, borderColor = '#d7e4de', focusColor = '#2e9e6e', headerColor = '#1f6a4a', bgColor = '#103525', ariaLabel }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = React.useId();
  return (
    <section
      aria-label={ariaLabel}
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        marginBottom: 18,
        background: bgColor,
        boxShadow: open ? '0 2px 8px 0 rgba(0,0,0,0.08)' : undefined,
        transition: 'box-shadow 0.2s',
      }}
    >
      <button
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: '#e4ede9',
          color: headerColor,
          border: 'none',
          borderRadius: '8px 8px 0 0',
          fontWeight: 900,
          fontSize: 18,
          padding: '12px 18px',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: 'none',
        }}
        tabIndex={0}
        onFocus={e => (e.target.style.outline = `2px solid ${focusColor}`)}
        onBlur={e => (e.target.style.outline = 'none')}
      >
        <span style={{ flex: 1, color: 'rgb(31, 106, 74)' }}>{title}</span>
        <span style={{ fontSize: 18, color: 'rgb(31, 106, 74)', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>
      {open && (
        <div id={panelId} style={{ padding: 18, borderTop: `2px solid ${borderColor}` }}>{children}</div>
      )}
    </section>
  );
}

// PredictedCategoriesTable component
function PredictedCategoriesTable({ data }) {
  const [sortKey, setSortKey] = React.useState('count');
  const [sortDir, setSortDir] = React.useState('desc');
  const sorted = React.useMemo(() => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      if (sortKey === 'count') {
        return sortDir === 'asc' ? a.count - b.count : b.count - a.count;
      } else {
        return sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
    return sortedData;
  }, [data, sortKey, sortDir]);
  return (
    <div style={{ borderRadius: 10, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)', border: `2px solid ${COLORS.primaryBorder}`, overflow: 'hidden', marginTop: 8 }}>
      <table
        aria-label="Predicted Categories Table"
        style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: 'monospace', fontSize: 15, background: COLORS.primarySurface }}
      >
        <thead>
          <tr>
            <th
              style={{ padding: '10px 14px', background: COLORS.primaryMain, color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'sans-serif', borderBottom: `2px solid ${COLORS.primaryBorder}`, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1, cursor: 'pointer', outline: 'none' }}
              tabIndex={0}
              onClick={() => setSortKey(k => (k === 'name' ? (sortDir === 'asc' ? setSortDir('desc') : setSortDir('asc'), 'name') : (setSortDir('asc'), 'name')))}
              onFocus={e => (e.target.style.outline = `2px solid ${COLORS.primaryHover}`)}
              onBlur={e => (e.target.style.outline = 'none')}
            >
              Category {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ padding: '10px 14px', background: COLORS.primaryMain, color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'sans-serif', borderBottom: `2px solid ${COLORS.primaryBorder}`, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1, cursor: 'pointer', outline: 'none' }}
              tabIndex={0}
              onClick={() => setSortKey(k => (k === 'count' ? (sortDir === 'asc' ? setSortDir('desc') : setSortDir('asc'), 'count') : (setSortDir('desc'), 'count')))}
              onFocus={e => (e.target.style.outline = `2px solid ${COLORS.primaryHover}`)}
              onBlur={e => (e.target.style.outline = 'none')}
            >
              Count {sortKey === 'count' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((cat, i) => (
            <tr key={cat.name} style={{ background: i % 2 === 0 ? COLORS.primarySurface : COLORS.primaryMain, color: '#fff' }}>
              <td style={{ padding: '10px 14px', borderBottom: `1px solid ${COLORS.primaryBorder}`, fontWeight: 700, textAlign: 'left', fontFamily: 'monospace' }}>{cat.name}</td>
              <td style={{ padding: '10px 14px', borderBottom: `1px solid ${COLORS.primaryBorder}`, fontWeight: 900, textAlign: 'left', fontFamily: 'monospace' }}>{cat.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Add NPSPanel component
function NPSPanel({ data, columns }) {
  // Find NPS column index
  const npsCol = columns.find(col => /nps/i.test(col));
  if (!npsCol) return null;
  const idx = columns.indexOf(npsCol);
  // Clean NPS rows independently: Only keep rows where NPS is an integer between 0 and 10 (inclusive), and not null/empty
  const npsRows = data.filter(row => {
    const val = row[idx];
    if (val === undefined || val === null || String(val).trim() === '') return false;
    const num = Number(val);
    return Number.isInteger(num) && num >= 0 && num <= 10;
  });
  const npsVals = npsRows.map(row => Number(row[idx]));
  const total = npsVals.length;
  // Count for each score 0-10
  const scoreCounts = Array(11).fill(0);
  npsVals.forEach(v => { if (v >= 0 && v <= 10) scoreCounts[v]++; });
  // Count categories
  const detractors = npsVals.filter(v => v >= 0 && v <= 6).length;
  const passives = npsVals.filter(v => v === 7 || v === 8).length;
  const promoters = npsVals.filter(v => v === 9 || v === 10).length;
  // Percentages
  const pct = x => total ? ((x / total) * 100).toFixed(2) : '0.00';
  const npsScore = total ? ( ((promoters / total) * 100) - ((detractors / total) * 100) ).toFixed(2) : '0.00';

  // Face SVGs for each score (0-10)
  const faceSvgs = [
    { color: '#ff5e7b', face: '😡', label: 'Detractor' }, // 0
    { color: '#ff5e7b', face: '😠', label: 'Detractor' }, // 1
    { color: '#ff5e7b', face: '😞', label: 'Detractor' }, // 2
    { color: '#ff5e7b', face: '😕', label: 'Detractor' }, // 3
    { color: '#ff5e7b', face: '😟', label: 'Detractor' }, // 4
    { color: '#ff5e7b', face: '🙁', label: 'Detractor' }, // 5
    { color: '#ff5e7b', face: '☹️', label: 'Detractor' }, // 6
    { color: '#ffe066', face: '😐', label: 'Passive' }, // 7
    { color: '#ffe066', face: '🙂', label: 'Passive' }, // 8
    { color: '#43b581', face: '😊', label: 'Promoter' }, // 9
    { color: '#43b581', face: '😁', label: 'Promoter' }, // 10
  ];

  // Bar segment colors (gradient for depth)
  const barColors = [
    ...Array(7).fill('linear-gradient(90deg, #ff5e7b 60%, #ff7b9c 100%)'), // Detractors
    ...Array(2).fill('linear-gradient(90deg, #ffe066 60%, #fff3a3 100%)'), // Passives
    ...Array(2).fill('linear-gradient(90deg, #43b581 60%, #6be6a8 100%)'), // Promoters
  ];

  // Accessibility: focus style
  const focusOutline = '2px solid #ffe066';

  return (
    <CollapsiblePanel
      title="Net Promoter Score"
      defaultOpen={false}
      borderColor="#184c36"
      focusColor="#ffe066"
      headerColor="#ffe066"
      bgColor="#184c36"
      ariaLabel="Net Promoter Score"
    >
      <div
        style={{
          width: '100%',
          color: '#ffe066',
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* NPS Score */}
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: '#ffe066',
          textShadow: '0 0 16px #ffe06688',
          marginBottom: 10,
          letterSpacing: 1,
        }}>{npsScore}</div>
        <div style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 30, letterSpacing: 0.5 }}>Net Promoter Score</div>
        {/* Category totals with emojis in colored circles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 30 }}>
          {/* Detractors */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ background: '#ff5e7b', color: '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 2px 8px #ff5e7b44' }} aria-label="Detractors" title="Detractors">😡</span>
            <span style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{detractors}</span>
            <span style={{ fontSize: 13, color: '#ffb3c6', fontWeight: 700 }}>{pct(detractors)}%</span>
          </div>
          {/* Passives */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ background: '#ffe066', color: '#222', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 2px 8px #ffe06644' }} aria-label="Passives" title="Passives">😐</span>
            <span style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{passives}</span>
            <span style={{ fontSize: 13, color: '#fff3a3', fontWeight: 700 }}>{pct(passives)}%</span>
          </div>
          {/* Promoters */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ background: '#43b581', color: '#fff', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 2px 8px #43b58144' }} aria-label="Promoters" title="Promoters">😁</span>
            <span style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{promoters}</span>
            <span style={{ fontSize: 13, color: '#b6f5d2', fontWeight: 700 }}>{pct(promoters)}%</span>
          </div>
        </div>
        {/* Ratings breakdown with faces */}
        <div style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto 18px auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 0,
          flexWrap: 'nowrap',
          overflowX: 'auto',
        }}>
          {scoreCounts.map((count, score) => (
            <div key={score} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: 60 }}>
              <span style={{ fontSize: 44, color: faceSvgs[score].color, lineHeight: 1 }}>{faceSvgs[score].face}</span>
              <span style={{ fontSize: 22, color: '#fff', fontWeight: 900, marginTop: 6, marginBottom: 2 }}>{count}</span>
              <span style={{
                display: 'inline-block',
                marginTop: 2,
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                background: '#232a36',
                borderRadius: 12,
                padding: '2px 14px',
                minWidth: 28,
                textAlign: 'center',
                marginBottom: 2,
                letterSpacing: 1,
              }}>{score}</span>
            </div>
          ))}
        </div>
        {/* Detractors, Passives, Promoters segmented bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0,
          margin: '0 auto 18px auto',
          width: '100%',
          maxWidth: '1100px',
          height: 32,
          borderRadius: 16,
          overflow: 'hidden',
          background: '#232a36',
          boxShadow: '0 1px 8px #0002',
        }}>
          {scoreCounts.map((count, score) => (
            <div
              key={score}
              style={{
                flex: 1,
                height: '100%',
                background: barColors[score],
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              tabIndex={0}
              aria-label={faceSvgs[score].label + ' ' + score}
              title={faceSvgs[score].label + ' ' + score}
              onFocus={e => (e.target.style.outline = focusOutline)}
              onBlur={e => (e.target.style.outline = 'none')}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scaleY(1.18)';
                e.currentTarget.style.boxShadow = `0 2px 12px ${faceSvgs[score].color}77`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 15, color: '#ffe066', marginTop: 8, fontWeight: 700, letterSpacing: 0.2 }}>NPS = %Promoters - %Detractors</div>
        <div style={{ color: '#b6b6b6', fontSize: 14, marginTop: 4 }}>Total responses: {total}</div>
      </div>
    </CollapsiblePanel>
  );
}

// DonutChartsPanel component
function DonutChartsPanel({ data, columns }) {
  // Flexible matching: map logical names to actual columns
  const logicalColumns = [
    'CSAT_Overal',
    'CSAT_Overall',
    'Speed of Delivery',
    'Shipment Condition',
    'Courier Behavior',
  ];
  // Helper to normalize column names
  const normalize = s => s.toLowerCase().replace(/[_\s]+/g, '');
  // Map logical names to actual columns in the uploaded file
  const colMap = {};
  logicalColumns.forEach(logical => {
    const norm = normalize(logical);
    const found = columns.find(c => normalize(c) === norm);
    if (found) colMap[logical] = found;
  });
  const accent = '#ffe066';
  const bgCard = 'rgba(24, 40, 34, 0.98)';
  const bgGradient = 'linear-gradient(135deg, #1a2822 60%, #184c36 100%)';
  const fontFamily = 'Poppins, Inter, Segoe UI, Arial, sans-serif';
  const colors = {
    unsatisfied: '#ff5e7b',
    normal: '#ffe066',
    satisfied: '#43b581',
  };
  const legend = [
    { name: 'Unsatisfied', color: colors.unsatisfied },
    { name: 'Normal', color: colors.normal },
    { name: 'Satisfied', color: colors.satisfied },
  ];
  const getDonutData = (col) => {
    const actualCol = colMap[col];
    if (!actualCol) return null;
    const idx = columns.indexOf(actualCol);
    if (idx < 0) return null;
    // Clean: only rows where value is integer 1-5
    const vals = data
      .map(row => Number(row[idx]))
      .filter(v => Number.isInteger(v) && v >= 1 && v <= 5);
    const total = vals.length;
    const unsatisfied = vals.filter(v => v === 1 || v === 2).length;
    const normal = vals.filter(v => v === 3).length;
    const satisfied = vals.filter(v => v === 4 || v === 5).length;
    return [
      { name: 'Unsatisfied', value: unsatisfied, color: colors.unsatisfied },
      { name: 'Normal', value: normal, color: colors.normal },
      { name: 'Satisfied', value: satisfied, color: colors.satisfied },
      { total },
    ];
  };
  // Custom tooltip for donut chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div style={{ background: '#184c36', borderRadius: 16, padding: '14px 22px', fontSize: 20, boxShadow: '0 2px 16px #0008', fontFamily, minWidth: 180 }}>
          <div style={{ fontWeight: 900, color: entry.color, fontSize: 22, marginBottom: 2 }}>{entry.name}</div>
          <div style={{ fontWeight: 900, color: entry.color, fontSize: 24 }}>
            {entry.value} <span style={{ fontWeight: 700, color: entry.color }}>({entry.percent}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <CollapsiblePanel
      title="Donut Charts"
      defaultOpen={false}
      borderColor="#184c36"
      focusColor={accent}
      headerColor={accent}
      bgColor="#184c36"
      ariaLabel="Donut Charts"
    >
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 0 12px 0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily,
        position: 'relative',
      }}>
        {logicalColumns.map(col => {
          const donutData = getDonutData(col);
          if (!donutData) return null;
          const [unsatisfied, normal, satisfied, meta] = donutData;
          // Add percent and icon to each entry for tooltip
          const total = meta.total;
          const chartData = [unsatisfied, normal, satisfied].map((e, i) => ({ ...e, percent: total ? ((e.value/total)*100).toFixed(1) : 0 }));
          // Center score as highlight
          const score = total ? ((satisfied.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={col} style={{
              width: 370,
              minWidth: 300,
              textAlign: 'center',
              color: accent,
              fontFamily,
              background: bgCard,
              borderRadius: 18,
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
              padding: '32px 18px 22px 18px',
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              transition: 'box-shadow 0.18s',
            }}>
              <div style={{ fontWeight: 900, fontSize: 24, marginBottom: 10, color: accent, letterSpacing: 0.5, fontFamily }}>
                {col.replace(/_/g, ' ')}
              </div>
              <div style={{ fontWeight: 900, fontSize: 38, color: colors.satisfied, textShadow: '0 0 16px #43b58155', marginBottom: 6, fontFamily }}>
                {score}%
              </div>
              <div style={{ fontSize: 15, color: '#b6b6b6', marginBottom: 18, fontWeight: 600, fontFamily }}>Satisfied</div>
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    labelLine={false}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        style={{
                          filter: 'drop-shadow(0 0 6px ' + entry.color + '33)',
                          transition: 'filter 0.18s, transform 0.18s',
                          cursor: 'pointer',
                        }}
                        onMouseOver={e => {
                          e.target.style.filter = 'drop-shadow(0 0 16px ' + entry.color + '99)';
                          e.target.style.transform = 'scale(1.06)';
                        }}
                        onMouseOut={e => {
                          e.target.style.filter = 'drop-shadow(0 0 6px ' + entry.color + '33)';
                          e.target.style.transform = 'none';
                        }}
                        tabIndex={0}
                        aria-label={entry.name + ' segment'}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 22, marginBottom: 8, fontFamily }}>
                {legend.map(l => (
                  <span key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 16, color: l.color }}>
                    <span style={{ width: 15, height: 15, borderRadius: '50%', background: l.color, display: 'inline-block', boxShadow: `0 1px 4px ${l.color}55`, marginRight: 3 }}></span>
                    <span>{l.name}</span>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 17, fontWeight: 700, width: '100%', fontFamily }}>
                <span style={{ color: colors.unsatisfied, display: 'flex', alignItems: 'center', gap: 3 }}> {unsatisfied.value} <span style={{ fontSize: 14, fontWeight: 500, color: colors.unsatisfied }}>({total ? ((unsatisfied.value/total)*100).toFixed(1) : 0}%)</span></span>
                <span style={{ color: colors.normal, display: 'flex', alignItems: 'center', gap: 3 }}> {normal.value} <span style={{ fontSize: 14, fontWeight: 500, color: colors.normal }}>({total ? ((normal.value/total)*100).toFixed(1) : 0}%)</span></span>
                <span style={{ color: colors.satisfied, display: 'flex', alignItems: 'center', gap: 3 }}> {satisfied.value} <span style={{ fontSize: 14, fontWeight: 500, color: colors.satisfied }}>({total ? ((satisfied.value/total)*100).toFixed(1) : 0}%)</span></span>
              </div>
              <div style={{ color: '#b6b6b6', fontSize: 15, marginTop: 12, fontWeight: 600, fontFamily }}>Total: {meta.total}</div>
            </div>
          );
        })}
      </div>
    </CollapsiblePanel>
  );
}

function App() {
  // State
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [classifiedRows, setClassifiedRows] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'text', direction: 'asc' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showColumnSelect, setShowColumnSelect] = useState(false);
  const [filter, setFilter] = useState({ start: '', end: '' });
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [rawExcelData, setRawExcelData] = useState([]);
  const fileInputRef = useRef();

  // Drag-and-drop
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    handleFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    multiple: false,
  });

  // File handling
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };
  const triggerFileInput = () => fileInputRef.current.click();
  const handleFile = (file) => {
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setRawExcelData(data.slice(1)); // Store all rows, even empty/invalid
      // Remove completely empty rows for main app logic
      const cleanedData = data.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''));
      setExcelColumns(data[0]);
      setExcelData(cleanedData);
      setSelectedColumn('');
      setClassifiedRows([]);
      setCategorySummary([]);
      setSortConfig({ key: 'text', direction: 'asc' });
    };
    reader.readAsBinaryString(file);
  };

  // Dropdown
  const handleSelectColumn = (e) => {
    setSelectedColumn(e.target.value);
  };

  // Sort Table
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Batch Classify
  const handleBatchClassify = async () => {
    if (!selectedColumn) return;
    setLoading(true);
    setError(null);
    setClassifiedRows([]);
    setCategorySummary([]);
    try {
      const colIdx = excelColumns.indexOf(selectedColumn);
      // Only keep rows where the selected column is not empty
      const filteredRows = excelData.filter(row => row[colIdx] !== undefined && row[colIdx] !== null && String(row[colIdx]).trim() !== '');
      const feedbacks = filteredRows.map(row => row[colIdx]);
      const results = [];
      for (let i = 0; i < feedbacks.length; i++) {
        const text = feedbacks[i];
        if (!text) {
          results.push({ text: '', categories: [], confidence: 0 });
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        const response = await axios.post('https://feedback-classifier-backend.onrender.com/predict', { text });  // using backend
        // Simulate confidence: if no categories, use max probability as confidence (for demo, randomize)
        let confidence = 0;
        if (response.data.categories.length === 0) {
          confidence = Math.floor(Math.random() * 40) + 40; // 40-80% for demo
        } else {
          confidence = Math.floor(Math.random() * 20) + 80; // 80-100% for demo
        }
        results.push({ text, categories: response.data.categories, confidence });
      }
      setClassifiedRows(results);
      // Build category summary
      const catCount = {};
      results.forEach(r => {
        r.categories.forEach(cat => {
          catCount[cat] = (catCount[cat] || 0) + 1;
        });
      });
      setCategorySummary(Object.entries(catCount).map(([name, count]) => ({ name, count })));

      // Clean specific columns after classifying
      const columnsToClean = [
        'NPS',
        'CSAT_Overal',
        'Speed of Delivery',
        'Shipment Condition',
        'Courier Behavior'
      ];
      // Find the indexes of these columns
      const colIndexes = columnsToClean.map(col => excelColumns.indexOf(col));
      // Remove rows where all these columns are empty or whitespace
      const cleanedRows = filteredRows.filter(row =>
        colIndexes.some(idx => idx >= 0 && row[idx] !== undefined && row[idx] !== null && String(row[idx]).trim() !== '')
      );
      // Optionally, update excelData with cleanedRows if you want to reflect this in the UI
      setExcelData(cleanedRows);
    } catch (err) {
      setError('Error classifying feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  // Download Results
  const handleDownload = () => {
    const headers = ['Feedback', 'Predicted Categories', 'Confidence'];
    // Only filter out rows with empty feedback (if needed)
    const rows = classifiedRows
      .filter(r => r.text && String(r.text).trim() !== '')
      .map(r => [r.text, r.categories ? r.categories.join(', ') : '', r.confidence]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',') + '\n';
    });
    // Add UTF-8 BOM for Excel Arabic compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classification_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Settings Panel
  const handleToggleSettings = () => setSettingsOpen((v) => !v);
  const handleReset = () => {
    setExcelData([]);
    setExcelColumns([]);
    setSelectedColumn('');
    setExcelFileName('');
    setClassifiedRows([]);
    setCategorySummary([]);
    setSortConfig({ key: 'text', direction: 'asc' });
    setSelectedCategory(null);
    setShowColumnSelect(false);
  };

  // Table Sorting
  const sortedRows = React.useMemo(() => {
    if (!classifiedRows.length) return [];
    const rows = selectedCategory
      ? classifiedRows.filter(r => r.categories.includes(selectedCategory))
      : classifiedRows;
    return [...rows].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'confidence') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [classifiedRows, sortConfig, selectedCategory]);

  // Category click (chart)
  const handleCategoryClick = (category) => setSelectedCategory(category);
  const handleClearCategoryFilter = () => setSelectedCategory(null);

  // Accessibility: focus style
  const focusStyle = {
    outline: `2px solid ${COLORS.primaryHover}`,
    outlineOffset: 2,
  };

  // Continue after preview
  const handleContinueAfterPreview = () => setShowColumnSelect(true);

  // Helper: get date column and unique dates from data
  const getDateColumn = () => {
    if (!excelColumns.length) return null;
    // Try to find a column with 'date' in the name
    const dateCol = excelColumns.find(col => col.toLowerCase().includes('date'));
    return dateCol || null;
  };
  const getUniqueDates = () => {
    const dateCol = getDateColumn();
    if (!dateCol) return [];
    const idx = excelColumns.indexOf(dateCol);
    const dates = excelData.map(row => row[idx]).filter(Boolean);
    return Array.from(new Set(dates)).sort();
  };

  // Helper: get NPS and 1-5 columns
  const getNPSColumn = () => excelColumns.find(col => /nps/i.test(col));
  const get15Columns = () => excelColumns.filter(col => {
    if (/nps/i.test(col)) return false;
    // Heuristic: columns with only 1-5 values
    const idx = excelColumns.indexOf(col);
    const vals = excelData.map(row => row[idx]).filter(v => v !== undefined && v !== null && v !== '');
    return vals.every(v => [1,2,3,4,5].includes(Number(v)));
  });

  // Helper: filter data by date range
  const filterDataByDate = () => {
    const dateCol = getDateColumn();
    if (!dateCol || !filter.start || !filter.end) return excelData;
    const idx = excelColumns.indexOf(dateCol);
    return excelData.filter(row => {
      const d = row[idx];
      return d >= filter.start && d <= filter.end;
    });
  };

  // Helper: clean rows for a specific column (removes rows where that column is empty)
  const cleanRowsForColumn = (data, columns, columnName) => {
    const idx = columns.indexOf(columnName);
    if (idx < 0) return [];
    return data.filter(row => row[idx] !== undefined && row[idx] !== null && String(row[idx]).trim() !== '');
  };

  // Helper: calculate averages
  const calcAverages = (data) => {
    const npsCol = getNPSColumn();
    const npsIdx = npsCol ? excelColumns.indexOf(npsCol) : -1;
    // Clean NPS rows
    const npsData = npsCol ? cleanRowsForColumn(data, excelColumns, npsCol) : [];
    const npsVals = npsIdx >= 0 ? npsData.map(row => Number(row[npsIdx])).filter(v => !isNaN(v)) : [];
    const npsAvg = npsVals.length ? (npsVals.reduce((a,b) => a+b, 0) / npsVals.length).toFixed(2) : 'N/A';
    const cols15 = get15Columns();
    const avgs = cols15.map(col => {
      const idx = excelColumns.indexOf(col);
      // Clean rows for this column
      const colData = cleanRowsForColumn(data, excelColumns, col);
      const vals = colData.map(row => Number(row[idx])).filter(v => !isNaN(v));
      const avg = vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2) : 'N/A';
      return { col, avg };
    });
    return { npsAvg, avgs };
  };

  // Helper: distribution for NPS and 1-5 columns
  const calcDistribution = (data) => {
    const npsCol = getNPSColumn();
    const npsIdx = npsCol ? excelColumns.indexOf(npsCol) : -1;
    // Clean NPS rows
    const npsData = npsCol ? cleanRowsForColumn(data, excelColumns, npsCol) : [];
    const npsVals = npsIdx >= 0 ? npsData.map(row => Number(row[npsIdx])).filter(v => !isNaN(v)) : [];
    const npsDist = [
      { name: '0-5', count: npsVals.filter(v => v >= 0 && v <= 5).length },
      { name: '6-10', count: npsVals.filter(v => v >= 6 && v <= 10).length },
    ];
    const cols15 = get15Columns();
    const dists = cols15.map(col => {
      const idx = excelColumns.indexOf(col);
      // Clean rows for this column
      const colData = cleanRowsForColumn(data, excelColumns, col);
      const vals = colData.map(row => Number(row[idx])).filter(v => !isNaN(v));
      return [
        { name: `${col} 1-2`, count: vals.filter(v => v >= 1 && v <= 2).length },
        { name: `${col} 3-4`, count: vals.filter(v => v >= 3 && v <= 4).length },
        { name: `${col} 5`, count: vals.filter(v => v === 5).length },
      ];
    });
    return { npsDist, dists };
  };

  // Helper: correlation (NPS vs. 1-5 columns)
  const calcCorrelations = (data) => {
    const npsCol = getNPSColumn();
    const npsIdx = npsCol ? excelColumns.indexOf(npsCol) : -1;
    if (npsIdx < 0) return [];
    // Clean NPS rows
    const npsData = npsCol ? cleanRowsForColumn(data, excelColumns, npsCol) : [];
    const npsVals = npsData.map(row => Number(row[npsIdx])).filter(v => !isNaN(v));
    const cols15 = get15Columns();
    return cols15.map(col => {
      const idx = excelColumns.indexOf(col);
      // Clean rows for this column
      const colData = cleanRowsForColumn(data, excelColumns, col);
      const vals = colData.map(row => Number(row[idx])).filter(v => !isNaN(v));
      if (npsVals.length !== vals.length || npsVals.length === 0) return { col, corr: 'N/A' };
      // Pearson correlation
      const meanX = npsVals.reduce((a,b) => a+b,0)/npsVals.length;
      const meanY = vals.reduce((a,b) => a+b,0)/vals.length;
      const num = npsVals.reduce((sum, x, i) => sum + (x-meanX)*(vals[i]-meanY), 0);
      const denX = Math.sqrt(npsVals.reduce((sum, x) => sum + Math.pow(x-meanX,2), 0));
      const denY = Math.sqrt(vals.reduce((sum, y) => sum + Math.pow(y-meanY,2), 0));
      const corr = denX && denY ? (num/(denX*denY)).toFixed(2) : 'N/A';
      return { col, corr };
    });
  };

  // Download Analysis (Excel)
  const handleDownloadAnalysis = () => {
    // Combine classifiedRows and analysis summary into one sheet
    const headers = excelColumns.concat(['Predicted Categories', 'Confidence']);
    const rows = classifiedRows.map(r => excelColumns.map((col, i) => r.text && col === selectedColumn ? r.text : (r[col] || ''))
      .concat([r.categories ? r.categories.join(', ') : '', r.confidence || '']));
    // Add analysis summary rows
    let summaryRows = [];
    const filtered = filterDataByDate();
    const { npsAvg, avgs } = calcAverages(filtered);
    summaryRows.push(['', '', '', 'Analysis Summary']);
    summaryRows.push(['NPS Average', npsAvg]);
    avgs.forEach(a => summaryRows.push([a.col + ' Average', a.avg]));
    // Correlations
    const corrs = calcCorrelations(filtered);
    summaryRows.push(['', '', '', 'Correlations']);
    corrs.forEach(c => summaryRows.push([c.col + ' vs NPS', c.corr]));
    // Predicted Categories Analysis
    summaryRows.push(['', '', '', 'Predicted Categories Analysis']);
    categorySummary.forEach(cat => summaryRows.push([cat.name, cat.count]));
    // Export
    const XLSX = require('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, ...summaryRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analysis');
    XLSX.writeFile(wb, 'analysis_results.xlsx');
  };

  // Render
  return (
    <div style={{ minHeight: '100vh', background: COLORS.neutral, fontFamily: 'monospace', color: '#222' }}>
      {/* Header */}
      <div style={{ background: COLORS.primarySurface, padding: '32px 0 18px 0', textAlign: 'center', borderBottom: `1px solid ${COLORS.primaryBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 38, marginRight: 14, borderRadius: 8, background: '#fff', padding: 2 }} />
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 32, letterSpacing: 1, margin: 0 }}>Customer Feedback Classifier</h1>
        </div>
      </div>
      {/* Main Layout */}
      <div style={{ display: 'flex', maxWidth: 1400, margin: '36px auto', gap: 32 }}>
        {/* Sidebar */}
        <aside style={{ width: 340, background: COLORS.primarySurface, borderRadius: 16, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', border: `2px solid ${COLORS.primaryBorder}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 32, minHeight: 600, color: COLORS.text, fontFamily: 'sans-serif' }}>
          {/* Upload Section */}
          <div>
            <div {...getRootProps()} tabIndex={0} style={{
              border: `2px dashed ${COLORS.primaryBorder}`,
              background: COLORS.primarySurface,
              borderRadius: 10,
              padding: 32,
              textAlign: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 17,
              cursor: 'pointer',
              marginBottom: 18,
              transition: 'border 0.2s',
              ...(isDragActive ? { border: `2px solid ${COLORS.primaryMain}` } : {}),
            }}>
              <input {...getInputProps()} />
              <FaUpload style={{ fontSize: 28, marginBottom: 8 }} />
              <div>{isDragActive ? 'Drop Excel file here...' : 'Drop Excel file here or click to select'}</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {excelFileName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.primaryMain, color: '#fff', borderRadius: 6, padding: '10px 18px', fontWeight: 600, fontSize: 16, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)', marginTop: 12 }}>
                <FaFileAlt style={{ fontSize: 20, color: COLORS.secondaryMain }} aria-label="Excel file icon" />
                <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{excelFileName}</span>
              </div>
            )}
          </div>
          {/* Column Dropdown */}
          {excelColumns.length > 0 && showColumnSelect && (
          <div style={{ marginTop: 8 }}>
              <label htmlFor="column-select" style={{ fontWeight: 600, fontSize: 16, color: '#fff', marginBottom: 6, display: 'block' }}>Select feedback column:</label>
              <select
                id="column-select"
                value={selectedColumn}
                onChange={handleSelectColumn}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1.5px solid ${COLORS.primaryBorder}`,
                  background: COLORS.primaryMain,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 8,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="" disabled>Select feedback column</option>
                {excelColumns.map((col, idx) => (
                  <option key={col + idx} value={col}>{col}</option>
                ))}
              </select>
              {selectedColumn && excelData.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchClassify}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    padding: '10px 0',
                    fontSize: 17,
                    background: COLORS.primaryMain,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                  disabled={loading}
                  className="classify-btn"
                >
                  {loading ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <FaSpinner className="spin" style={{ color: COLORS.secondaryMain, fontSize: 20, animation: 'spin 1s linear infinite' }} />
                      Classifying...
                    </span>
                  ) : 'Classify All'}
                </button>
              )}
            </div>
          )}
          {/* Settings Panel */}
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={handleToggleSettings}
              style={{
                width: '100%',
                background: COLORS.primaryBorder,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 16,
                padding: '10px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 0,
              }}
              className="settings-btn"
              aria-expanded={settingsOpen}
            >
              <FaCog /> Settings {settingsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {settingsOpen && (
              <div style={{ background: COLORS.primaryBorder, borderRadius: 6, marginTop: 8, padding: 16 }}>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    background: COLORS.secondaryMain,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 16,
                    padding: '10px 0',
                    cursor: 'pointer',
                    marginBottom: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  Reset Classifications
                </button>
              </div>
            )}
          </div>
        </aside>
        {/* Main Panel */}
        <main style={{ flex: 1, minWidth: 0, color: COLORS.text, fontFamily: 'sans-serif' }}>
          {/* Results Table */}
          {classifiedRows.length > 0 && (
            <section
              aria-label="Classification Results Panel"
              style={{
                background: '#e4ede9',
                borderRadius: 16,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                border: '2px solid #d7e4de',
                overflow: 'hidden',
                marginBottom: 32,
                marginTop: 0,
                padding: 0,
              }}
            >
              {/* Header Bar */}
              <header style={{ background: '#e4ede9', padding: '18px 32px', borderBottom: '2px solid #d7e4de', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: COLORS.primaryMain, fontWeight: 900, fontSize: 24, letterSpacing: 1 }}>Classification Results</span>
                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    background: COLORS.primaryMain,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 16,
                    padding: '8px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.2s',
                  }}
                  className="download-btn"
                >
                  <FaDownload /> Download Results
                </button>
              </header>
              {/* Table Container */}
              <div style={{ maxHeight: 350, overflow: 'auto', background: 'rgb(24, 76, 54)', borderRadius: 0, padding: 28 }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, fontFamily: 'monospace', borderRadius: 10, overflow: 'hidden', background: 'rgb(24, 76, 54)' }}>
                  <thead>
                    <tr>
                      <th
                        style={{ padding: 8, background: COLORS.primaryMain, color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'sans-serif', borderBottom: `2px solid ${COLORS.primaryBorder}`, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1, cursor: 'pointer' }}
                        onClick={() => handleSort('text')}
                        tabIndex={0}
                      >
                        Feedback {sortConfig.key === 'text' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th
                        style={{ padding: 8, background: COLORS.primaryMain, color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'sans-serif', borderBottom: `2px solid ${COLORS.primaryBorder}`, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1, cursor: 'pointer' }}
                        onClick={() => handleSort('categories')}
                        tabIndex={0}
                      >
                        Predicted Categories {sortConfig.key === 'categories' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th
                        style={{ padding: 8, background: COLORS.primaryMain, color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'sans-serif', borderBottom: `2px solid ${COLORS.primaryBorder}`, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1, cursor: 'pointer' }}
                        onClick={() => handleSort('confidence')}
                        tabIndex={0}
                      >
                        Confidence {sortConfig.key === 'confidence' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? COLORS.primarySurface : COLORS.primaryMain }}>
                        <td style={{ padding: 8, color: '#fff', borderBottom: `1px solid ${COLORS.primaryBorder}`, textAlign: 'left', fontFamily: 'monospace' }}>{row.text}</td>
                        <td style={{ padding: 8, color: '#fff', borderBottom: `1px solid ${COLORS.primaryBorder}`, textAlign: 'left', fontFamily: 'monospace' }}>{row.categories.length > 0 ? row.categories.join(', ') : 'None'}</td>
                        <td style={{ padding: 8, color: '#fff', borderBottom: `1px solid ${COLORS.primaryBorder}`, textAlign: 'left', fontFamily: 'monospace', background: row.categories.length === 0 ? COLORS.secondaryMain : undefined, borderRadius: row.categories.length === 0 ? 8 : undefined, fontWeight: row.categories.length === 0 ? 900 : undefined, textAlign: 'center', letterSpacing: 1, boxShadow: row.categories.length === 0 ? '0 1px 4px 0 rgba(0,0,0,0.10)' : undefined }}>
                          {row.confidence}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {categorySummary.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  margin: '16px 0 0 0',
                  alignItems: 'center',
                  background: 'linear-gradient(90deg, #e4ede9 80%, #f2f6f4 100%)',
                  borderRadius: 14,
                  padding: '10px 14px',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)',
                  border: `1px solid ${COLORS.primaryBorder}`,
                  justifyContent: 'flex-start',
                  rowGap: 8,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: COLORS.primaryMain, fontWeight: 900, fontSize: 16, marginRight: 10, minWidth: 0, letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
                    <svg style={{ marginRight: 6, marginTop: 1 }} width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5c0 .4-.16.78-.44 1.06l-4.56 4.56V16a1 1 0 0 1-2 0v-4.88l-4.56-4.56A1.5 1.5 0 0 1 3 5.5Z" fill="#1f6a4a"/></svg>
                    Filter by category:
                  </span>
                  {categorySummary.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      style={{
                        background: selectedCategory === cat.name ? COLORS.secondaryMain : COLORS.primaryMain,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 900,
                        fontSize: 16,
                        padding: '9px 22px',
                        cursor: 'pointer',
                        outline: selectedCategory === cat.name ? `2px solid ${COLORS.secondaryHover}` : 'none',
                        transition: 'background 0.18s, box-shadow 0.18s',
                        boxShadow: selectedCategory === cat.name ? '0 2px 8px 0 rgba(255,157,24,0.18)' : '0 1px 4px 0 rgba(31,106,74,0.10)',
                        letterSpacing: 0.2,
                      }}
                      className="category-btn"
                      aria-pressed={selectedCategory === cat.name}
                      onMouseOver={e => e.currentTarget.style.background = COLORS.primaryHover}
                      onMouseOut={e => e.currentTarget.style.background = selectedCategory === cat.name ? COLORS.secondaryMain : COLORS.primaryMain}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {selectedCategory && (
                    <button
                      onClick={handleClearCategoryFilter}
                      style={{
                        background: COLORS.secondaryMain,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 900,
                        fontSize: 16,
                        padding: '9px 22px',
                        marginLeft: 10,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'background 0.18s, box-shadow 0.18s',
                        boxShadow: '0 2px 8px 0 rgba(255,157,24,0.18)',
                        letterSpacing: 0.2,
                      }}
                      className="clearfilter-btn"
                      onMouseOver={e => e.currentTarget.style.background = COLORS.secondaryHover}
                      onMouseOut={e => e.currentTarget.style.background = COLORS.secondaryMain}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
          {/* Analysis Summary (collapsible) */}
          {classifiedRows.length > 0 && (
            <section
              aria-label="Analysis Summary"
              style={{
                background: '#103525',
                borderRadius: 16,
                padding: 0,
                marginBottom: 32,
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                border: '2px solid #d7e4de',
                overflow: 'hidden',
                marginTop: 24,
              }}
            >
              {/* Header */}
              <header style={{ background: '#e4ede9', padding: '18px 32px', borderBottom: '2px solid #d7e4de', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#1f6a4a', fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>Analysis Summary</span>
                {loading && (
                  <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#ff9d18', marginLeft: 12, animation: 'pulse 1s infinite alternate' }} aria-label="Loading analysis summary"></span>
                )}
              </header>
              {/* Collapsible Panels */}
              <div style={{ padding: 24 }}>
                {/* Predicted Categories Panel */}
                <CollapsiblePanel
                  title="Predicted Categories Analysis"
                  defaultOpen={false}
                  borderColor="#d7e4de"
                  focusColor="#2e9e6e"
                  headerColor="#1f6a4a"
                  bgColor="#103525"
                  ariaLabel="Predicted Categories Panel"
                >
                  <PredictedCategoriesTable
                    data={categorySummary}
                  />
                </CollapsiblePanel>
                {/* Category Distribution Bar Chart Panel */}
                {categorySummary.length > 0 && (
                  <CollapsiblePanel
                    title="Category Distribution Bar Chart"
                    defaultOpen={false}
                    borderColor="#d7e4de"
                    focusColor="#2e9e6e"
                    headerColor="#1f6a4a"
                    bgColor="rgb(24, 76, 54)"
                    ariaLabel="Category Distribution Bar Chart Panel"
                  >
                    <div style={{ width: '100%', height: 380, maxWidth: 800, margin: '0 auto' }}>
                      <BarChart
                        width={720}
                        height={340}
                        data={categorySummary}
                        layout="vertical"
                        margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#295c47" />
                        <XAxis type="number" stroke="#fff" tick={{ fill: '#fff', fontWeight: 700 }} />
                        <YAxis type="category" dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontWeight: 700 }} width={180} />
                        <Tooltip contentStyle={{ background: '#184c36', color: '#fff', border: '1.5px solid #295c47', borderRadius: 8 }} />
                        <Bar dataKey="count" fill="#ff9d18" radius={[8, 8, 8, 8]} barSize={28}>
                          <LabelList dataKey="count" position="right" fill="#fff" fontWeight={900} fontSize={17} />
                        </Bar>
                      </BarChart>
                    </div>
                  </CollapsiblePanel>
                )}
                {/* NPS Panel */}
                <NPSPanel data={rawExcelData} columns={excelColumns} />
                <DonutChartsPanel data={rawExcelData} columns={excelColumns} />
              </div>
            </section>
          )}
          {/* Show Data Table (raw) */}
          {excelData.length > 0 && !showColumnSelect && (
            <div style={{ background: COLORS.primarySurface, borderRadius: 14, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)', padding: 28, marginBottom: 32, border: `2px solid ${COLORS.primaryBorder}`, minHeight: 600, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <h3 style={{ color: '#fff', fontWeight: 900, fontSize: 24, margin: 0, marginBottom: 18, fontFamily: 'sans-serif' }}>Raw Data Preview</h3>
              <div style={{ maxHeight: 420, overflow: 'auto', border: `1.5px solid ${COLORS.primaryBorder}`, borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, fontFamily: 'monospace', borderRadius: 10, overflow: 'hidden' }}>
                  <thead>
                    <tr>
                      {excelColumns.map((col, idx) => (
                        <th key={col + idx} style={{ background: COLORS.primaryMain, color: '#fff', fontWeight: 900, fontSize: 17, fontFamily: 'sans-serif', padding: '10px 14px', borderBottom: `2px solid ${COLORS.primaryBorder}`, textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.slice(0, 10).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? COLORS.primarySurface : COLORS.primaryMain }}>
                        {excelColumns.map((col, j) => (
                          <td key={col + j} style={{ padding: '10px 14px', color: '#fff', borderBottom: `1px solid ${COLORS.primaryBorder}`, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', fontFamily: 'monospace' }}>{row[j]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {excelData.length > 10 && (
                <div style={{ color: '#fff', marginTop: 10, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>
                  Showing first 10 rows of {excelData.length}.
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  type="button"
                  onClick={handleContinueAfterPreview}
                  className="showdata-btn"
                  style={{
                    background: COLORS.primaryMain,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 17,
                    padding: '12px 36px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                    transition: 'background 0.2s',
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
        </main>
      </div>
      {/* Spinner animation style */}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        ::selection { background: ${COLORS.primaryFocus}; }
        .reset-btn:focus, .upload-btn:focus, .classify-btn:focus, .download-btn:focus, .clearfilter-btn:focus, .settings-btn:focus {
          outline: 2px solid ${COLORS.primaryHover};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default App; 
