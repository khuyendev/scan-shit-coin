import abiDecoder  from 'abi-decoder';
import TokenAbi from '../abi/TokenAbi';
import UniswapAbi from '../abi/UniswapAbi';
abiDecoder.addABI(TokenAbi);
abiDecoder.addABI(UniswapAbi);
export default abiDecoder