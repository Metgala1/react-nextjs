"use client"
import { useState } from 'react';

export default function DownloadTest() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleDownload() {
        try {
            // Reset error message on new attempt
            setErrorMessage(null);
            
            const response = await fetch("http://localhost:3000/api/files/invoice");

            if (!response.ok) {
                const errorData = await response.json();
                // Set the error message to state so it displays in the UI
                setErrorMessage(errorData.message || errorData.error);
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = "video.mp4";
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch(err) {
            setErrorMessage("An unexpected network error occurred.");
        }
    }

    return (
        <div>
            <h3>Download video</h3>
            <button onClick={handleDownload}>Download</button>
            
            {/* Conditionally render the error message */}
            {errorMessage && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                    {errorMessage}
                </p>
            )}
        </div>
    );
}