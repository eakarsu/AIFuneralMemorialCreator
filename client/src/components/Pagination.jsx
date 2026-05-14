import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
      <button
        className="btn-outline btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{ minWidth: 36 }}
      >
        &lsaquo;
      </button>

      {start > 1 && (
        <>
          <button className="btn-outline btn-sm" onClick={() => onPageChange(1)} style={{ minWidth: 36 }}>1</button>
          {start > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
          onClick={() => onPageChange(p)}
          style={{ minWidth: 36 }}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
          <button className="btn-outline btn-sm" onClick={() => onPageChange(totalPages)} style={{ minWidth: 36 }}>{totalPages}</button>
        </>
      )}

      <button
        className="btn-outline btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{ minWidth: 36 }}
      >
        &rsaquo;
      </button>

      <span style={{ color: 'var(--text-light)', fontSize: 13, marginLeft: 8 }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
