import React from 'react';
import Card from './common/Card';

const FormattingGuide: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Panduan Format Penulisan Skripsi</h1>
                <p className="text-text-secondary font-serif">Referensi cepat untuk aturan dan struktur penulisan karya ilmiah sesuai standar umum di Indonesia.</p>
            </header>

            <Card>
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold font-serif text-primary border-b border-border pb-2">Aturan Umum Penulisan</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">1. Margin</h3>
                            <p className="text-text-secondary font-serif mt-1">
                                Margin standar yang umum digunakan adalah format <strong>4433</strong>:
                            </p>
                            <ul className="list-disc list-inside font-serif text-text-secondary space-y-1 mt-2 pl-4">
                                <li><strong>Batas Kiri:</strong> 4 cm (untuk penjilidan)</li>
                                <li><strong>Batas Atas:</strong> 4 cm</li>
                                <li><strong>Batas Kanan:</strong> 3 cm</li>
                                <li><strong>Batas Bawah:</strong> 3 cm</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">2. Jenis dan Ukuran Huruf</h3>
                             <ul className="list-disc list-inside font-serif text-text-secondary space-y-1 mt-2 pl-4">
                                <li><strong>Jenis Huruf:</strong> Times New Roman.</li>
                                <li><strong>Ukuran Isi Teks:</strong> 12 point.</li>
                                 <li><strong>Ukuran Judul (Indonesia):</strong> 16 point, dicetak tebal.</li>
                                 <li><strong>Ukuran Judul (Inggris):</strong> 14 point, dicetak miring dan tebal.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">3. Spasi (Jarak Antar Baris)</h3>
                             <ul className="list-disc list-inside font-serif text-text-secondary space-y-1 mt-2 pl-4">
                                <li><strong>Isi Naskah:</strong> 2 spasi.</li>
                                <li><strong>Antara Judul Bab dan Sub-bab:</strong> 4 spasi.</li>
                                 <li><strong>Antara Teks dan Tabel/Gambar:</strong> 3 spasi.</li>
                                 <li><strong>Antar Alinea Paragraf:</strong> 1.5 spasi atau sama dengan isi naskah (2 spasi) dengan pengaturan 'space after paragraph'.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">4. Penomoran</h3>
                             <ul className="list-disc list-inside font-serif text-text-secondary space-y-1 mt-2 pl-4">
                                <li><strong>Nomor Bab:</strong> Menggunakan angka Romawi (I, II, III, ...).</li>
                                <li><strong>Nomor Sub-bab:</strong> Menggunakan huruf kapital (A, B, C, ...).</li>
                                <li><strong>Nomor Anak Sub-bab:</strong> Menggunakan angka biasa (1, 2, 3, ...).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold font-serif text-primary border-b border-border pb-2">Struktur Halaman Awal</h2>
                    <ul className="list-decimal list-inside font-serif text-text-secondary space-y-3 pl-4">
                        <li>
                            <strong>Halaman Judul:</strong> Berisi judul skripsi, nama penulis, NIM, nama pembimbing, logo institusi, dan informasi identitas lainnya.
                        </li>
                        <li>
                            <strong>Halaman Persetujuan:</strong> Berisi lembar persetujuan dengan tanda tangan dari pembimbing yang menyatakan skripsi layak diuji.
                        </li>
                        <li>
                            <strong>Halaman Pengesahan Tim Penguji:</strong> Halaman berisi tanda tangan dari seluruh tim penguji sebagai bukti bahwa skripsi telah diuji dan disahkan.
                        </li>
                        <li>
                            <strong>Halaman Pernyataan Keaslian Skripsi:</strong> Pernyataan bermaterai yang menyatakan bahwa karya tulis adalah orisinal, bukan hasil plagiarisme.
                        </li>
                        <li>
                            <strong>Kata Pengantar:</strong> Ucapan terima kasih penulis kepada pihak-pihak yang telah membantu selama proses penyusunan skripsi.
                        </li>
                        <li>
                            <strong>Abstrak:</strong> Ringkasan padat dari keseluruhan isi skripsi (biasanya dalam Bahasa Indonesia dan Bahasa Inggris), mencakup latar belakang, tujuan, metode, hasil, dan kesimpulan.
                        </li>
                        <li>
                            <strong>Daftar Isi, Daftar Tabel, Daftar Gambar:</strong> Memuat semua bagian tulisan beserta nomor halamannya untuk memudahkan navigasi pembaca.
                        </li>
                        <li>
                            <strong>Lampiran:</strong> Bagian akhir yang berisi data mentah, instrumen penelitian (kuesioner, pedoman wawancara), surat izin penelitian, atau dokumen pendukung lainnya.
                        </li>
                    </ul>
                </div>
            </Card>

        </div>
    );
};

export default FormattingGuide;
