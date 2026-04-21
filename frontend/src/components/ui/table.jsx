import * as React from "react";

const Table = ({ children, className }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full text-sm ${className || ""}`}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="border-b">{children}</thead>
);

const TableBody = ({ children }) => <tbody>{children}</tbody>;

const TableRow = ({ children, className }) => (
  <tr className={`border-b hover:bg-gray-50 ${className || ""}`}>
    {children}
  </tr>
);

const TableHead = ({ children }) => (
  <th className="text-left p-2 font-medium text-gray-600">{children}</th>
);

const TableCell = ({ children }) => (
  <td className="p-2">{children}</td>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};