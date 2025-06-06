import { useState } from 'react';


export default function TextDecryption({displayOption}:{displayOption:number}){

    const [decryptedText, setDecryptedText] = useState<string>('');
    const [encryptedText, setEncryptedText] = useState<string>('');
    const [encryptionPassword, setEncryptionPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    
    function handlePasswordChange(password:string){
      if(password || password.trim().length !== 0){
        setPasswordError('');
        setEncryptionPassword(password);
      }
      else{
        setPasswordError('Enter your password to start encryption');
      }
    }

  async function decryptUserText(): Promise<void> {

     if(encryptionPassword.trim().length === 0){
        setPasswordError('Enter your password to start encryption');
      }
      else{
        if(!encryptedText || encryptedText.trim().length === 0){
            setDecryptedText('');
        }
        else{
              
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const password = encryptionPassword; // Must match the one used in encryption

  // Decode base64 back to binary
  const binary = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

  // Extract salt (first 16 bytes), IV (next 12 bytes), and ciphertext
  const salt = binary.slice(0, 16);
  const iv = binary.slice(16, 28);
  const data = binary.slice(28);

  // Re-derive the key using PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt the ciphertext
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  setDecryptedText(decoder.decode(decrypted));
        }
      }

}

    function showDisplay():string{
      if(displayOption !== 2){
        return "hidden";
      }
      return "";
    }

    return(
    <div className={`encryptionContainer mt-4 px-2 ${showDisplay()}`}>
  {passwordError.length !== 0 && (
    <p className="text-rose-500 m-1 text-sm">Enter your password to start decryption</p>
  )}

  <div className="flex flex-col md:flex-row gap-4 md:gap-8">
    {/* Left Column */}
    <div className="flex flex-col md:w-1/2">
      {/* Textarea */}
      <div className="mt-4">
        <div className="border border-indigo-500 rounded h-40 md:h-60">
          <textarea
            className="w-full h-full placeholder:text-gray-500 text-gray-300 bg-transparent resize-none p-2 break-words outline-none"
            placeholder="Enter your text to start decryption"
            onChange={(e) => setEncryptedText(e.target.value)}
          />
        </div>
      </div>

      {/* Password + Button */}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <input
          type="text"
          placeholder="encryption password"
          className="flex-1 placeholder:text-gray-500 border-indigo-500 border rounded p-2 text-gray-300 bg-transparent outline-none"
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        <button
          className="bg-indigo-500 text-white p-2 rounded-md"
          onClick={decryptUserText}
        >
          decrypt text
        </button>
      </div>
    </div>

    {/* Right Column (Decrypted Output) */}
    <div className="md:w-1/2 border rounded border-indigo-500 text-gray-300 p-2 break-words bg-transparent min-h-[100px]">
      <p>{decryptedText}</p>
    </div>
  </div>
</div>

    )
}