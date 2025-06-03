import { useState } from "react"

export default function TextEncryption({displayOption}:{displayOption:number}){

    const [encryptedText, setEncryptedText] = useState<string>('');


  async function encryptUserText(text: string): Promise<void> {
    if(!text || text.trim().length === 0){
      setEncryptedText('');
    }
    else{
       const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM

  const password = 'your-password';
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
    encoder.encode(text)
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
 
}

    function showDisplay():string{
      if(displayOption !== 1){
        return "hidden";
      }
      return "";
    }

    return(
      <div className={`flex mt-6 gap-2 ${showDisplay()}`}>
        <div className='w-1/2 border border-indigo-500 rounded h-40'>
        <textarea className="w-full h-full placeholder:text-gray-500
        text-gray-400 resize-none  p-2 break-words"
        placeholder="enter your text to start encryption"
        onChange={e => encryptUserText(e.target.value)}
     />
     </div>

  <div className='w-1/2 border rounded border-indigo-500 text-gray-400 p-2'>
    <p className="break-words">{encryptedText}</p>
  </div>
</div>

    )
}