declare module "react-barcode" {
  import React from "react";

  export interface BarcodeProps {
    value: string;
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontOptions?: string;
    font?: string;
    fontSize?: number;
    textAlign?: string;
    textPosition?: string;
    textMargin?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    className?: string;
    flat?: boolean;
  }

  const Barcode: React.FC<BarcodeProps>;
  export default Barcode;
}
