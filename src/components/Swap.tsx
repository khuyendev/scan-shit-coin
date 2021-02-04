import React, { useEffect, useState } from 'react';
import { Table, Tag, Space } from 'antd';
import web3 from "../utils/infura";
function Swap(props:any) {
    const {record} = props
    return(
        <Space size="middle" >
         <Tag color={"red"} >
              <a key={record.hash}  href={"https://etherscan.io/address/"+record?.addressIn} target="_blank" rel="noreferrer" >{web3.utils.fromWei(record?.amountInValue ,record?.decimalsIn===18?'ether':'lovelace')+" "+record?.symbolIn}</a>
        </Tag>
        {'=>'}
        <Tag color={"blue"} >
            <a key={record.blockHash}  href={"https://etherscan.io/address/"+record?.addressOut} target="_blank" rel="noreferrer" >{web3.utils.fromWei(record?.amountOutValue ,record?.decimalsOut===18?'ether':'lovelace')+" "+record?.symbolOut}</a>
        </Tag>
        </Space>
    )
}
function arePropsAreEqual(prevProps, nextProps) {
    return prevProps.hash === prevProps.hash
  }
  
const MemoizedSwap = React.memo(Swap, arePropsAreEqual);
export default MemoizedSwap;