
import web3 from './infura'
import abiDecoder from './decode'
import TokenAbi from '../abi/TokenAbi';
import { format } from 'date-fns'
// const wallet = '0x7Ed2cde6441191169fbD9a40e305727F61925174'; // change this to your Ethereum account number

const maxThreads = 200;

function scanTransactionCallback(wallets,txn, block,onFoundTx) {

//    console.log(JSON.stringify(block, null, 4));
//    console.log(JSON.stringify(txn, null, 4));
    // console.log(txn.to)
    // console.log(txn.from)
    if (wallets.includes(txn?.to?.toLowerCase())||wallets.includes(txn?.from?.toLowerCase())) {

        // A transaction credited ether into this wallet
        var ether = web3.utils.fromWei(txn.value, 'ether');
        // console.log(`\r${txn.hash} +${ether} from ${txn.from}`);
        const inputDecode = abiDecoder.decodeMethod(txn.input)
        if(inputDecode && inputDecode.name.includes('swap')){
            txn.inputDecode = inputDecode
            const {params} = inputDecode ||{}
            const address = params?.filter(e=>{
                return e.name==='path'
            })?.[0]||0
            //input
            const amountIn = params?.filter(e=>{
                return e.name==='amountIn'
            })?.[0]||{}
        
            const amountInValue = amountIn?.value||txn?.value ||0
            const addressIn = address?.value?.[0]||{}

            //output
            const amountOut  = params?.filter(e=>{
                return e.name==='amountOutMin' ||e.name==='amountOut'
            })?.[0]||{}
            const amountOutValue = amountOut?.value||0
            const addressOut = address?.value?.[address?.value?.length-1]||{}
      
            txn.addressIn = addressIn
            txn.amountInValue = amountInValue

            txn.addressOut = addressOut
            txn.amountOutValue = amountOutValue
            const contract =  new web3.eth.Contract(TokenAbi, addressIn)
            contract.methods.symbol().call().then(symbol=>{
                txn.symbolIn = symbol
                contract.methods.decimals().call().then(decimals=>{
                    txn.decimalsIn = parseInt(decimals)
                    contract.methods.name().call().then(name=>{
                        txn.nameTokenIn = name
                        const contract =  new web3.eth.Contract(TokenAbi, addressOut)
                        contract.methods.name().call().then(name=>{
                            txn.nameTokenOut = name
                            contract.methods.symbol().call().then(symbol=>{
                                txn.symbolOut = symbol
                                contract.methods.decimals().call().then(decimals=>{
                                    txn.decimalsOut = parseInt(decimals)
                                    web3.eth.getBlock(txn.blockNumber).then(block=>{
                                        txn.timestamp = block.timestamp
                                        txn.timeStampString = format(txn.timestamp*1000, 'HH:mm:ss MM/dd/yyyy')
                                        onFoundTx(txn)
                                    })
                                })
                            })
                        })
                    })
                })
            })
        }
        
    } 
    // else if (wallets.includes(txn.from)) {

    //     // A transaction debitted ether from this wallet
    //     var ether = web3.utils.fromWei(txn.value, 'ether');
    //     console.log(`\r${block.timestamp} -${ether} to ${txn.to}`);
    //     const inputDecode = abiDecoder.decodeMethod(txn.input)
    //     if(inputDecode && inputDecode.name.includes('swap')){
    //         txn.inputDecode = inputDecode
    //         const {params} = inputDecode ||{}
    //         const address = params?.filter(e=>{
    //             return e.name==='path'
    //         })?.[0]||0
    //         //input
    //         const amountIn = params?.filter(e=>{
    //             return e.name==='amountIn'
    //         })?.[0]||{}
        
    //         const amountInValue = amountIn?.value||txn?.value ||0
    //         const addressIn = address?.value?.[0]||{}

    //         //output
    //         const amountOut  = params?.filter(e=>{
    //             return e.name==='amountOutMin' ||e.name==='amountOut'
    //         })?.[0]||{}
    //         const amountOutValue = amountOut?.value||0
    //         const addressOut = address?.value?.[address?.value?.length-1]||{}
      
    //         txn.addressIn = addressIn
    //         txn.amountInValue = amountInValue

    //         txn.amountOut = amountOut
    //         txn.amountOutValue = amountOutValue
    //         const contract =  new web3.eth.Contract(TokenAbi, addressIn)
    //         contract.methods.symbol().call().then(symbol=>{
    //             txn.symbolIn = symbol
    //             contract.methods.decimals().call().then(decimals=>{
    //                 txn.decimalsIn = parseInt(decimals)
    //                 const contract =  new web3.eth.Contract(TokenAbi, addressOut)
    //                 contract.methods.symbol().call().then(symbol=>{
    //                     txn.symbolOut = symbol
    //                     contract.methods.decimals().call().then(decimals=>{
    //                         txn.decimalsOut = parseInt(decimals)
    //                         web3.eth.getBlock(txn.blockNumber).then(block=>{
    //                             txn.timestamp = block.timestamp
    //                             txn.timeStampString = format(txn.timestamp, 'hh:mm MM/dd/yyyy')
    //                             onFoundTx(txn)
    //                         })
    //                     })
    //                 })
    //             })
    //         })
    //     }
    // }
}


