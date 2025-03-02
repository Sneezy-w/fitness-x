import {
  activateMember,
  deactivateMember,
  getMembers,
} from '@/services/service/members';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef } from 'react';

const MembersPage = () => {
  //const access = useAccess();
  // const [tableParams, setTableParams] = useState({
  //   current: 1,
  //   pageSize: 10,
  // });

  const actionRef = useRef<ActionType>();

  // const { data, loading } = useRequest(getMembers, {
  //   refreshDeps: [tableParams],
  // });

  const columns: ProColumns<API.Service.Member>[] = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   key: 'id',
    // },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      valueEnum: {
        true: {
          text: 'Active',
          status: 'Success',
        },
        false: {
          text: 'Inactive',
          status: 'Error',
        },
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.is_active) {
          return (
            <Button
              type="primary"
              danger
              onClick={async () => {
                await deactivateMember(record.id);
                actionRef.current?.reload();
              }}
            >
              Deactivate
            </Button>
          );
        }
        return (
          <Button
            type="primary"
            onClick={async () => {
              await activateMember(record.id);
              actionRef.current?.reload();
            }}
          >
            Activate
          </Button>
        );
      },
    },
  ];

  return (
    <PageContainer ghost>
      <ProTable<API.Service.Member>
        columns={columns}
        actionRef={actionRef}
        //dataSource={data}
        //loading={loading}
        // pagination={{
        //   total: data?.length,
        //   ...tableParams,
        // }}
        // onChange={(pagination) => {
        //   setTableParams({
        //     current: pagination.current || 1,
        //     pageSize: pagination.pageSize || 10,
        //   });
        // }}
        request={async () => {
          const data = await getMembers();
          // return {
          //   data: data.data,
          //   success: true,
          //   total: data.data?.length,
          // };
          return data;
        }}
        search={false}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        toolbar={
          {
            //title: 'Members',
            //subTitle: 'Manage your members',
            //search: false,
          }
        }
        scroll={{ x: 'max-content' }}
        cardProps={{
          bodyStyle: { padding: 0 },
        }}
        options={{
          fullScreen: true,
          reload: true,
          density: true,
        }}
      />
    </PageContainer>
  );
};

export default MembersPage;
