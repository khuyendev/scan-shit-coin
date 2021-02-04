import React from 'react';

import { Table, Input, Button, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import Swap from './Swap';


class TableData extends React.Component<any> {
  state = {
    searchText: '',
    searchedColumn: '',
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value.toLowerCase()] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              this.setState({
                searchText: selectedKeys[0],
                searchedColumn: dataIndex,
              });
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>{
      if(record[dataIndex]){
        if(Object.keys(record[dataIndex]).length>0){
          return record?.symbolIn.toLowerCase().includes(value.toLowerCase()) ||record?.symbolOut.toLowerCase().includes(value.toLowerCase())
        }
        return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      }
      return ''
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render:  (text, record)  =>{
      if(this.state.searchedColumn === dataIndex ){
        if(dataIndex==='inputDecode'){
          return  <Swap record={record} key={record.hash}/>
        }
        return (
          <a href={"https://etherscan.io/address/"+text} target="_blank" rel="noreferrer">
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
          </a>
        )
      }else{
        if(dataIndex==='inputDecode'){
          return  <Swap record={record} key={record.hash}/>
        }
        return (
          <Space size="middle">
          <a href={"https://etherscan.io/address/"+text} target="_blank" rel="noreferrer">{text}</a>
        </Space>
        )
      }
    },
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };
    searchInput: Input;

  render() {
    const columns = [
        {
          title: 'Wallet',
          dataIndex: 'from',
          key: 'from',
          render: (text, record) => (
            <Space size="middle">
              <a href={"https://etherscan.io/address/"+record.from} target="_blank" rel="noreferrer">{record.from}</a>
            </Space>
          ),
          ...this.getColumnSearchProps('from'),
        },
        {
          title: 'Swap',
          dataIndex: 'inputDecode',
          key: 'inputDecode',
          render: (text, record) => (
            <Swap record={record} key={record.hash}/>
          ),
          ...this.getColumnSearchProps('inputDecode'),
        },
        {
          title: 'Date',
          dataIndex: 'timeStampString',
          key: 'timeStampString',
        },
        {
          title: 'Explore',
          dataIndex: 'hash',
          key: 'hash',
          render: (text, record) => (
            <Space size="middle">
              <a href={"https://etherscan.io/tx/"+record.hash} target="_blank" rel="noreferrer">Explore</a>
            </Space>
          ),
        },
      ];
    return <Table columns={columns} dataSource={this.props.result} />;
  }
}
export default TableData