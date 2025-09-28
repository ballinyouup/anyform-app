"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Download, ExternalLink } from "lucide-react"

interface FileViewerProps {
    file: {
        name: string
        url: string
        type: string
        size?: number
    }
    className?: string
}

export function FileViewer({ file, className }: FileViewerProps) {
    const [error, setError] = useState<string | null>(null)

    const getFileType = (filename: string, mimeType?: string) => {
        const extension = filename.split(".").pop()?.toLowerCase()

        if (mimeType) {
            if (mimeType.startsWith("image/")) return "image"
            if (mimeType.startsWith("video/")) return "video"
            if (mimeType.startsWith("audio/")) return "audio"
            if (mimeType.startsWith("text/")) return "text"
            if (mimeType === "application/pdf") return "pdf"
        }

        // Fallback to extension-based detection
        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) return "image"
        if (["mp4", "webm", "ogg", "avi", "mov"].includes(extension || "")) return "video"
        if (["mp3", "wav", "ogg", "aac", "m4a"].includes(extension || "")) return "audio"
        if (["txt", "md", "json", "xml", "csv", "log"].includes(extension || "")) return "text"
        if (extension === "pdf") return "pdf"

        return "unknown"
    }

    const fileType = getFileType(file.name, file.type)

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return ""
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = file.url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleOpenExternal = () => {
        window.open(file.url, "_blank")
    }

    const renderFileContent = () => {
        switch (fileType) {
            case "image":
                return (
                    <div className="flex justify-center">
                        <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            className="max-w-full max-h-96 object-contain rounded-md"
                            onError={() => setError("Failed to load image")}
                        />
                    </div>
                )

            case "video":
                return (
                    <video controls className="w-full max-h-96 rounded-md" onError={() => setError("Failed to load video")}>
                        <source src={file.url} type={file.type} />
                        Your browser does not support the video tag.
                    </video>
                )

            case "audio":
                return (
                    <div className="flex flex-col items-center space-y-4 py-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <audio controls className="w-full max-w-md" onError={() => setError("Failed to load audio")}>
                            <source src={file.url} type={file.type} />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )

            case "pdf":
                return (
                    <div className="w-full h-96">
                        <iframe
                            src={file.url}
                            className="w-full h-full border-0 rounded-md"
                            title={file.name}
                            onError={() => setError("Failed to load PDF")}
                        />
                    </div>
                )

            case "text":
                return <TextFileViewer url={file.url} onError={setError} />

            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-muted-foreground">Preview not available for this file type</p>
                        <p className="text-sm text-muted-foreground mt-1">Use the download option to view the file</p>
                    </div>
                )
        }
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-destructive font-medium">{error}</p>
                        <p className="text-sm text-muted-foreground mt-1">Try downloading the file instead</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardContent className="p-6">
                {/* File Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {fileType.charAt(0).toUpperCase() + fileType.slice(1)} file
                            {file.size && ` • ${formatFileSize(file.size)}`}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Options
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleOpenExternal}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in new tab
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* File Content */}
                <div className="border rounded-md overflow-hidden">{renderFileContent()}</div>
            </CardContent>
        </Card>
    )
}

// Text file viewer component
function TextFileViewer({ url, onError }: { url: string; onError: (error: string) => void }) {
    const [content, setContent] = useState<string>("")
    const [loading, setLoading] = useState(true)

    useState(() => {
        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch file")
                return response.text()
            })
            .then((text) => {
                setContent(text)
                setLoading(false)
            })
            .catch(() => {
                onError("Failed to load text file")
                setLoading(false)
            })
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-4 bg-muted/50 rounded-md max-h-96 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">{content}</pre>
        </div>
    )
}
