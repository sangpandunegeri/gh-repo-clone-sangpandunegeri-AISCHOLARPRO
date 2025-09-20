

import { GoogleGenAI, Type } from "@google/genai";
import { StatisticSuggestion, ChartData, BibliographyItem as ProjectBibliographyItem, AuthorInfo, ProjectData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ChapterOutline {
  background: string;
  problem: string;
  objective: string;
  benefits: string;
  writingSystematics: string;
  thinkingFramework: string;
}

export interface BibliographyItem {
    id: string;
    apa: string;
}

export interface ChapterGenerationResult {
    content: string;
    references: BibliographyItem[];
}

const getCanonicalString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export const generatePreface = async (title: string, authorName: string): Promise<string> => {
    try {
        const prompt = `
            Anda adalah seorang akademisi yang sedang menulis "Kata Pengantar" untuk sebuah karya ilmiah.
            Gaya penulisan harus formal, tulus, dan sesuai dengan standar penulisan di Indonesia.
            Judul karya ilmiahnya adalah "${title}".
            Penulisnya adalah ${authorName}.

            Tugas Anda adalah menulis draf Kata Pengantar dalam format HTML.
            Struktur isinya harus mencakup:
            1.  Paragraf pembuka berisi puji syukur kepada Tuhan Yang Maha Esa.
            2.  Paragraf yang menjelaskan secara singkat tujuan penulisan karya ilmiah ini.
            3.  Paragraf ucapan terima kasih kepada pihak-pihak berikut (gunakan nama placeholder jika perlu):
                - Dosen Pembimbing.
                - Pihak institusi/fakultas/program studi.
                - Keluarga (orang tua, saudara).
                - Teman-teman atau pihak lain yang mendukung.
            4.  Paragraf penutup berisi harapan penulis atas manfaat dari karya ilmiah ini dan kesediaan menerima kritik.

            Gunakan tag <p> untuk setiap paragraf.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating preface:", error);
        return "<p>Gagal membuat draf Kata Pengantar. Silakan coba lagi.</p>";
    }
};

export const generateAbstract = async (title: string, outline: ChapterOutline): Promise<string> => {
    try {
        const prompt = `
            Anda adalah seorang peneliti ahli yang bertugas menulis Abstrak untuk sebuah karya ilmiah berbahasa Indonesia yang memenuhi standar penulisan ilmiah yang ketat. Abstrak harus ringkas, informatif, dan komprehensif.

            Judul Penelitian: "${title}"
            Kerangka Penelitian:
            - Latar Belakang: ${outline.background}
            - Rumusan Masalah: ${outline.problem}
            - Tujuan Penelitian: ${outline.objective}

            Tugas Anda adalah menulis draf Abstrak yang terstruktur dengan baik dalam satu paragraf (format HTML, gunakan tag <p>).

            Struktur abstrak harus mencakup elemen-elemen berikut secara berurutan dan padat:
            1.  **Latar Belakang:** Satu hingga dua kalimat yang memperkenalkan konteks dan masalah penelitian.
            2.  **Tujuan:** Satu kalimat yang menyatakan dengan jelas tujuan penelitian.
            3.  **Metodologi:** Satu hingga dua kalimat yang menjelaskan pendekatan penelitian, subjek/objek, dan teknik pengumpulan/analisis data secara umum.
            4.  **Hasil:** Satu hingga dua kalimat yang menyajikan temuan utama penelitian (sajikan secara hipotetis namun seolah-olah sudah ditemukan).
            5.  **Kata Kunci:** Di akhir, tambahkan "<strong>Kata Kunci:</strong> " diikuti oleh 3-5 kata kunci yang relevan.

            Aturan Tambahan:
            - Keseluruhan abstrak harus antara 150 hingga 250 kata.
            - Gunakan bahasa Indonesia formal yang baku, presisi, dan efisien.
            - Hindari kalimat yang terlalu panjang atau berbelit-belit.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating abstract:", error);
        return "<p>Gagal membuat draf Abstrak. Silakan coba lagi.</p>";
    }
};

export const initializeNewProject = async (authorInfo: AuthorInfo, title: string, academicLevel: string): Promise<ProjectData> => {
    try {
        // Generate the core research outline first
        const outline = await generateOutline(title);
        
        // Generate preface and abstract based on the initial info
        const preface = await generatePreface(title, authorInfo.studentName);
        const abstract = await generateAbstract(title, outline);

        // Assemble the initial ProjectData object
        const newProject: ProjectData = {
            title,
            academicLevel,
            authorInfo,
            outline,
            preface,
            abstract,
            chapters: {},
            bibliography: [],
            appendices: [],
            isActivated: false,
            statementPageData: {
                studentName: authorInfo.studentName,
                studentId: authorInfo.studentId,
                statementDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            },
            approvalData: {
                studentName: authorInfo.studentName,
                studentId: authorInfo.studentId,
                studyProgram: authorInfo.studyProgram,
                supervisor1Name: '', // Left blank for user to fill
                supervisor1Id: '',
                supervisor2Name: '',
                supervisor2Id: '',
                approvalDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            },
        };
        return newProject;

    } catch (error) {
        console.error("Error initializing new project:", error);
        throw new Error("Gagal menginisialisasi proyek baru. Pastikan API Key valid dan coba lagi.");
    }
};


const getChapterSpecificPrompt = (
  chapterName: string,
  title: string,
  background: string,
  problem: string,
  objective: string,
  benefits: string,
  writingSystematics: string,
  thinkingFramework: string,
  academicLevel: string,
  minReferences: number,
  minCharacters: number,
  bibliography?: ProjectBibliographyItem[]
): string => {
  const commonInstructions = `
    Anda adalah seorang akademisi profesional yang sedang menulis karya ilmiah tingkat ${academicLevel}.
    Judul utama penelitian adalah: "${title}"
    
    Konteks penelitian telah dirangkum dalam poin-poin berikut:
    - Latar Belakang: ${background}
    - Rumusan Masalah: ${problem}
    - Tujuan Penelitian: ${objective}
    - Manfaat Penelitian: ${benefits}
    - Sistematika Penulisan: ${writingSystematics}
    - Kerangka Pemikiran: ${thinkingFramework}

    Ketentuan penulisan WAJIB:
    1.  **Gunakan Google Search:** Temukan referensi akademis (jurnal, buku, laporan) yang NYATA dan VALID menggunakan Google Search. JANGAN MEREKAYASA referensi.
    2.  **Sitasi Dalam Teks:** Sisipkan minimal ${minReferences} referensi valid ke dalam teks dengan format sitasi (Nama, Tahun). Contoh: (Kotler, 2017).
    3.  **Analisis Mendalam & Sintesis:** Lakukan analisis yang mendalam, bukan hanya deskripsi permukaan. Sintesiskan informasi dari berbagai sumber yang Anda temukan menjadi sebuah argumen yang koheren. Jangan hanya menyajikan kutipan satu per satu.
    4.  **Integrasi Teori Canggih:** Integrasikan teori-teori yang relevan secara canggih. Gunakan teori sebagai 'lensa' untuk menganalisis masalah, bukan hanya sebagai tempelan di bagian landasan teori.
    5.  **Gaya Penulisan Akademik:** Gunakan bahasa Indonesia yang baku sesuai Ejaan Yang Disempurnakan (EYD) dan Kamus Besar Bahasa Indonesia (KBBI). Gaya penulisan harus formal, analitis, dan argumentatif. Hindari repetisi dan frasa klise AI seperti "Dalam era digital saat ini…", "Penting untuk dicatat...", "Sebagai kesimpulan...".
    6.  **Struktur Argumen Logis:** Sajikan argumen yang logis, terstruktur, dan mengalir secara progresif.
    7.  **Variasi Pengembangan Paragraf:** Gunakan beragam teknik pengembangan paragraf (misalnya kronologi, ilustrasi, definisi, perbandingan, sebab-akibat) untuk menyajikan argumen. Jangan hanya menggunakan satu pola yang monoton. Kombinasikan beberapa pola agar tulisan bervariasi, menarik, dan informatif.
    8.  **Format Output JSON:** Anda HARUS mengembalikan respons dalam format JSON string yang valid, tanpa markdown. Strukturnya harus sebagai berikut:
        {
          "chapter_content": "...",
          "references": [
            { "id": "...", "apa": "..." },
            ...
          ]
        }
        - "chapter_content": Berisi seluruh teks bab dalam format HTML. Gunakan tag <h2> untuk sub-judul, <p> untuk paragraf, dan tag lain yang relevan (<ul>, <ol>, <strong>, <em>). Setiap tag <h2> HARUS memiliki atribut 'id' yang unik dan ramah URL (contoh: id="latar-belakang"). JANGAN gunakan tag <html>, <head>, atau <body>.
        - "references": Array dari setiap sumber yang Anda kutip.
            - "id": ID unik untuk referensi (contoh: 'kotler-2017').
            - "apa": String daftar pustaka lengkap untuk sumber tersebut, diformat sesuai standar APA 7.
    9.  **Panjang Konten:** Pastikan total konten bab yang dihasilkan (nilai dalam "chapter_content") memiliki sekitar ${minCharacters} karakter (termasuk spasi dan markup HTML) untuk memastikan kedalaman pembahasan. Jangan menulis kurang dari jumlah ini secara signifikan.
    10. **Format Penomoran:** Gunakan format penomoran standar: Huruf Kapital untuk sub-bab (contoh: <h2 id="latar-belakang">A. Latar Belakang</h2>), dan Angka Arab untuk anak sub-bab (contoh: <h3>1. Definisi Konsep</h3>). Pastikan semua sub-judul <h2> dinomori dengan huruf kapital secara berurutan.
  `;

  const chapterSpecificInstructions = {
     'BAB I PENDAHULUAN': `
        Tugas Anda adalah menulis bab "BAB I PENDAHULUAN" secara lengkap.
        Struktur bab ini harus mencakup sub-judul berikut dengan format penomoran yang benar dan atribut 'id' yang sesuai:
        <h2 id="latar-belakang-masalah">A. Latar Belakang Masalah</h2> (uraikan poin-poin yang sudah ada menjadi narasi yang mengalir).
        <h2 id="identifikasi-rumusan-masalah">B. Identifikasi & Rumusan Masalah</h2> (sajikan dalam bentuk pertanyaan penelitian yang jelas).
        <h2 id="tujuan-penelitian">C. Tujuan Penelitian</h2> (sesuaikan dengan rumusan masalah).
        <h2 id="manfaat-penelitian">D. Manfaat Penelitian</h2> (uraikan poin manfaat yang sudah ada mengenai manfaat teoretis dan praktisnya).
        <h2 id="sistematika-penulisan">E. Sistematika Penulisan</h2> (uraikan poin sistematika penulisan menjadi penjelasan naratif dari setiap bab).
      `,
    'BAB II LANDASAN TEORI': `
        Tugas Anda adalah menulis "BAB II LANDASAN TEORI". Bab ini harus membangun fondasi teoretis yang kuat.
        Gunakan struktur tiga bagian berikut dengan penomoran yang benar dan atribut 'id' yang sesuai:

        <h2 id="landasan-teori">A. Landasan Teori</h2>
        - Jelaskan secara mendalam teori-teori utama dan konsep-konsep kunci yang relevan.
        - Bandingkan dan sintesiskan pandangan dari berbagai ahli untuk menunjukkan pemahaman yang komprehensif.

        <h2 id="penelitian-terdahulu">B. Penelitian Terdahulu dan Celah Penelitian</h2>
        - Temukan dan ulas minimal 3 penelitian relevan sebelumnya (jurnal, tesis).
        - Untuk setiap penelitian, jelaskan tujuan, metode, dan temuan utamanya.
        - Setelah itu, tunjukkan secara eksplisit celah penelitian (research gap) yang akan diisi oleh studi ini.

        <h2 id="kerangka-pemikiran-hipotesis">C. Kerangka Pemikiran dan Hipotesis</h2>
        - Bangun alur pemikiran logis yang menghubungkan teori dan penelitian terdahulu untuk membentuk kerangka pemikiran.
        - Berdasarkan kerangka tersebut, rumuskan hipotesis penelitian yang jelas dan dapat diuji (contoh: H1: Ada pengaruh...).
      `,
    'BAB III METODOLOGI PENELITIAN': `
        Tugas Anda adalah menulis bab "BAB III METODOLOGI PENELITIAN".
        Rancang sebuah metodologi yang paling tepat untuk menjawab rumusan masalah. Struktur bab ini harus mencakup sub-judul berikut dengan format penomoran yang benar dan atribut 'id' yang sesuai:
        <h2 id="pendekatan-jenis-penelitian">A. Pendekatan dan Jenis Penelitian</h2> (Tentukan apakah penelitian ini kuantitatif atau kualitatif, serta jenis spesifiknya. Berikan justifikasi).
        <h2 id="populasi-sampel">B. Populasi dan Sampel</h2> (Definisikan populasi target dan jelaskan teknik pengambilan sampel).
        <h2 id="teknik-pengumpulan-data">C. Teknik Pengumpulan Data</h2> (Uraikan instrumen atau cara pengumpulan data, misal: kuesioner, wawancara).
        <h2 id="definisi-operasional-variabel">D. Definisi Operasional Variabel</h2> (Jelaskan secara operasional bagaimana setiap variabel akan diukur).
        <h2 id="teknik-analisis-data">E. Teknik Analisis Data</h2> (Jelaskan langkah-langkah dan uji statistik atau teknik analisis yang akan digunakan).
      `,
    'BAB IV HASIL PENELITIAN DAN PEMBAHASAN': `
        Tugas Anda adalah menulis bab "BAB IV HASIL PENELITIAN DAN PEMBAHASAN".
        Karena data riil tidak tersedia, Anda harus **menghasilkan data hipotetis (contoh)** yang konsisten dengan metodologi.
        Struktur bab ini harus mencakup sub-judul berikut dengan format penomoran yang benar dan atribut 'id' yang sesuai:
        <h2 id="gambaran-umum-objek">A. Gambaran Umum Objek Penelitian</h2> (Deskripsikan karakteristik responden atau objek penelitian).
        <h2 id="deskripsi-data">B. Deskripsi Data</h2> (Sajikan statistik deskriptif dari data hipotetis).
        <h2 id="hasil-pengujian-hipotesis">C. Hasil Pengujian Hipotesis</h2> (Tampilkan hasil dari analisis data hipotetis. Nyatakan apakah hipotesis diterima atau ditolak).
        <h2 id="pembahasan-interpretasi">D. Pembahasan (Interpretasi)</h2> (Ini adalah bagian terpenting. Interpretasikan hasil temuan tersebut secara mendalam. WAJIB hubungkan kembali temuan hipotetis Anda dengan kerangka teori yang telah diuraikan di Bab II. Tunjukkan bagaimana temuan Anda mendukung, menolak, atau memperluas teori yang ada).
      `,
    'BAB V PENUTUP (KESIMPULAN DAN SARAN)': `
        Tugas Anda adalah menulis bab "BAB V PENUTUP".
        Bab ini harus ringkas dan padat. Berdasarkan hasil dan pembahasan (hipotetis) dari Bab IV.
        Struktur bab ini harus mencakup sub-judul berikut dengan format penomoran yang benar dan atribut 'id' yang sesuai:
        <h2 id="kesimpulan">A. Kesimpulan</h2> (Buat kesimpulan yang secara langsung menjawab setiap rumusan masalah).
        <h2 id="keterbatasan-penelitian">B. Keterbatasan Penelitian</h2> (Sebutkan beberapa potensi keterbatasan dari penelitian).
        <h2 id="saran">C. Saran</h2> (Berikan saran yang konkret dan relevan, baik praktis maupun akademis).
      `,
    'BAB VI DAFTAR PUSTAKA': `
        Tugas Anda adalah menyusun "DAFTAR PUSTAKA" yang lengkap dan rapi berdasarkan daftar referensi yang telah disediakan.

        Berikut adalah daftar referensi dalam format APA 7 yang perlu Anda susun:
        ${bibliography?.map(item => `- ${item.apa}`).join('\n') || 'Tidak ada referensi yang disediakan.'}

        Ketentuan WAJIB:
        1.  Urutkan semua referensi secara alfabetis berdasarkan nama belakang penulis pertama. Abaikan kata-kata seperti "A", "An", atau "The" di awal judul jika penulis tidak ada.
        2.  Pastikan format setiap entri konsisten sesuai standar APA 7, termasuk penggunaan huruf miring untuk judul buku atau jurnal.
        3.  Format output HARUS dalam bentuk HTML. Gunakan tag <p> untuk setiap entri daftar pustaka. Jangan gunakan <ul> atau <ol>.
        4.  Anda HARUS mengembalikan respons dalam format JSON string yang valid, tanpa markdown. Strukturnya harus sebagai berikut:
            {
              "chapter_content": "<p>Referensi A...</p><p>Referensi B...</p><p>Referensi C...</p>",
              "references": []
            }
        - "chapter_content": Berisi seluruh daftar pustaka yang sudah diurutkan dan diformat.
        - "references": Kembalikan array kosong, karena tidak ada referensi baru yang dihasilkan.
      `
  };

  const specificInstruction = chapterSpecificInstructions[chapterName] || `
    Tugas Anda adalah menulis bab "${chapterName}" secara lengkap dengan gaya bahasa akademik resmi, mengintegrasikan konteks di atas ke dalam tulisan.
    Adaptasikan struktur ini sesuai dengan nama dan tujuan bab yang diminta.
  `;
  
  return chapterName === 'BAB VI DAFTAR PUSTAKA' ? specificInstruction : `${commonInstructions}\n${specificInstruction}`;
};


export const generateOutline = async (title: string): Promise<ChapterOutline> => {
  try {
    const prompt = `
      Anda adalah seorang asisten peneliti akademik yang ahli. Selalu gunakan bahasa Indonesia yang baku sesuai EYD dan KBBI.
      Berdasarkan judul penelitian berikut, buatkan draf kerangka untuk Bab 1 Pendahulu.
      Judul: "${title}"
      
      Tugas Anda adalah menghasilkan:
      1.  **latar_belakang**: Beberapa poin atau paragraf singkat yang menjadi latar belakang masalah penelitian.
      2.  **rumusan_masalah**: Satu atau lebih rumusan masalah yang relevan dalam bentuk pertanyaan.
      3.  **tujuan_penelitian**: Tujuan penelitian yang sinkron dengan rumusan masalah yang dibuat.
      4.  **manfaat_penelitian**: Penjelasan singkat manfaat akademis dan praktis dari penelitian.
      5.  **sistematika_penulisan**: Gambaran singkat struktur penulisan dari Bab I hingga Bab V.
      6.  **kerangka_pemikiran**: Poin-poin kunci yang menjelaskan alur pemikiran logis yang menghubungkan variabel atau konsep utama, yang menjadi dasar hipotesis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latar_belakang: {
              type: Type.STRING,
              description: "Poin-poin utama untuk latar belakang penelitian, dalam bentuk paragraf singkat."
            },
            rumusan_masalah: {
              type: Type.STRING,
              description: "Satu atau lebih rumusan masalah penelitian, diformat sebagai pertanyaan."
            },
            tujuan_penelitian: {
              type: Type.STRING,
              description: "Satu atau lebih tujuan penelitian yang sesuai dengan rumusan masalah."
            },
            manfaat_penelitian: {
              type: Type.STRING,
              description: "Penjelasan singkat mengenai manfaat akademis dan praktis penelitian."
            },
            sistematika_penulisan: {
                type: Type.STRING,
                description: "Penjelasan singkat struktur penulisan skripsi dari Bab I hingga Bab V."
            },
            kerangka_pemikiran: {
                type: Type.STRING,
                description: "Alur pemikiran logis yang menghubungkan variabel atau konsep utama, yang akan menjadi dasar untuk hipotesis."
            }
          },
          required: ["latar_belakang", "rumusan_masalah", "tujuan_penelitian", "manfaat_penelitian", "sistematika_penulisan", "kerangka_pemikiran"]
        },
      },
    });

    const parsedJson = JSON.parse(response.text);

    return {
      background: parsedJson.latar_belakang,
      problem: parsedJson.rumusan_masalah,
      objective: parsedJson.tujuan_penelitian,
      benefits: parsedJson.manfaat_penelitian,
      writingSystematics: parsedJson.sistematika_penulisan,
      thinkingFramework: parsedJson.kerangka_pemikiran,
    };

  } catch (error) {
    console.error("Error generating outline:", error);
    throw new Error("Gagal membuat kerangka otomatis. Pastikan judul penelitian jelas dan coba lagi.");
  }
};


export const generateChapter = async (
  title: string, 
  background: string, 
  problem: string, 
  objective: string,
  benefits: string,
  writingSystematics: string,
  thinkingFramework: string,
  academicLevel: string,
  chapterName: string,
  minReferences: number,
  minCharacters: number,
  bibliography?: ProjectBibliographyItem[]
): Promise<ChapterGenerationResult> => {
  try {
    const prompt = getChapterSpecificPrompt(
      chapterName,
      title,
      background,
      problem,
      objective,
      benefits,
      writingSystematics,
      thinkingFramework,
      academicLevel,
      minReferences,
      minCharacters,
      bibliography
    );
    
    const config = chapterName === 'BAB VI DAFTAR PUSTAKA' 
      ? {} 
      : { tools: [{googleSearch: {}}] };
      
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config
    });
    
    // More robust JSON extraction
    let potentialJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = potentialJson.indexOf('{');
    const lastBrace = potentialJson.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        console.error("Could not find a valid JSON object in the response.", response.text);
        throw new Error("Respons dari AI tidak mengandung format JSON yang valid.");
    }
    
    const jsonString = potentialJson.substring(firstBrace, lastBrace + 1);
    const parsedResult = JSON.parse(jsonString);

    const existingBib = bibliography || [];
    const existingBibCanonical = new Set(existingBib.map(item => getCanonicalString(item.apa)));

    const newUniqueBibItems = (parsedResult.references || []).filter((newItem: BibliographyItem) => {
        if (!newItem.apa || typeof newItem.apa !== 'string') return false;
        const canonical = getCanonicalString(newItem.apa);
        if (!existingBibCanonical.has(canonical)) {
            existingBibCanonical.add(canonical); 
            return true;
        }
        return false;
    });

    return {
      content: parsedResult.chapter_content || '<p>Gagal mengekstrak konten bab dari respons AI.</p>',
      references: newUniqueBibItems,
    };

  } catch (error) {
    console.error("Error generating chapter:", error);
    if (error instanceof SyntaxError) {
        return {
            content: "<p>Terjadi kesalahan saat memproses respons dari AI karena format data tidak sesuai. Silakan coba lagi.</p>",
            references: []
       };
    }
    return {
        content: "<p>Terjadi kesalahan saat mencoba menghasilkan konten. Silakan coba lagi. Pastikan API Key Anda valid dan periksa konsol untuk detailnya.</p>",
        references: []
    };
  }
};


export const suggestStatistic = async (variables: string, dataType: string, objective: string): Promise<StatisticSuggestion> => {
  try {
    const prompt = `
      Anda adalah seorang ahli statistika. Saya sedang melakukan penelitian dengan detail berikut:
      - Variabel Penelitian: ${variables}
      - Jenis Data: ${dataType}
      - Tujuan Analisis: ${objective}

      Tugas Anda adalah memberikan rekomendasi uji statistik yang paling tepat dalam format JSON.
      Pastikan semua penjelasan (seperti 'alasan' dan 'keterangan_simbol') menggunakan bahasa Indonesia yang baku sesuai EYD dan KBBI.
      
      Struktur JSON harus mencakup:
      1.  "uji_statistik": Nama uji statistik yang direkomendasikan.
      2.  "alasan": Penjelasan singkat dan jelas mengapa uji ini cocok.
      3.  "formula": Formula matematis dari uji statistik tersebut.
      4.  "keterangan_simbol": Penjelasan setiap simbol dalam formula.
      5.  "visualisasi" (opsional): Jika relevan, sertakan objek ini untuk memvisualisasikan data hipotetis.
          - "tipe_chart": 'bar' atau 'line'.
          - "data_key": Nama untuk sumbu Y, misal: "Frekuensi" atau "Rata-rata".
          - "data": Array objek. Setiap objek harus punya 'name' (untuk sumbu X) dan 'value' (untuk sumbu Y). Buatlah 3-5 data poin hipotetis yang masuk akal.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            "uji_statistik": { type: Type.STRING },
            "alasan": { type: Type.STRING },
            "formula": { type: Type.STRING },
            "keterangan_simbol": { type: Type.STRING },
            "visualisasi": {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                "tipe_chart": { type: Type.STRING, enum: ['bar', 'line'] },
                "data_key": { type: Type.STRING },
                "data": {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      "name": { type: Type.STRING },
                      "value": { type: Type.NUMBER }
                    },
                    required: ["name", "value"]
                  }
                }
              },
              required: ["tipe_chart", "data_key", "data"]
            }
          },
          required: ["uji_statistik", "alasan", "formula", "keterangan_simbol"]
        },
      },
    });
    
    const parsedJson = JSON.parse(response.text);

    return {
      recommendation: parsedJson.uji_statistik,
      reason: parsedJson.alasan,
      formula: parsedJson.formula,
      symbols: parsedJson.keterangan_simbol,
      visualizationData: parsedJson.visualisasi ? {
        type: parsedJson.visualisasi.tipe_chart,
        data: parsedJson.visualisasi.data,
        dataKey: parsedJson.visualisasi.data_key,
      } : undefined,
    };

  } catch (error) {
    console.error("Error suggesting statistic:", error);
    throw new Error("Terjadi kesalahan saat mencoba merekomendasikan uji statistik. Silakan coba lagi.");
  }
};

