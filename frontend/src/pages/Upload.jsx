import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDataset as uploadDatasetAPI } from "../services/uploadService";
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { CustomTable } from '../components/common/CustomTable';
import { UploadCloud, FileText, Play, Trash2, Table, Database, Columns, Hash } from 'lucide-react';

export const Upload = () => {
  const { dataset, isUploaded, uploadDataset, analyzeDataset, resetDataset } = useDataLens();
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await uploadDatasetAPI(file);

      if (response && response.success) {
        uploadDataset(file, response.dataset);
      } else {
        alert(response?.message || "Failed to upload dataset.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload dataset to backend server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = async () => {
    await analyzeDataset();
    navigate('/overview');
  };

  const columns = dataset?.columns?.map(col => ({
    header: col.name,
    accessor: col.name,
    render: (val) => (
      val === null || val === undefined ? (
        <span style={{ color: 'var(--danger)', fontStyle: 'italic', fontWeight: 600 }}>null</span>
      ) : String(val)
    )
  })) || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Dataset Upload & Inspection"
        subtitle="Upload a CSV dataset to inspect raw records before executing the DataLens investigation pipeline."
        icon={UploadCloud}
        badge={
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: isUploaded ? 'var(--success)' : 'var(--warning)', 
            backgroundColor: isUploaded ? 'var(--success-light)' : 'var(--warning-light)', 
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px',
            border: `1px solid ${isUploaded ? 'var(--success-border)' : 'var(--warning-border)'}`
          }}>
            Status: {isUploaded ? 'File Uploaded' : 'Not Uploaded'}
          </span>
        }
      />

      {!isUploaded ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          className="card"
          style={{
            border: dragOver ? '2px dashed var(--primary)' : '2px dashed var(--border-strong)',
            backgroundColor: dragOver ? 'var(--primary-light)' : 'var(--bg-surface)',
            padding: '4rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            margin: '2rem 0'
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <UploadCloud size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Drag & Drop your CSV dataset here</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Supports standard CSV files containing numerical, categorical, and temporal attributes.
          </p>

          <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', opacity: isUploading ? 0.7 : 1 }}>
            {isUploading ? "Uploading file..." : "Browse File"}
            <input type="file" accept=".csv" onChange={handleFileSelect} disabled={isUploading} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Enhanced Dataset Preview Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>
                    Dataset Preview Card
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                    Inspecting metadata and sample structure before running analysis
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={resetDataset} 
                  className="btn btn-secondary"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                >
                  <Trash2 size={16} /> Remove File
                </button>

                <button 
                  onClick={handleStartAnalysis} 
                  className="btn btn-primary" 
                  style={{ padding: '0.65rem 1.5rem', fontWeight: 600 }}
                >
                  <Play size={18} /> Analyze Dataset
                </button>
              </div>
            </div>

            {/* 4 Metadata Stat Pills */}
            <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Name</div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dataset?.filename}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Size</div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {dataset?.filesize}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Number of Rows</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {dataset?.totalRows !== undefined ? `${dataset.totalRows.toLocaleString()} rows` : "15,420 rows"}
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Number of Columns</div>
                <div style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {dataset?.columns?.length || 0} columns
                </div>
              </div>
            </div>

            {/* Raw 10 Rows Preview Table */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <Table size={18} color="var(--primary)" />
                <span>First 10 Rows Raw Data Preview</span>
              </div>
              <CustomTable columns={columns} data={dataset?.rows || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
