"use client"

import { useRef, useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { CheckCircle2, XCircle } from "lucide-react"
import { useVerifySeminarRegistrationMutation } from "@/hooks/mutations/use-admin-mutations"

const hasRawValue = (value: unknown): value is { rawValue: string } =>
    typeof value === "object" &&
    value !== null &&
    "rawValue" in value &&
    typeof value.rawValue === "string"

export default function ScannerPage() {
    const verifyRegistration = useVerifySeminarRegistrationMutation()
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string } | null>(null)
    const isScanningRef = useRef(false)
    const lastScannedIdRef = useRef<string | null>(null)

    async function onScanSuccess(decodedText: string) {
        if (isScanningRef.current || decodedText === lastScannedIdRef.current) return

        isScanningRef.current = true
        lastScannedIdRef.current = decodedText
        setScanResult(null)

        try {
            const data = await verifyRegistration.mutateAsync({ registration_id: decodedText })
            setScanResult({ success: true, message: "Successfully checked in!", name: data.participant.nama_lengkap })
        } catch (error) {
            setScanResult({
                success: false,
                message: error instanceof Error ? error.message : "Network error. Please try again.",
            })
        } finally {
            isScanningRef.current = false
            // Clear last scanned ID after 3 seconds to allow rescanning if needed
            setTimeout(() => {
                lastScannedIdRef.current = null
            }, 3000)
        }
    }

    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="space-y-4 mb-8 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    QR Scanner
                </h1>
                <p className="text-muted-foreground">
                    Scan participant QR codes to verify registration and check them in.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 mb-8 overflow-hidden max-w-sm mx-auto">
                <Scanner
                    onScan={(result) => {
                        if (Array.isArray(result) && result.length > 0) {
                            onScanSuccess(result[0].rawValue)
                        } else if (hasRawValue(result)) {
                            onScanSuccess(result.rawValue)
                        } else if (typeof result === 'string') {
                            onScanSuccess(result)
                        }
                    }}
                    onError={(error) => {
                        console.error("Scanner Error:", error)
                    }}
                    allowMultiple={true}
                />
            </div>

            {scanResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 border ${scanResult.success ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    {scanResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                        <p className="font-semibold">{scanResult.message}</p>
                        {scanResult.name && (
                            <p className="text-sm mt-1">{scanResult.name}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
