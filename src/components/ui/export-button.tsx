"use client"

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

interface ExportColumn {
    header: string;
    key: string;
}

interface ExportButtonProps {
    data: any[];
    columns: ExportColumn[];
    filename?: string;
    className?: string;
}

export function ExportButton({ data, columns, filename = 'export', className }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            data.map(item => {
                const row: any = {};
                columns.forEach(col => {
                    row[col.header] = item[col.key];
                });
                return row;
            })
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        setIsOpen(false);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        const tableColumn = columns.map(col => col.header);
        const tableRows = data.map(item => {
            return columns.map(col => item[col.key]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 163, 74] } // Green-ish color
        });

        doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 15);
        doc.save(`${filename}.pdf`);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative inline-block text-left", className)}>
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-50">
                    <div className="py-1">
                        <button
                            onClick={handleExportExcel}
                            className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <FileSpreadsheet className="mr-3 h-4 w-4 text-green-600 dark:text-green-500 group-hover:text-green-700 dark:group-hover:text-green-400" />
                            Excel
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <FileText className="mr-3 h-4 w-4 text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400" />
                            PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close on click outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
