
export default function ToggleEncryption(){
    return(
        <div className="mt-4 flex rounded-full justify-self-center bg-neutral-900 border border-indigo-500">
          <button className="rounded-pill bg-indigo-500 text-white rounded-full p-2 cursor-pointer">encrypt-text</button>
          <button className="rounded-pill bg-neutral-900 text-white rounded-full p-2 cursor-pointer">decrypt-text</button>
          <button className="rounded-pill bg-neutral-900 text-white rounded-full p-2 cursor-pointer">encrypt-image</button>
          <button className="rounded-pill bg-neutral-900 text-white rounded-full p-2 cursor-pointer">decrypt-image</button>
        </div>
    )
}