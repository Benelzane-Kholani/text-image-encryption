import Link from "next/link";
import './../css/navBar.css';

export default function NavBar(){
    return(
        <div className="flex border-b-1 border-indigo-500 bg-neutral-900">
            <div className="p-2"><Link href={"/"} className="text-zinc-300 navBarLogo">TextImageEncryption</Link></div>
            <div className="flex-2 flex gap-9 justify-end p-2">
                <Link href={"#"} className="text-zinc-300 self-center nav-link">encrypt-image</Link>
                <Link href={"#"} className="text-zinc-300 self-center nav-link">encrypt-text</Link>
                <Link href={"#"} className="text-zinc-300 self-center nav-link">help</Link>
                <Link href={"#"} className="text-zinc-300 self-center nav-link">about</Link>
            </div>
        </div>
    )
}