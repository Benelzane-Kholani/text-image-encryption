'use client'
import { useState } from 'react';
import TextEncryption from './components/textEncryption';
import ToggleEncryption from './components/toggleEncryption';
import './css/home.css';
import Encrypt from './encrypt/page';
import TextDecryption from './components/textDecryption';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<number>(1);

  function handleOption(option:number):void{
    setSelectedOption(option);
  }

  return (
    <div className="container justify-self-center">
            <div className="hero">
              <div className="hero-heading text-zinc-400 text-center mt-8">Securely Encrypt your text and images.</div>
              <Encrypt />
              <ToggleEncryption option={selectedOption} setOption={handleOption}/>
              <div className='mt-2'> 
                <TextEncryption displayOption={selectedOption}/>
                <TextDecryption displayOption={selectedOption}/>
              </div>
            </div>
    </div>
  );
}
