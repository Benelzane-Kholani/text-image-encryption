import './css/home.css';
import Encrypt from './encrypt/page';

export default function Home() {
  return (
    <div className="container justify-self-center">
            <div className="hero">
              <div className="hero-heading text-zinc-400 text-center mt-8">Securely Encrypt your text and images.</div>
              <div className='text-center mt-2'> 
                <Encrypt />
              </div>
            </div>
    </div>
  );
}
