export default interface Migration {
    up?: String;
    down?: String;
    query: String;
    name: String;
}