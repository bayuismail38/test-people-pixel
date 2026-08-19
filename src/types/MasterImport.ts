export interface MasterImport {
    external_id: string;
    author: string | null;
    source: string;
    title: string;
    content: string;
    url: string;
    published_at: Date;
    engagement: number | null;
}

const masterImportDataTransform = (data:any): MasterImport => {
    return {
        external_id: data.external_id,
        source: data.source,
        title: data.title,
        content: data.content,
        author: data.author !== null ? data.author : null,
        url: data.url,
        published_at: new Date(data.published_at),
        engagement: data.engagement !== null ? parseInt(data.engagement) : null,
    };
}
export { masterImportDataTransform };