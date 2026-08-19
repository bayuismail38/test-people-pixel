import { FileImport, StatusFileImport, StatusFileImportInsert } from "../model/fileimportworker.js";
import { masterImport } from "../model/masterImport.js";
import type Migration from "../types/migration.js";

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