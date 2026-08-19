import { FileImport, StatusFileImport, StatusFileImportInsert } from "../model/fileimportworker.ts";
import { masterImport } from "../model/masterImport.ts";
import type Migration from "../types/migration";

const migration: Migration[] = [
    {
        name: "create_worker_table",
        query: StatusFileImport + FileImport
    },
    {
        name: "create main table",
        query: masterImport
    },
    {
        name: 'query status import',
        query: StatusFileImportInsert
    }
]

export {migration};