export const formatBibliography = async (sourceType: string, details: Record<string, string>): Promise<string> => {
  try {
    const detailsString = Object.entries(details).map(([key, value]) => `- ${key}: ${value}`).join('\n');
    const prompt = `
      Anda adalah seorang ahli pustakawan yang sangat teliti dan spesialis dalam format sitasi APA Edisi ke-7. Tugas Anda adalah memformat informasi sumber berikut menjadi satu entri daftar pustaka yang sempurna.

      Aturan Ketat APA 7 yang HARUS diikuti:
      - **Buku:** Penulis, A. A. (Tahun). *Judul buku*. Penerbit.
      - **Jurnal:** Penulis, A. A., & Penulis, B. B. (Tahun). Judul artikel. *Nama Jurnal, Volume*(Nomor), halaman–halaman.
      - **Situs Web:** Penulis, A. A., atau Nama Grup. (Tahun, Tanggal Bulan). *Judul halaman atau artikel*. Nama Situs. Diakses pada Tanggal Bulan, Tahun, dari URL
      - Perhatikan penggunaan huruf kapital pada judul (hanya huruf pertama kata pertama dan nama diri yang kapital).
      - Perhatikan penggunaan huruf miring (italic) untuk judul buku dan nama jurnal.
      - Pastikan tanda baca (koma, titik, kurung) ditempatkan dengan benar.

      Informasi Sumber:
      - Jenis Sumber: ${sourceType}
      ${detailsString}

      Output HANYA berupa string tunggal hasil format APA 7. Jangan tambahkan penjelasan, label, atau teks lain.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error formatting bibliography:", error);
    return "Terjadi kesalahan saat mencoba memformat daftar pustaka. Silakan coba lagi.";
  }
};

export const humanizeText = async (text: string): Promise<string> => {
  try {
    const prompt = `
      Ulangi penulisan teks berikut dengan gaya akademik manusiawi yang taat pada kaidah Ejaan Yang Disempurnakan (EYD) dan Kamus Besar Bahasa Indonesia (KBBI).
      Pastikan hasilnya berbeda struktur, berbeda diksi, namun makna tetap sama.
      Gunakan variasi kalimat panjang-pendek, sisipkan kata transisi alami, dan hindari pola penulisan khas AI.
      Tulis seolah-olah teks ini berasal dari seorang mahasiswa tingkat akhir yang sedang menyusun karya ilmiahnya.

      PENTING: Jangan menambahkan informasi, opini, pembuka, atau penutup baru. Langsung berikan teks hasil tulisan ulang.

      Teks yang akan diolah:
      "${text}"
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error humanizing text:", error);
    if (error instanceof Error && (error.message.includes('429') || error.message.toLowerCase().includes('quota'))) {
        throw new Error("Batas permintaan API tercapai. Silakan coba lagi setelah beberapa saat.");
    }
    throw new Error("Gagal memparafrasekan teks. Silakan coba lagi.");
  }
};

