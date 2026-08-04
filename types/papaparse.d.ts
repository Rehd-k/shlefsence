declare module "papaparse" {
  export interface UnparseConfig {
    quotes?: boolean | boolean[];
    quoteChar?: string;
    escapeChar?: string;
    delimiter?: string;
    header?: boolean;
    newline?: string;
    skipEmptyLines?: boolean | "greedy";
    columns?: string[];
  }

  export function unparse(
    data: Array<Object> | Array<Array<any>> | { fields: string[]; data: any[] },
    config?: UnparseConfig
  ): string;

  export function parse(csvString: string, config?: any): any;

  const Papa: {
    unparse: typeof unparse;
    parse: typeof parse;
  };

  export default Papa;
}