function scanBlockCallback(wallets,block,onFoundTx) {

    if (block.transactions) {
        for (var i = 0; i < block.transactions.length; i++) {
            var txn = block.transactions[i];
            scanTransactionCallback(wallets,txn, block,onFoundTx);
        }
    }
}


export function scanBlockRange(wallets,startingBlock, stoppingBlock, onFoundTx,onProgress, finishCallback) {

    // If they didn't provide an explicit stopping block, then read
    // ALL of the blocks up to the current one.

    if (typeof stoppingBlock === 'undefined') {
        stoppingBlock = web3.eth.blockNumber;
    }

    // If they asked for a starting block that's after the stopping block,
    // that is an error (or they're waiting for more blocks to appear,
    // which hasn't yet happened).

    if (startingBlock > stoppingBlock) {
        return -1;
    }

    let blockNumber = startingBlock,
        gotError = false,
        numThreads = 0,
        startTime = new Date();

    function getPercentComplete(bn) {
        var t = stoppingBlock - startingBlock,
            n = bn - startingBlock;
        return Math.floor(n / t * 100, 2);
    }

    function exitThread() {
        if (--numThreads == 0) {
            var numBlocksScanned = 1 + stoppingBlock - startingBlock,
                stopTime = new Date(),
                duration = (stopTime.getTime() - startTime.getTime())/1000,
                blocksPerSec = Math.floor(numBlocksScanned / duration, 2),
                msg = `Scanned to block ${stoppingBlock} (${numBlocksScanned} in ${duration} seconds; ${blocksPerSec} blocks/sec).`
                // numSpaces = process.stdout.columns - len,
                // spaces = Array(1+numSpaces).join(" ");

                // console.log("\r"+msg+"\n");
            if (finishCallback) {
                finishCallback(gotError, stoppingBlock);
            }
        }
        return numThreads;
    }

    function asyncScanNextBlock() {

        // If we've encountered an error, stop scanning blocks
        if (gotError) {
            return exitThread();
        }

        // If we've reached the end, don't scan more blocks
        if (blockNumber > stoppingBlock) {
            return exitThread();
        }

        // Scan the next block and assign a callback to scan even more
        // once that is done.
        var myBlockNumber = blockNumber++;

        // Write periodic status update so we can tell something is happening
        if (myBlockNumber % maxThreads == 0 || myBlockNumber == stoppingBlock) {
            var pctDone = getPercentComplete(myBlockNumber);
            // console.log(`\rScanning block ${myBlockNumber} - ${pctDone} %`);
            onProgress(myBlockNumber,pctDone)
        }

        // Async call to getBlock() means we can run more than 1 thread
        // at a time, which is MUCH faster for scanning.
        web3.eth.getBlock(myBlockNumber, true, (error, block) => {
            if (error) {
                // Error retrieving this block
                gotError = true;
                console.error("Error:", error);
            } else {
                scanBlockCallback(wallets,block,onFoundTx);
                asyncScanNextBlock();
            }
        });
    }
    var nt;
    for (nt = 0; nt < maxThreads && startingBlock + nt <= stoppingBlock; nt++) {
        numThreads++;
        asyncScanNextBlock();
    }

    return nt; // number of threads spawned (they'll continue processing)
}
