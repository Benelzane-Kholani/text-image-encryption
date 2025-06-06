import { useState, useMemo } from 'react';

// Custom hook for handling image decryption logic
function useImageDecryption() {
    const [decryptionPassword, setDecryptionPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [selectedEncryptedFile, setSelectedEncryptedFile] = useState<File | null>(null); // State to hold the selected encrypted file
    const [decryptedImageUrl, setDecryptedImageUrl] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
    const [decryptionError, setDecryptionError] = useState<string | null>(null);

    // Validates the provided password.
    function validatePassword(password: string): boolean {
        if (!password || password.trim().length === 0) {
            setPasswordError('Please enter a password to start decryption.');
            return false;
        }
        setPasswordError('');
        return true;
    }

    // Handles changes to the decryption password input.
    function handlePasswordChange(password: string) {
        setDecryptionPassword(password);
        validatePassword(password); // Validate as the user types
    }

    // Decrypts the provided encrypted file.
    async function decryptFile(encryptedFile: File) {
        setIsDecrypting(true);
        setDecryptionError(null);
        setDecryptedImageUrl(null);

        try {
            const fileBuffer = await encryptedFile.arrayBuffer();
            const combinedBytes = new Uint8Array(fileBuffer);

            // Ensure the combined bytes have enough length for salt, IV, and some ciphertext
            // Salt (16 bytes) + IV (12 bytes) = 28 bytes minimum header
            if (combinedBytes.length < 28) {
                throw new Error('Invalid encrypted file format: file too short or corrupted.');
            }

            // Extract salt (first 16 bytes), IV (next 12 bytes), and ciphertext
            const salt = combinedBytes.slice(0, 16);
            const iv = combinedBytes.slice(16, 16 + 12);
            const ciphertext = combinedBytes.slice(16 + 12);

            // Derive key from password using PBKDF2 (must match encryption parameters)
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(decryptionPassword),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt'] // Important: specify 'decrypt' usage
            );

            // Decrypt data
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv,
                },
                key,
                ciphertext
            );

            // Create a Blob from the decrypted data.
            // Note: The original MIME type is lost during encryption.
            // We assume it's an image (e.g., PNG). For a robust solution,
            // the original MIME type could be embedded within the encrypted file's metadata.
            const decryptedBlob = new Blob([decryptedBuffer], { type: 'image/png' }); // Defaulting to PNG
            const url = URL.createObjectURL(decryptedBlob);
            setDecryptedImageUrl(url);

         } catch (error: unknown) {
            console.error('Decryption failed:', error);

            let errorMessage = 'Failed to decrypt image.';

            if (error instanceof DOMException) {
                switch (error.name) {
                    case 'OperationError':
                        errorMessage = 'Decryption failed. Incorrect password or corrupted file.';
                        break;
                    case 'DataError':
                        errorMessage = 'Decryption failed. Invalid data format or corrupted file.';
                        break;
                    default:
                        errorMessage = `Decryption error: ${error.message}`;
                        break;
                }
            } else if (error instanceof Error) {
                errorMessage = `Failed to decrypt image: ${error.message}`;
            } else {
                // Fallback for non-standard errors (shouldn't happen often)
                errorMessage = 'An unknown error occurred during decryption.';
            }

            setDecryptionError(errorMessage);
        } finally {
            setIsDecrypting(false);
        }
    }

    // Handles the file input change event, just storing the file.
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        setSelectedEncryptedFile(file || null);
        // Clear previous errors/downloads when a new file is selected
        setDecryptionError(null);
        setDecryptedImageUrl(null);
    }

    // Handles the click of the "Decrypt Image" button.
    async function handleDecryptButtonClick() {
        if (!validatePassword(decryptionPassword)) {
            // Password error is already set by validatePassword
            return;
        }

        if (!selectedEncryptedFile) {
            setDecryptionError('Please select an encrypted file to decrypt.');
            return;
        }

        await decryptFile(selectedEncryptedFile);
    }

    return {
        decryptionPassword,
        handlePasswordChange,
        passwordError,
        selectedEncryptedFile, // Expose selectedEncryptedFile
        decryptedImageUrl,
        handleFileChange,
        handleDecryptButtonClick, // Expose new button handler
        isDecrypting,
        decryptionError
    };
}