export const generateHtmlTable = async (description: string): Promise<string> => {
    try {
        const prompt = `
            Anda adalah asisten yang ahli dalam membuat tabel HTML.
            Berdasarkan deskripsi data berikut, buatlah sebuah tabel HTML yang lengkap, terstruktur dengan baik, dan bergaya.

            Deskripsi Data: "${description}"

            Ketentuan WAJIB:
            1.  Gunakan tag HTML standar: \`<table>\`, \`<thead>\`, \`<tbody>\`, \`<tr>\`, \`<th>\`, dan \`<td>\`.
            2.  Buat header (\`<th>\`) yang jelas dan representatif untuk setiap kolom.
            3.  Isi tabel dengan beberapa baris data contoh (hipotetis) yang relevan dengan deskripsi.
            4.  Jangan menyertakan CSS atau atribut \`style\` inline. Cukup struktur HTML murni.
            5.  Respons Anda HARUS hanya berisi kode HTML untuk tabel tersebut. JANGAN sertakan markdown (seperti \`\`\`html\`), penjelasan, atau teks lain di luar tag \`<table>...</table>\`.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.replace(/```html/g, '').replace(/```/g, '').trim();
    } catch (error) {
        console.error("Error generating HTML table:", error);
        throw new Error("Gagal membuat tabel. Silakan coba lagi.");
    }
};

export const generateChartData = async (description: string, chartType?: 'bar' | 'line' | 'pie'): Promise<ChartData> => {
  try {
    const prompt = `
      Anda adalah seorang analis data dan ahli visualisasi. Berdasarkan deskripsi berikut, buatlah data JSON hipotetis yang siap untuk divisualisasikan menggunakan pustaka charting.

      Deskripsi: "${description}"
      ${chartType ? `Tipe bagan yang diminta secara spesifik adalah: '${chartType}'. Anda harus menghasilkan data yang cocok untuk tipe bagan ini.` : ''}

      Tugas Anda adalah menghasilkan struktur JSON yang valid dengan ketentuan WAJIB berikut:
      1.  **chartType**: Tentukan tipe bagan yang paling sesuai. ${chartType ? `Gunakan '${chartType}' sesuai permintaan.` : "Pilih salah satu dari: 'bar', 'line', 'pie'. Jika deskripsi sangat ambigu atau tidak jelas, gunakan 'bar' sebagai default."}
      2.  **dataKey**: Tentukan satu nama kunci (string) untuk nilai data utama. Contoh: "Jumlah Pengguna", "Total Penjualan", "Persentase". Ini adalah label untuk data Anda. Jika tidak ada konteks yang jelas, gunakan "Nilai".
      3.  **data**: Buat sebuah array berisi 4-7 objek data hipotetis. Setiap objek HARUS memiliki:
          - Properti "name": Label untuk setiap titik data (string).
          - Properti "value": Nilai numerik untuk titik data tersebut (number).
          Jika deskripsi ambigu, buatlah data placeholder yang masuk akal, misalnya, "Kategori A", "Kategori B", dll. dengan nilai numerik yang wajar.

      Contoh output untuk deskripsi "Bagan batang penjualan buku per kuartal":
      {
        "chartType": "bar",
        "dataKey": "Penjualan (juta)",
        "data": [
          { "name": "Q1", "value": 50 },
          { "name": "Q2", "value": 75 },
          { "name": "Q3", "value": 60 },
          { "name": "Q4", "value": 90 }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            "chartType": { type: Type.STRING, enum: ['bar', 'line', 'pie'] },
            "dataKey": { type: Type.STRING },
            "data": {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  "name": { type: Type.STRING },
                  "value": { type: Type.NUMBER },
                },
                required: ["name", "value"]
              }
            }
          },
          required: ["chartType", "dataKey", "data"]
        },
      },
    });

    const parsedJson = JSON.parse(response.text);
    return parsedJson as ChartData;

  } catch (error) {
    console.error("Error generating chart data:", error);
    throw new Error("Gagal membuat data bagan. Silakan coba lagi dengan deskripsi yang lebih jelas.");
  }
};

