
export default function ToggleEncryption({option, setOption}:{option:number, setOption: (selectedOption:number)=>void;}){
    return(
        <div className="mt-4 flex rounded-full justify-self-center bg-neutral-900 border-2 border-indigo-500">
          <button className={`rounded-pill ${option === 1 ? "bg-indigo-500" : "bg-neutral-900"}  text-white rounded-full p-2 cursor-pointer`} onClick={()=>setOption(1)}>encrypt-text</button>
          <button className={`rounded-pill ${option === 2 ? "bg-indigo-500" : "bg-neutral-900"}  text-white rounded-full p-2 cursor-pointer`} onClick={()=>setOption(2)}>decrypt-text</button>
          <button className={`rounded-pill ${option === 3 ? "bg-indigo-500" : "bg-neutral-900"}  text-white rounded-full p-2 cursor-pointer`} onClick={()=>setOption(3)}>encrypt-image</button>
          <button className={`rounded-pill ${option === 4 ? "bg-indigo-500" : "bg-neutral-900"}  text-white rounded-full p-2 cursor-pointer`} onClick={()=>setOption(4)}>decrypt-image</button>
        </div>
    )
}