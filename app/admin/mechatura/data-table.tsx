"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Users } from "lucide-react"

interface DataTableProps<TData, TValue>{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>){
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
            <table className="w-full min-w-[850px] text-left text-sm border-separate [border-spacing:0_4px]">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="bg-zinc-900/70 border border-zinc-800/80 shadow-sm">
                            {headerGroup.headers.map((header, idx) => (
                                <th
                                    key={header.id}
                                    className={`h-10 px-4 text-xs font-normal text-zinc-400 whitespace-nowrap border-y border-zinc-800/80 ${
                                        idx === 0 ? "rounded-l-xl border-l border-zinc-800/80" : ""
                                    } ${
                                        idx === headerGroup.headers.length - 1 ? "rounded-r-xl border-r border-zinc-800/80 text-right" : ""
                                    }`}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-transparent">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="group transition-colors hover:bg-zinc-900/40"
                            >
                                {row.getVisibleCells().map((cell, idx) => (
                                    <td
                                        key={cell.id}
                                        className={`px-4 py-3.5 align-middle border-b border-zinc-800/40 first:rounded-l-lg last:rounded-r-lg ${
                                            idx === row.getVisibleCells().length - 1 ? "text-right" : ""
                                        }`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="h-36 text-center text-zinc-500 py-10">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Users className="h-5 w-5 text-zinc-600" />
                                    <span className="text-sm">Tidak ada tim Mechatura yang cocok dengan filter saat ini.</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