export const generateThinkingFrameworkChart = async (description: string): Promise<ChartData> => {
  try {
    const prompt = `
      Anda adalah seorang asisten peneliti yang ahli dalam metodologi penelitian dan visualisasi data.
      Berdasarkan deskripsi kerangka pemikiran berikut, buatlah data JSON untuk sebuah bagan yang memvisualisasikan alur atau hubungan antar variabel/konsep.

      Deskripsi Kerangka Pemikiran: "${description}"

      Tugas Anda adalah menghasilkan struktur JSON yang valid dengan ketentuan WAJIB berikut:
      1.  **chartType**: Pilih 'bar'. Bagan batang paling cocok untuk menunjukkan pengaruh atau hubungan antar konsep dalam kerangka pemikiran.
      2.  **dataKey**: Tentukan satu nama kunci (string) untuk nilai data. Gunakan "Kekuatan Pengaruh" atau "Hubungan".
      3.  **data**: Buat sebuah array berisi objek data hipotetis yang merepresentasikan hubungan dalam kerangka. Setiap objek HARUS memiliki:
          - Properti "name": Label yang menjelaskan hubungan (contoh: "Variabel X -> Variabel Y").
          - Properti "value": Nilai numerik yang merepresentasikan kekuatan hubungan (gunakan skala 1-10).

      Contoh output untuk deskripsi "Variabel A berpengaruh positif terhadap Variabel B, dan Variabel B berpengaruh positif terhadap Variabel C":
      {
        "chartType": "bar",
        "dataKey": "Kekuatan Pengaruh",
        "data": [
          { "name": "A -> B", "value": 8 },
          { "name": "B -> C", "value": 7 }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            "chartType": { type: Type.STRING, enum: ['bar'] },
            "dataKey": { type: Type.STRING },
            "data": {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  "name": { type: Type.STRING },
                  "value": { type: Type.NUMBER },
                },
                required: ["name", "value"]
              }
            }
          },
          required: ["chartType", "dataKey", "data"]
        },
      },
    });

    const parsedJson = JSON.parse(response.text);
    return parsedJson as ChartData;

  } catch (error) {
    console.error("Error generating thinking framework chart data:", error);
    throw new Error("Gagal membuat data bagan kerangka pemikiran. Coba lagi dengan deskripsi yang lebih jelas.");
  }
};