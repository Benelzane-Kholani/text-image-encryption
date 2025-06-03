import { useState } from 'react';


export default function TextDecryption({displayOption}:{displayOption:number}){

    const [decryptedText, setDecryptedText] = useState<string>('');
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

  async function decryptUserText(base64: string): Promise<void> {

     if(encryptionPassword.trim().length === 0){
        setPasswordError('Enter your password to start encryption');
      }
      else{
        if(!base64 || base64.trim().length === 0){
            setDecryptedText('');
        }
        else{
              const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const password = encryptionPassword; // Must match the one used in encryption

  // Decode base64 back to binary
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

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
     <div className={`encryptionContainer mt-4 ${showDisplay()}`}>
        <div className="encryptionPassword">
         {passwordError.length !== 0? <p className="text-rose-900 m-1">Enter your password to start encryption</p> : ""}
        <input type="text" placeholder="encryption password"
         className="placeholder:text-gray-500 border
          border-indigo-500 rounded p-2 w-1/3 text-gray-400"
          onChange={e => handlePasswordChange(e.target.value)}
          />
      </div>
      <div className={`flex mt-6 gap-2`}>
        <div className='w-1/2 border border-indigo-500 rounded h-40'>
        <textarea className="w-full h-full placeholder:text-gray-500
        text-gray-400 resize-none  p-2 break-words"
        placeholder="enter your encrypted text to start decryption"
        onChange={e => decryptUserText(e.target.value)}
     />
     </div>

     <div className='w-1/2 border rounded border-indigo-500 text-gray-400 p-2'>
      <p className="break-words">{decryptedText}</p>
     </div>
     </div>
     </div>
    )
}