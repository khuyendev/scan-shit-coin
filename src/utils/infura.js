import Web3 from 'web3';

let web3:any ;
// eslint-disable-next-line no-undef
if (window.ethereum !== undefined) {
  // eslint-disable-next-line no-undef
  web3 = new Web3(ethereum);
}

async function test() {

    // var subscription = web3.eth.subscribe('logs', {
    //     address: '0x7Ed2cde6441191169fbD9a40e305727F61925174',
    // }, function(error, result){
    //     if (!error)
    //         console.log(result);
    // })
    // .on("connected", function(subscriptionId){
    //     console.log("connected")
    //     console.log(subscriptionId);
    // })
    // .on("data", function(log){
    //     console.log("data")
    //     console.log(log);
    // })
    // .on("changed", function(log){
    //     console.log("changed")
    //     console.log(log)
    // });

// web3.eth.getTransaction('0xd46f0d9b9478396624f865a8eec10df44003fd0fb9635f13c1c073737317e3e2')
// .then((r)=>{
//   const decodedData = abiDecoder.decodeMethod(r.input);
//   console.log(decodedData)
// });
}
export default web3;