import { ReactNode } from "react";

// Props for Table
type TableProps = React.ComponentPropsWithoutRef<"table"> & {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
};

// Props for TableHeader
type TableHeaderProps = React.ComponentPropsWithoutRef<"thead"> & {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
};

// Props for TableBody
type TableBodyProps = React.ComponentPropsWithoutRef<"tbody"> & {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
};

// Props for TableRow
type TableRowProps = React.ComponentPropsWithoutRef<"tr"> & {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
};

// Props for TableCell
type TableCellProps = (React.ComponentPropsWithoutRef<"td"> & {
  children?: ReactNode; // Cell content
  isHeader?: false;
  className?: string; // Optional className for styling
}) | (React.ComponentPropsWithoutRef<"th"> & {
  children?: ReactNode;
  isHeader: true;
  className?: string;
});

// Table Component
const Table: React.FC<TableProps> = ({ children, className = "", ...rest }) => {
  return (
    <table className={`min-w-full ${className}`} {...rest}>
      {children}
    </table>
  );
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className = "", ...rest }) => {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className = "", ...rest }) => {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className = "", ...rest }) => {
  return (
    <tr className={className} {...rest}>
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({ children, isHeader = false, className = "", ...rest }) => {
  const CellTag = (isHeader ? "th" : "td") as any;
  return (
    <CellTag className={className} {...rest}>
      {children ? children : null}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
