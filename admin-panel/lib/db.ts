
import fs from 'fs';
import path from 'path';
import { Temple, Poonam, Grahan } from './types';

type DBData = {
    temples: Temple[];
    poonams: Poonam[];
    grahans: Grahan[];
};

class PersistentDB {
    private dataFilePath: string;
    public data: DBData;

    constructor() {
        this.dataFilePath = path.join(process.cwd(), 'data', 'db.json');
        this.data = { temples: [], poonams: [], grahans: [] };
        this.ensureDataDir();
        this.load();
    }

    private ensureDataDir() {
        const dir = path.dirname(this.dataFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    private load() {
        if (fs.existsSync(this.dataFilePath)) {
            const fileContent = fs.readFileSync(this.dataFilePath, 'utf-8');
            try {
                this.data = JSON.parse(fileContent);
            } catch (error) {
                console.error('Failed to parse DB file:', error);
                this.write(); // Overwrite with default if corrupt
            }
        } else {
            // Seed Initial Data if empty
            this.data.temples = [
                {
                    id: '1',
                    name: 'Shree Somnath Jyotirlinga',
                    description: 'First among the twelve Aadi Jyotirlingas of India.',
                    location: 'Gujarat',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Somnath_Mandir_Veraval_Gujarat_India_02.jpg/800px-Somnath_Mandir_Veraval_Gujarat_India_02.jpg',
                    activeContentTypes: ['morningAarti', 'eveningAarti', 'morningDarshan', 'eveningDarshan'],
                    videos: {}
                },
                {
                    id: '2',
                    name: 'Shree Dwarkadhish Temple',
                    description: 'Hindu temple dedicated to the god Krishna.',
                    location: 'Dwarka, Gujarat',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Dwarkadhish_Temple_Dwarka_Gujarat.jpg/800px-Dwarkadhish_Temple_Dwarka_Gujarat.jpg',
                    activeContentTypes: ['morningDarshan', 'eveningDarshan'],
                    videos: {}
                }
            ];
            this.write();
        }
    }

    public write() {
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2));
    }

    // Accessors ensuring latest data is returned (though in SINGLE process it's same ref)
    // Serverless environments might benefit from reload, but for local dev this is fine.

    get temples() { return this.data.temples; }
    set temples(val: Temple[]) { this.data.temples = val; this.write(); }

    get poonams() { return this.data.poonams; }
    set poonams(val: Poonam[]) { this.data.poonams = val; this.write(); }

    get grahans() { return this.data.grahans; }
    set grahans(val: Grahan[]) { this.data.grahans = val; this.write(); }
}

// Singleton Instance
export const db = new PersistentDB();
