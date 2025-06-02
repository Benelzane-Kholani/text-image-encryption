
import { useState } from "react"

export default function TextEncryption(){

    const [encryptedText, setEncryptedText] = useState<string>('');

    async function encryptUserText(text: string) {
      if(!text || text.trim().length === 0){
        setEncryptedText('');
      }
      else{
            const password = 'your-password';
    const encoder = new TextEncoder();

    // Derive a key from the password
    const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(text)
  );

  const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]);
  setEncryptedText(btoa(String.fromCharCode(...combined))); // Base64 encoded
      }

}


    return(
        <div className='flex mt-6 gap-2'>
  <div className='w-1/2 border border-indigo-500
       rounded h-40'>
    <textarea
      className="w-full h-full placeholder:text-gray-500
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