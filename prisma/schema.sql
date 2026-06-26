-- PostgreSQL DDL Schema for E-ARSIP ANGKUTAN UDARA OTBAN X

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: jenis_arsip
CREATE TABLE IF NOT EXISTS jenis_arsip (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_jenis VARCHAR(255) UNIQUE NOT NULL
);

-- Table: bandar_udara
CREATE TABLE IF NOT EXISTS bandar_udara (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_bandara VARCHAR(255) UNIQUE NOT NULL
);

-- Table: tahun
CREATE TABLE IF NOT EXISTS tahun (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahun VARCHAR(4) UNIQUE NOT NULL
);

-- Table: dokumen
CREATE TABLE IF NOT EXISTS dokumen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_dokumen VARCHAR(255) NOT NULL,
    nomor_dokumen VARCHAR(255) NOT NULL,
    keterangan TEXT,
    jenis_arsip_id UUID NOT NULL REFERENCES jenis_arsip(id) ON DELETE RESTRICT,
    bandara_id UUID NOT NULL REFERENCES bandar_udara(id) ON DELETE RESTRICT,
    tahun_id UUID NOT NULL REFERENCES tahun(id) ON DELETE RESTRICT,
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    tanggal_dokumen VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Table: log_aktivitas
CREATE TABLE IF NOT EXISTS log_aktivitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_username VARCHAR(255) NOT NULL,
    aktivitas VARCHAR(255) NOT NULL,
    detail TEXT,
    tanggal TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create triggers to update 'updated_at' on 'dokumen'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dokumen_updated_at
BEFORE UPDATE ON dokumen
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data
INSERT INTO admins (id, nama, username, password)
VALUES (uuid_generate_v4(), 'Admin OTBAN X', 'angud2026', 'otban10')
ON CONFLICT (username) DO NOTHING;

INSERT INTO jenis_arsip (nama_jenis) VALUES 
('Pengawasan'),
('Peraturan'),
('Rapat'),
('Surat'),
('Nota dinas'),
('PPRP'),
('Lalu Lintas'),
('Rekonsiliasi')
ON CONFLICT (nama_jenis) DO NOTHING;

INSERT INTO bandar_udara (nama_bandara) VALUES 
('Bandar Udara Mopah'),
('Bandar Udara Sentani'),
('Bandar Udara Wamena'),
('Bandar Udara Timika'),
('Bandar Udara Nop Goliat Dekai'),
('Bandar Udara Tanah Merah')
ON CONFLICT (nama_bandara) DO NOTHING;
