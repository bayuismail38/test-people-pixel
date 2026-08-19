import ErrorHandler from "./error";

export class ResponseHandler<T extends Record<string, any> | Array<Record<string, any>>> {
    private Data: T | null | undefined;

    constructor(Data: T | null | undefined) {
        this.Data = Data;
    }

    response() {
        try {
            const status = this.Data ? 200 : 404;

            if (this.Data && typeof this.Data === 'object' && !Array.isArray(this.Data)) {
                this.Data = this.mapValue(this.Data) as T;
            }

            return {
                Data: this.Data,
                StatusCode: status,
                StatusMessage: status === 200 ? "Sukses" : "Not Found",
            };
        } catch (error) {
            throw new ErrorHandler("Error", "Mapping Response", 500);
        }
    }

    responses() {
        try {
            const status = Array.isArray(this.Data) && this.Data.length > 0 ? 200 : 404;
            this.Data = Array.isArray(this.Data)
                ? this.Data.map(row => this.mapValue(row)) as T
                : (this.Data as T);

            return {
                Data: this.Data,
                StatusCode: status,
                StatusMessage: status === 200 ? "Sukses" : "Not Found",
            };
        } catch (error) {
            throw new ErrorHandler("Error", "Mapping Responses", 500);
        }
    }

    private mapValue(obj: Record<string, any>): Record<string, any> {
        const newObj: Record<string, any> = {};

        for (const key in obj) {
            const val = obj[key];

            if (typeof val === "bigint") {
                newObj[key] = Number(val);
            } else if (Array.isArray(val)) {
                newObj[key] = val.map(item =>
                    typeof item === "object" && item !== null ? this.mapValue(item) : item
                );
            } else if (typeof val === "object" && val !== null && !(val instanceof Date)) {
                newObj[key] = this.mapValue(val);
            } else {
                newObj[key] = val;
            }
        }

        return newObj;
    }
}
