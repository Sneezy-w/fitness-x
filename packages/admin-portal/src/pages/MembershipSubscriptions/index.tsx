import { getMembers } from '@/services/service/members';
import {
  createMembershipSubscription,
  deleteMembershipSubscription,
  getMembershipSubscriptions,
  updateMembershipSubscription,
} from '@/services/service/membership-subscriptions';
import { getMembershipTypes } from '@/services/service/membership-types';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

const MembershipSubscriptionsPage = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] =
    useState<API.Service.MembershipSubscription | null>(null);
  const [form] = Form.useForm();
  const [membershipTypes, setMembershipTypes] = useState<
    API.Service.MembershipType[]
  >([]);
  const [members, setMembers] = useState<API.Service.Member[]>([]);

  useEffect(() => {
    const fetchMembershipTypes = async () => {
      try {
        const response = await getMembershipTypes();
        setMembershipTypes(response.data || []);
      } catch (error) {
        console.error('Error fetching membership types:', error);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await getMembers();
        setMembers(response.data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembershipTypes();
    fetchMembers();
  }, []);

  const showCreateModal = () => {
    setModalType('create');
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: API.Service.MembershipSubscription) => {
    setModalType('edit');
    setCurrentRecord(record);
    form.setFieldsValue({
      member_id: record.member_id,
      membership_type_id: record.membership_type_id,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
      remaining_classes: record.remaining_classes,
      is_active: record.is_active,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Format dates for API
      if (values.start_date) {
        values.start_date = values.start_date.format('YYYY-MM-DD');
      }
      if (values.end_date) {
        values.end_date = values.end_date.format('YYYY-MM-DD');
      }

      if (modalType === 'create') {
        await createMembershipSubscription(values);
        message.success('Membership subscription created successfully');
      } else {
        await updateMembershipSubscription(currentRecord!.id, values);
        message.success('Membership subscription updated successfully');
      }

      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this subscription?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMembershipSubscription(id);
          message.success('Subscription deleted successfully');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to delete subscription');
          console.error('Error:', error);
        }
      },
    });
  };

  const columns: ProColumns<API.Service.MembershipSubscription>[] = [
    {
      title: 'Member',
      dataIndex: ['member', 'full_name'],
      key: 'member',
    },
    {
      title: 'Membership Type',
      dataIndex: ['membership_type', 'name'],
      key: 'membership_type',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (text) =>
        text ? dayjs(text as string).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (text) =>
        text ? dayjs(text as string).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Remaining Classes',
      dataIndex: 'remaining_classes',
      key: 'remaining_classes',
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
      render: (_, record) => (
        <span style={{ color: record.is_active ? 'green' : 'red' }}>
          {record.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Service.MembershipSubscription>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getMembershipSubscriptions();
          return {
            data: data.data || [],
            success: true,
          };
        }}
        search={false}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="Membership Subscriptions"
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={showCreateModal}>
            Create New Subscription
          </Button>,
        ]}
      />

      <Modal
        title={
          modalType === 'create'
            ? 'Create Membership Subscription'
            : 'Edit Membership Subscription'
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {modalType === 'create' && (
            <>
              <Form.Item
                name="member_id"
                label="Member"
                rules={[{ required: true, message: 'Please select a member' }]}
              >
                <Select
                  showSearch
                  placeholder="Select a member"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={members.map((member) => ({
                    value: member.id,
                    label: member.full_name,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="membership_type_id"
                label="Membership Type"
                rules={[
                  {
                    required: true,
                    message: 'Please select a membership type',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select a membership type"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={membershipTypes.map((type) => ({
                    value: type.id,
                    label: type.name,
                  }))}
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: 'Please select a start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_date" label="End Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="remaining_classes"
            label="Remaining Classes"
            rules={[
              {
                required: modalType === 'create',
                message: 'Please enter remaining classes',
              },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          {modalType === 'edit' && (
            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default MembershipSubscriptionsPage;
