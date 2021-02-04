import {useEffect, useState } from "react"
import web3 from "../utils/infura";
import {scanBlockRange} from '../utils/scanner'
import { useLatest } from 'react-use';
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
function useScanner (wallets:any){

    const [scanning,setScanning] = useState<boolean>(false);

    const [progress,setProgress] = useState<any>(0);
    const [currentBlock,setCurrentBlock] = useState<Number>(0);
    const [result,setResult] = useState<any>([]);
    const latestResult = useLatest(result);
    const latestCurrentBlock = useLatest(currentBlock);

    function onFoundTx(tx){
        const newResult = [tx,...latestResult.current]
        const filterDuplicate = newResult.filter((v,i,a)=>a.findIndex(t=>(t.hash === v.hash))===i)
        setResult(filterDuplicate)
    }

    useEffect(()=>{
        function onFinish(e:any,stopBlock:any){
            setScanning(false)
            setCurrentBlock(stopBlock)
        }
    
        function onProgress(currentBlock:any,progress:any){
            if(progress){
                setProgress(progress)
            }
            setCurrentBlock(currentBlock)
        }

        if(!scanning){
            web3.eth.getBlockNumber()
            .then(function(i){
                sleep(3000).then(()=>{
                    const currentBlock = latestCurrentBlock.current >0?latestCurrentBlock.current:i-7000
                    setScanning(true)
                    const optimizeWallets = wallets.map(e=>{
                        return e.toLowerCase()
                    })
                    // console.log(optimizeWallets)
                    scanBlockRange(optimizeWallets,currentBlock,i,onFoundTx,onProgress,onFinish)
                })
            });
         
        }
    },[scanning])

    return {
        scanning,
        progress,
        currentBlock,
        result,
    }
}
export default useScanner