export default function ImageDecryption({ displayOption }: { displayOption: number }) {
    const {
        decryptionPassword,
        handlePasswordChange,
        passwordError,
        selectedEncryptedFile, // Get selectedEncryptedFile from hook
        decryptedImageUrl,
        handleFileChange,
        handleDecryptButtonClick, // Get new button handler
        isDecrypting,
        decryptionError
    } = useImageDecryption();

    // The display logic, kept as useMemo for consistency in larger apps
    const showDisplay = useMemo(() => {
        return displayOption !== 4 ? "hidden" : ""; // Assumes displayOption 2 for decryption
    }, [displayOption]);

    return (
        <div className={`decryptionContainer p-4 md:p-6  rounded-lg shadow-lg ${showDisplay}`}>
            <h2 className="text-2xl font-semibold text-white mb-4">Decrypt Image</h2>
            {passwordError && <p className="text-rose-400 text-sm mb-2">{passwordError}</p>}

            {/* Password input */}
            <div className="mb-4">
                <input
                    type="password" // Use type="password" for security
                    placeholder="Decryption password"
                    className="placeholder:text-gray-400 border border-indigo-600 rounded-md p-3 w-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    value={decryptionPassword} // Controlled component
                    onChange={e => handlePasswordChange(e.target.value)}
                    disabled={isDecrypting} // Disable during decryption
                />
            </div>

            {/* File input and Decrypt Image button placed side-by-side */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                <div className='flex-1 border border-indigo-600 rounded-md h-16 flex items-center p-3 bg-gray-700'>
                    <input
                        type="file"
                        accept='.enc, application/octet-stream' // Accept the encrypted file extension
                        onChange={handleFileChange}
                        className="file:mr-4 file:rounded-full file:border-0
                            file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-300
                            file:bg-indigo-600 hover:file:bg-indigo-500 file:transition file:duration-200
                            self-center w-full text-gray-300 cursor-pointer"
                        disabled={isDecrypting} // Disable input during decryption
                    />
                </div>
                <button
                    onClick={handleDecryptButtonClick}
                    className={`rounded-md text-white p-3 font-semibold transition duration-200
                        ${isDecrypting ? 'bg-indigo-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}
                        w-full md:w-auto flex-shrink-0`}
                    disabled={isDecrypting} // Disable button during decryption
                >
                    Decrypt Image
                </button>
            </div>

            {selectedEncryptedFile && <p className="text-gray-400 text-sm mb-4">Selected file: <span className="font-medium text-white">{selectedEncryptedFile.name}</span></p>}


            {/* Decryption status, preview, and download link */}
            <div className='border border-indigo-600 rounded-md p-3 flex flex-col justify-center items-center min-h-[100px]'>
                {isDecrypting && (
                    <p className="text-indigo-400 text-center">Decrypting image... Please wait.</p>
                )}
                {decryptionError && (
                    <p className="text-rose-500 text-center">{decryptionError}</p>
                )}
                {!isDecrypting && !decryptionError && decryptedImageUrl && (
                    <>
                        <p className="mb-2 text-white text-center">Decrypted Image Preview:</p>
                        <img
                            src={decryptedImageUrl}
                            alt="Decrypted"
                            className="max-w-full h-auto rounded-md shadow-lg border border-gray-600 mb-4"
                            style={{ maxHeight: '200px' }} // Limit preview height
                            onError={(e) => {
                                // Fallback for broken image or incorrect type
                                e.currentTarget.src = "https://placehold.co/200x200/374151/D1D5DB?text=Error";
                                e.currentTarget.onerror = null; // Prevent infinite loop
                            }}
                        />
                        <a
                            href={decryptedImageUrl}
                            download="decrypted-image.png" // Suggest PNG download
                            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition duration-200 text-center"
                        >
                            Download Decrypted Image
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
