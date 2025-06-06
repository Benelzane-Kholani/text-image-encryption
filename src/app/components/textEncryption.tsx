import { useState } from "react"

export default function TextEncryption({displayOption}:{displayOption:number}){

    const [encryptedText, setEncryptedText] = useState<string>('');
    const [plainText, setplainText] = useState<string>('');
    const [encryptionPassword, setEncryptionPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    
    function handlePasswordChange(password:string){
      if(password.trim().length !== 0){
        setPasswordError('');
        setEncryptionPassword(password);
      }
      else{
        setPasswordError('Enter your password to start encryption');
        setEncryptionPassword('');
        setEncryptedText('');
      }
    }
    
    async function encryptUserText(): Promise<void> {
      if(encryptionPassword.trim().length === 0){
        setPasswordError('Enter your password to start encryption');
      }
    else{
      if(plainText.trim().length !== 0){
       const encoder = new TextEncoder();
       const salt = window.crypto.getRandomValues(new Uint8Array(16));
       const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM

       const password = encryptionPassword;
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
        ['encrypt']
      );
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plainText)
      );
      
      
      // Combine salt + iv + ciphertext
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Encode to base64
      const base64 = btoa(String.fromCharCode(...combined));
      setEncryptedText(base64);
      }
    else{
      setEncryptedText('');
    }
  }
}


    function showDisplay():string{
      if(displayOption !== 1){
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
            placeholder="Enter your text to start encryption"
            onChange={(e) => setplainText(e.target.value)}
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
          onClick={encryptUserText}
        >
          encrypt text
        </button>
      </div>
    </div>

    {/* Right Column (Decrypted Output) */}
    <div className="md:w-1/2 border rounded border-indigo-500 text-gray-300 p-2 break-words bg-transparent min-h-[100px]">
      <p>{encryptedText}</p>
    </div>
  </div>
</div>


    )
}