import fs from 'fs';
import path from 'path';
import { Temple, Poonam, Grahan } from './types';

/* ----------------------------- TYPES ----------------------------- */

type DBData = {
  temples: Temple[];
  poonams: Poonam[];
  grahans: Grahan[];
};

/* ------------------------- DEFAULT DATA -------------------------- */

const DEFAULT_DATA: DBData = {
  temples: [
    {
      id: '1',
      name: 'Shree Somnath Jyotirlinga',
      nameHindi: 'श्री सोमनाथ ज्योतिर्लिंग',
      description: 'First among the twelve Aadi Jyotirlingas of India.',
      descriptionHindi: 'भारत के बारह आदि ज्योतिर्लिंगों में से पहला।',
      location: 'Gujarat',
      locationHindi: 'गुजरात',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Somnath_Mandir_Veraval_Gujarat_India_02.jpg/800px-Somnath_Mandir_Veraval_Gujarat_India_02.jpg',
      activeContentTypes: [
        'morningAarti',
        'eveningAarti',
        'morningDarshan',
        'eveningDarshan',
      ],
      videos: {},
    },
    {
      id: '2',
      name: 'Shree Dwarkadhish Temple',
      nameHindi: 'श्री द्वारकाधीश मंदिर',
      description: 'Hindu temple dedicated to the god Krishna.',
      descriptionHindi: 'भगवान कृष्ण को समर्पित हिंदू मंदिर।',
      location: 'Dwarka, Gujarat',
      locationHindi: 'द्वारका, गुजरात',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Dwarkadhish_Temple_Dwarka_Gujarat.jpg/800px-Dwarkadhish_Temple_Dwarka_Gujarat.jpg',
      activeContentTypes: ['morningDarshan', 'eveningDarshan'],
      videos: {},
    },
  ],
  poonams: [],
  grahans: [],
};

/* ------------------------ DB CLASS ------------------------------- */

class PersistentDB {
  private filePath: string;
  private data: DBData;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'db.json');
    this.ensureDir();
    this.data = this.load();
  }

  /* ----------------------- FILE SYSTEM --------------------------- */

  private ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): DBData {
    if (!fs.existsSync(this.filePath)) {
      this.atomicWrite(DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);

      return {
        temples: Array.isArray(parsed.temples)
          ? parsed.temples
          : DEFAULT_DATA.temples,
        poonams: Array.isArray(parsed.poonams)
          ? parsed.poonams
          : [],
        grahans: Array.isArray(parsed.grahans)
          ? parsed.grahans
          : [],
      };
    } catch (err) {
      console.error('❌ DB corrupted. Resetting...', err);
      this.atomicWrite(DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  private atomicWrite(data: DBData) {
    const tempPath = this.filePath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  private save() {
    this.atomicWrite(this.data);
  }

  /* ------------------------- ACCESSORS --------------------------- */

  get temples(): Temple[] {
    return this.data.temples;
  }

  set temples(val: Temple[]) {
    this.data.temples = val;
    this.save();
  }

  get poonams(): Poonam[] {
    return this.data.poonams;
  }

  set poonams(val: Poonam[]) {
    this.data.poonams = val;
    this.save();
  }

  get grahans(): Grahan[] {
    return this.data.grahans;
  }

  set grahans(val: Grahan[]) {
    this.data.grahans = val;
    this.save();
  }
}

/* ------------------------- SINGLETON ----------------------------- */

// Prevent multiple instances in Next.js dev / hot reload
const globalDB = globalThis as unknown as { db?: PersistentDB };

export const db =
  globalDB.db ??
  (() => {
    const instance = new PersistentDB();
    globalDB.db = instance;
    return instance;
  })();
