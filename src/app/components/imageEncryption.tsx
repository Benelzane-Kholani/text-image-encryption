import { useState, useMemo } from 'react';

// Custom hook for handling image encryption logic
function useImageEncryption() {
    const [encryptionPassword, setEncryptionPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // New state to hold the selected file
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
    const [encryptionError, setEncryptionError] = useState<string | null>(null);

    // Validates the provided password.
    function validatePassword(password: string): boolean {
        if (!password || password.trim().length === 0) {
            setPasswordError('Please enter a password to start encryption.');
            return false;
        }
        setPasswordError('');
        return true;
    }

    // Handles changes to the encryption password input.
    function handlePasswordChange(password: string) {
        setEncryptionPassword(password);
        validatePassword(password); // Validate as the user types
    }

    // Encrypts the provided file using AES-GCM.
    async function encryptFile(file: File) {
        setIsEncrypting(true);
        setEncryptionError(null);
        setDownloadUrl(null);

        try {
            const fileBuffer = await file.arrayBuffer();
            const data = new Uint8Array(fileBuffer);

            // Generate salt (16 bytes) and IV (12 bytes) for AES-GCM
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            // Derive key from password using PBKDF2 (Password-Based Key Derivation Function 2)
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(encryptionPassword),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: 100000, // High iteration count for security
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 }, // AES-GCM 256-bit key
                false,
                ['encrypt']
            );

            // Encrypt data using AES-GCM
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv,
                },
                key,
                data
            );

            // Combine salt + iv + ciphertext into a single Uint8Array
            const encryptedBytes = new Uint8Array(encryptedBuffer);
            const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
            combined.set(salt, 0); // Place salt at the beginning
            combined.set(iv, salt.length); // Place IV after salt
            combined.set(encryptedBytes, salt.length + iv.length); // Place ciphertext after IV

            // Create a Blob from the combined data and generate a download URL
            const blob = new Blob([combined], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (error) {
            console.error('Encryption failed:', error);
            setEncryptionError('Failed to encrypt image. Please try again.');
        } finally {
            setIsEncrypting(false);
        }
    }

    // Handles the file input change event, just storing the file.
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
        // Clear previous errors/downloads when a new file is selected
        setEncryptionError(null);
        setDownloadUrl(null);
    }

    // Handles the click of the "Encrypt Image" button.
    async function handleEncryptButtonClick() {
        if (!validatePassword(encryptionPassword)) {
            // Password error is already set by validatePassword
            return;
        }

        if (!selectedFile) {
            setEncryptionError('Please select an image file to encrypt.');
            return;
        }

        await encryptFile(selectedFile);
    }

    return {
        encryptionPassword,
        handlePasswordChange,
        passwordError,
        selectedFile, // Expose selectedFile
        downloadUrl,
        handleFileChange,
        handleEncryptButtonClick, // Expose new button handler
        isEncrypting,
        encryptionError
    };
}


export default function ImageEncryption({ displayOption }: { displayOption: number }) {
    const {
        encryptionPassword,
        handlePasswordChange,
        passwordError,
        selectedFile, // Get selectedFile from hook
        downloadUrl,
        handleFileChange,
        handleEncryptButtonClick, // Get new button handler
        isEncrypting,
        encryptionError
    } = useImageEncryption();

    // The display logic, kept as useMemo for consistency in larger apps, but can be plain function
    const showDisplay = useMemo(() => {
        return displayOption !== 3 ? "hidden" : ""; // Assumes displayOption 1 for encryption
    }, [displayOption]);

    return (
        <div className={`encryptionContainer p-4 md:p-6 rounded-lg shadow-lg ${showDisplay}`}>
            <h2 className="text-2xl font-semibold text-white mb-4">Encrypt Image</h2>
            {passwordError && <p className="text-rose-400 text-sm mb-2">{passwordError}</p>}

            {/* Password input */}
            <div className="mb-4">
                <input
                    type="password" // Use type="password" for security
                    placeholder="Encryption password"
                    className="placeholder:text-gray-400 border border-indigo-600 rounded-md p-3 w-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    value={encryptionPassword} // Controlled component
                    onChange={e => handlePasswordChange(e.target.value)}
                    disabled={isEncrypting} // Disable during encryption
                />
            </div>

            {/* File input and Encrypt Image button placed side-by-side */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                <div className='flex-1 border border-indigo-600 rounded-md h-16 flex items-center p-3 bg-gray-700'>
                    <input
                        type="file"
                        accept='image/*'
                        onChange={handleFileChange}
                        className="file:mr-4 file:rounded-full file:border-0
                            file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-300
                            file:bg-indigo-600 hover:file:bg-indigo-500 file:transition file:duration-200
                            self-center w-full text-gray-300 cursor-pointer"
                        disabled={isEncrypting} // Disable input during encryption
                    />
                </div>
                <button
                    onClick={handleEncryptButtonClick}
                    className={`rounded-md text-white p-3 font-semibold transition duration-200
                        ${isEncrypting ? 'bg-indigo-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}
                        w-full md:w-auto flex-shrink-0`}
                    disabled={isEncrypting} // Disable button during encryption
                >
                    Encrypt Image
                </button>
            </div>

            {selectedFile && <p className="text-gray-400 text-sm mb-4">Selected file: <span className="font-medium text-white">{selectedFile.name}</span></p>}


            {/* Encryption status and download link */}
            <div className='border border-indigo-600 rounded-md p-3 flex flex-col justify-center items-center  min-h-[100px]'>
                {isEncrypting && (
                    <p className="text-indigo-400 text-center">Encrypting image... Please wait.</p>
                )}
                {encryptionError && (
                    <p className="text-rose-500 text-center">{encryptionError}</p>
                )}
                {!isEncrypting && !encryptionError && downloadUrl && (
                    <a
                        href={downloadUrl}
                        download="encrypted-image.enc"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition duration-200 text-center"
                    >
                        Download Encrypted File
                    </a>
                )}
            </div>
        </div>
    );
}
