import Papa from 'papaparse';

export interface Disease {
  Disease_ID: string;
  OMIM_ID: string;
  Disease_Name: string;
}

export interface Drug {
  Drug_ID: string;
  DrugBank_ID: string;
  Name: string;
}

let cachedDiseases: Disease[] | null = null;
let cachedDrugs: Drug[] | null = null;

export async function fetchDiseases(): Promise<Disease[]> {
  if (cachedDiseases) return cachedDiseases;

  try {
    const response = await fetch('/disease_dict.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<any>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped = results.data.map((row: any) => ({
            Disease_ID: row.ID,
            OMIM_ID: row.OMIM_ID,
            Disease_Name: row.Name,
          }));
          cachedDiseases = mapped;
          resolve(mapped);
        },
        error: (error: Error) => {
          console.error('Error parsing diseases CSV:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Failed to fetch diseases:', error);
    return [];
  }
}

export async function fetchDrugs(): Promise<Drug[]> {
  if (cachedDrugs) return cachedDrugs;

  try {
    const response = await fetch('/drug_dict.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<any>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped = results.data.map((row: any) => ({
            Drug_ID: row.ID,
            DrugBank_ID: row.DrugBank_ID,
            Name: row.Name,
          }));
          cachedDrugs = mapped;
          resolve(mapped);
        },
        error: (error: Error) => {
          console.error('Error parsing drugs CSV:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Failed to fetch drugs:', error);
    return [];
  }
}
